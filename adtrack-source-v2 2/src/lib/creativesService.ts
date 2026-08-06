import { supabase, isSupabaseConfigured } from './supabase'
import type { CreativeSet, CreativeStatus, CreativeVariant, Platform } from '@/types'

export class MissingTablesError extends Error {
  constructor() {
    super(
      'Database tables not found. Run supabase/migrations/0001_init.sql in your Supabase SQL editor to create them.'
    )
    this.name = 'MissingTablesError'
  }
}

function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  // 42P01 = undefined_table; PGRST205 = schema cache miss for unknown table
  return error.code === '42P01' || error.code === 'PGRST205' || /does not exist/i.test(error.message || '')
}

export interface NewVariantInput {
  file: File | null
  placementLabel: string
  width: number
  height: number
}

export interface NewCreativeInput {
  name: string
  platform: Platform
  format: string
  funnelStage: string
  angle: string
  hookType: string
  version: number
  status: CreativeStatus
  hookText: string
  primaryText: string
  headline: string
  description: string
  cta: string
  notes: string
  complianceScore: number
  variants: NewVariantInput[]
}

interface DbVariantRow {
  id: string
  placement_label: string
  width: number
  height: number
  asset_type: 'image' | 'video'
  asset_url: string | null
}

interface DbSetRow {
  id: string
  name: string
  platform: string
  format: string
  funnel_stage: string
  angle: string
  hook_type: string
  version: number
  status: string
  hook_text: string | null
  primary_text: string | null
  headline: string | null
  description: string | null
  cta: string | null
  notes: string | null
  compliance_score: number | null
  created_at: string
  creative_variants: DbVariantRow[] | null
}

function mapRow(row: DbSetRow): CreativeSet {
  const variants: CreativeVariant[] = (row.creative_variants || []).map((v) => ({
    id: v.id,
    placementLabel: v.placement_label,
    width: v.width,
    height: v.height,
    assetType: v.asset_type,
    assetUrl: v.asset_url ?? undefined,
  }))

  return {
    id: row.id,
    name: row.name,
    platform: row.platform as Platform,
    format: row.format as CreativeSet['format'],
    funnelStage: row.funnel_stage as CreativeSet['funnelStage'],
    angle: row.angle as CreativeSet['angle'],
    hookType: row.hook_type as CreativeSet['hookType'],
    version: row.version,
    status: row.status as CreativeStatus,
    // Performance metrics come from the `metrics` table once a platform is
    // connected; until then a freshly uploaded creative simply has no data.
    roas: 0,
    ctr: 0,
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    complianceScore: row.compliance_score ?? 0,
    hookText: row.hook_text ?? '',
    primaryText: row.primary_text ?? '',
    headline: row.headline ?? '',
    description: row.description ?? '',
    cta: row.cta ?? '',
    notes: row.notes ?? '',
    variants,
    thumbnailUrl: variants.find((v) => v.assetUrl)?.assetUrl,
    createdAt: row.created_at,
  }
}

export async function listCreativeSets(): Promise<CreativeSet[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase
    .from('creative_sets')
    .select(
      'id, name, platform, format, funnel_stage, angle, hook_type, version, status, hook_text, primary_text, headline, description, cta, notes, compliance_score, created_at, creative_variants(id, placement_label, width, height, asset_type, asset_url)'
    )
    .order('created_at', { ascending: false })

  if (error) {
    if (isMissingTable(error)) throw new MissingTablesError()
    throw new Error(error.message)
  }

  return (data as unknown as DbSetRow[]).map(mapRow)
}

async function uploadAsset(userId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^\w.\-]/g, '_')
  const path = `${userId}/${Date.now()}-${safeName}`

  const { error } = await supabase.storage.from('creative-assets').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw new Error(
      /bucket/i.test(error.message)
        ? 'Storage bucket "creative-assets" not found. Run the migration SQL to create it.'
        : `Asset upload failed: ${error.message}`
    )
  }

  const { data } = supabase.storage.from('creative-assets').getPublicUrl(path)
  return data.publicUrl
}

export async function createCreativeSet(input: NewCreativeInput): Promise<CreativeSet> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('You must be signed in to upload a creative.')
  const userId = userData.user.id

  const { data: setRow, error: setError } = await supabase
    .from('creative_sets')
    .insert({
      user_id: userId,
      name: input.name,
      platform: input.platform,
      format: input.format,
      funnel_stage: input.funnelStage,
      angle: input.angle,
      hook_type: input.hookType,
      version: input.version,
      status: input.status,
      hook_text: input.hookText,
      primary_text: input.primaryText,
      headline: input.headline,
      description: input.description,
      cta: input.cta,
      notes: input.notes,
      compliance_score: input.complianceScore,
    })
    .select('id')
    .single()

  if (setError) {
    if (isMissingTable(setError)) throw new MissingTablesError()
    throw new Error(setError.message)
  }

  const setId = (setRow as { id: string }).id

  // Upload each variant's asset, then insert the variant rows.
  const variantRows = []
  for (const variant of input.variants) {
    let assetUrl: string | null = null
    let assetType: 'image' | 'video' = 'image'

    if (variant.file) {
      assetType = variant.file.type.startsWith('video') ? 'video' : 'image'
      try {
        assetUrl = await uploadAsset(userId, variant.file)
      } catch (err) {
        // Roll back the parent row so we don't leave an orphaned creative set.
        await supabase.from('creative_sets').delete().eq('id', setId)
        throw err
      }
    }

    variantRows.push({
      creative_set_id: setId,
      user_id: userId,
      placement_label: variant.placementLabel,
      width: variant.width,
      height: variant.height,
      asset_type: assetType,
      asset_url: assetUrl,
    })
  }

  if (variantRows.length > 0) {
    const { error: variantError } = await supabase.from('creative_variants').insert(variantRows)
    if (variantError) {
      await supabase.from('creative_sets').delete().eq('id', setId)
      throw new Error(`Could not save size variants: ${variantError.message}`)
    }
  }

  const created = await getCreativeSet(setId)
  if (!created) throw new Error('Creative was saved but could not be loaded back.')
  return created
}

export async function getCreativeSet(id: string): Promise<CreativeSet | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('creative_sets')
    .select(
      'id, name, platform, format, funnel_stage, angle, hook_type, version, status, hook_text, primary_text, headline, description, cta, notes, compliance_score, created_at, creative_variants(id, placement_label, width, height, asset_type, asset_url)'
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    if (isMissingTable(error)) throw new MissingTablesError()
    throw new Error(error.message)
  }
  if (!data) return null
  return mapRow(data as unknown as DbSetRow)
}

export async function updateCreativeStatus(id: string, status: CreativeStatus): Promise<void> {
  const { error } = await supabase.from('creative_sets').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
}

export interface EditableCreativeFields {
  platform: Platform
  format: string
  funnelStage: string
  angle: string
  hookType: string
  version: number
  status: CreativeStatus
  hookText: string
  primaryText: string
  headline: string
  description: string
  cta: string
  notes: string
  complianceScore: number
}

/**
 * Updates a creative set's metadata/copy fields. Does NOT touch assets or
 * size variants — swapping images isn't supported yet, only editing the
 * details captured at upload time.
 */
export async function updateCreativeSet(id: string, name: string, fields: EditableCreativeFields): Promise<CreativeSet> {
  const { error } = await supabase
    .from('creative_sets')
    .update({
      name,
      platform: fields.platform,
      format: fields.format,
      funnel_stage: fields.funnelStage,
      angle: fields.angle,
      hook_type: fields.hookType,
      version: fields.version,
      status: fields.status,
      hook_text: fields.hookText,
      primary_text: fields.primaryText,
      headline: fields.headline,
      description: fields.description,
      cta: fields.cta,
      notes: fields.notes,
      compliance_score: fields.complianceScore,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  const updated = await getCreativeSet(id)
  if (!updated) throw new Error('Creative was updated but could not be loaded back.')
  return updated
}

export async function deleteCreativeSet(id: string): Promise<void> {
  const { error } = await supabase.from('creative_sets').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function duplicateCreativeSet(id: string): Promise<CreativeSet> {
  const original = await getCreativeSet(id)
  if (!original) throw new Error('Creative not found.')

  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error('You must be signed in.')

  const nextVersion = original.version + 1
  const newName = original.name.replace(/_v\d+$/, `_v${nextVersion}`)

  const { data: setRow, error } = await supabase
    .from('creative_sets')
    .insert({
      user_id: userId,
      name: newName,
      platform: original.platform,
      format: original.format,
      funnel_stage: original.funnelStage,
      angle: original.angle,
      hook_type: original.hookType,
      version: nextVersion,
      status: 'Draft',
      hook_text: original.hookText,
      primary_text: original.primaryText,
      headline: original.headline,
      description: original.description,
      cta: original.cta,
      notes: original.notes,
      compliance_score: original.complianceScore,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  const newId = (setRow as { id: string }).id

  if (original.variants.length > 0) {
    // Variants reference the same stored asset — no need to re-upload files.
    await supabase.from('creative_variants').insert(
      original.variants.map((v) => ({
        creative_set_id: newId,
        user_id: userId,
        placement_label: v.placementLabel,
        width: v.width,
        height: v.height,
        asset_type: v.assetType,
        asset_url: v.assetUrl ?? null,
      }))
    )
  }

  const created = await getCreativeSet(newId)
  if (!created) throw new Error('Duplicate was created but could not be loaded.')
  return created
}
