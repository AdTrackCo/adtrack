import { supabase, isSupabaseConfigured } from './supabase'

export interface Comment {
  id: string
  creativeId: string
  authorName: string
  body: string
  createdAt: string
  editedAt?: string
  /** True when this comment was written by the currently signed-in user. */
  isMine: boolean
}

const LOCAL_KEY = (creativeId: string) => `adtrack_comments_${creativeId}`

function isMissingTable(error: { code?: string } | null): boolean {
  return error?.code === '42P01' || error?.code === 'PGRST205'
}

/** 42703 = undefined_column. The edited_at column ships in migration 0003; if
 *  the user hasn't run it yet we still want edit/delete to work. */
function isMissingColumn(error: { code?: string } | null): boolean {
  return error?.code === '42703'
}

function loadLocal(creativeId: string): Comment[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY(creativeId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocal(creativeId: string, comments: Comment[]) {
  localStorage.setItem(LOCAL_KEY(creativeId), JSON.stringify(comments))
}

export async function getComments(creativeId: string): Promise<Comment[]> {
  if (isSupabaseConfigured) {
    const { data: userData } = await supabase.auth.getUser()
    const currentUserId = userData.user?.id

    // Select * rather than named columns so a not-yet-migrated edited_at
    // column doesn't break the whole query.
    const { data, error } = await supabase
      .from('creative_comments')
      .select('*')
      .eq('creative_id', creativeId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      return (data as any[]).map((row) => ({
        id: row.id,
        creativeId: row.creative_id,
        authorName: row.author_name,
        body: row.body,
        createdAt: row.created_at,
        editedAt: row.edited_at ?? undefined,
        isMine: !!currentUserId && row.user_id === currentUserId,
      }))
    }
    // Table likely doesn't exist yet (migrations not run) — fall back silently.
  }
  return loadLocal(creativeId)
}

export async function addComment(creativeId: string, authorName: string, body: string): Promise<Comment> {
  if (isSupabaseConfigured) {
    // creative_comments.user_id is NOT NULL and RLS requires it to match the
    // signed-in user — this was previously omitted, which made every insert
    // fail (silently) and fall back to localStorage, which then got shadowed
    // by a legitimate-but-empty Supabase read on the next page load.
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    if (userId) {
      // Select the row back so we return the database's real id — the UI needs
      // it to edit or delete the comment without a page refresh first.
      const { data, error } = await supabase
        .from('creative_comments')
        .insert({ creative_id: creativeId, user_id: userId, author_name: authorName, body })
        .select('id, creative_id, author_name, body, created_at')
        .single()

      if (!error && data) {
        const row = data as any
        return {
          id: row.id,
          creativeId: row.creative_id,
          authorName: row.author_name,
          body: row.body,
          createdAt: row.created_at,
          isMine: true,
        }
      }
      // Only fall through to local storage if the table itself is missing
      // (migrations not run yet) — any other error should be visible.
      if (error && !isMissingTable(error)) throw new Error(error.message)
    }
  }

  const comment: Comment = {
    id: crypto.randomUUID(),
    creativeId,
    authorName,
    body,
    createdAt: new Date().toISOString(),
    isMine: true,
  }
  const updated = [...loadLocal(creativeId), comment]
  saveLocal(creativeId, updated)
  return comment
}

export async function updateComment(creativeId: string, id: string, body: string): Promise<Comment> {
  if (isSupabaseConfigured) {
    const now = new Date().toISOString()

    let { data, error } = await supabase
      .from('creative_comments')
      .update({ body, edited_at: now })
      .eq('id', id)
      .select('*')
      .maybeSingle()

    // Retry without edited_at for users who haven't run migration 0003.
    if (error && isMissingColumn(error)) {
      ;({ data, error } = await supabase
        .from('creative_comments')
        .update({ body })
        .eq('id', id)
        .select('*')
        .maybeSingle())
    }

    if (!error && data) {
      const row = data as any
      return {
        id: row.id,
        creativeId: row.creative_id,
        authorName: row.author_name,
        body: row.body,
        createdAt: row.created_at,
        editedAt: row.edited_at ?? undefined,
        isMine: true,
      }
    }

    if (error && !isMissingTable(error)) throw new Error(error.message)
    // RLS blocks updating someone else's comment — the update succeeds with
    // zero rows rather than erroring, so surface that clearly.
    if (!error && !data) throw new Error('You can only edit your own comments.')
  }

  const existing = loadLocal(creativeId)
  const target = existing.find((c) => c.id === id)
  if (!target) throw new Error('Comment not found.')
  const updated = existing.map((c) => (c.id === id ? { ...c, body, editedAt: new Date().toISOString() } : c))
  saveLocal(creativeId, updated)
  return { ...target, body, editedAt: new Date().toISOString() }
}

export async function deleteComment(creativeId: string, id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('creative_comments').delete().eq('id', id).select('id')

    if (!error) {
      if (data && data.length > 0) return
      // Zero rows deleted means RLS blocked it (not your comment), unless we're
      // dealing with a localStorage-only comment — check before erroring.
      const local = loadLocal(creativeId)
      if (!local.some((c) => c.id === id)) throw new Error('You can only delete your own comments.')
    } else if (!isMissingTable(error)) {
      throw new Error(error.message)
    }
  }

  const existing = loadLocal(creativeId)
  saveLocal(
    creativeId,
    existing.filter((c) => c.id !== id)
  )
}
