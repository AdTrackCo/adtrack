import { supabase, isSupabaseConfigured } from './supabase'

export interface Brand {
  id: string
  name: string
  color: string | null
  voiceGuidelines: string | null
  createdAt: string
}

export interface BrandInput {
  name: string
  color: string
  voiceGuidelines: string
}

export class MissingBrandsTableError extends Error {
  constructor() {
    super('The brands table is missing. Run supabase/migrations/0001_init.sql in your Supabase SQL editor.')
    this.name = 'MissingBrandsTableError'
  }
}

function isMissingTable(error: { code?: string } | null): boolean {
  return error?.code === '42P01' || error?.code === 'PGRST205'
}

interface DbBrandRow {
  id: string
  name: string
  color: string | null
  voice_guidelines: string | null
  created_at: string
}

function mapRow(row: DbBrandRow): Brand {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    voiceGuidelines: row.voice_guidelines,
    createdAt: row.created_at,
  }
}

export async function listBrands(): Promise<Brand[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase
    .from('brands')
    .select('id, name, color, voice_guidelines, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    if (isMissingTable(error)) throw new MissingBrandsTableError()
    throw new Error(error.message)
  }
  return (data as DbBrandRow[]).map(mapRow)
}

export async function createBrand(input: BrandInput): Promise<Brand> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('You must be signed in to add a brand.')

  const { data, error } = await supabase
    .from('brands')
    .insert({
      user_id: userData.user.id,
      name: input.name,
      color: input.color || null,
      voice_guidelines: input.voiceGuidelines || null,
    })
    .select('id, name, color, voice_guidelines, created_at')
    .single()

  if (error) {
    if (isMissingTable(error)) throw new MissingBrandsTableError()
    throw new Error(error.message)
  }
  return mapRow(data as DbBrandRow)
}

export async function updateBrand(id: string, input: BrandInput): Promise<Brand> {
  const { data, error } = await supabase
    .from('brands')
    .update({
      name: input.name,
      color: input.color || null,
      voice_guidelines: input.voiceGuidelines || null,
    })
    .eq('id', id)
    .select('id, name, color, voice_guidelines, created_at')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Brand not found, or you do not have permission to edit it.')
  return mapRow(data as DbBrandRow)
}

export async function deleteBrand(id: string): Promise<void> {
  const { error } = await supabase.from('brands').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
