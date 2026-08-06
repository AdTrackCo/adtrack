import { supabase, isSupabaseConfigured } from './supabase'

export interface Comment {
  id: string
  creativeId: string
  authorName: string
  body: string
  createdAt: string
}

const LOCAL_KEY = (creativeId: string) => `adtrack_comments_${creativeId}`

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
    const { data, error } = await supabase
      .from('creative_comments')
      .select('id, creative_id, author_name, body, created_at')
      .eq('creative_id', creativeId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        creativeId: row.creative_id,
        authorName: row.author_name,
        body: row.body,
        createdAt: row.created_at,
      }))
    }
    // Table likely doesn't exist yet (migrations not run) — fall back silently.
  }
  return loadLocal(creativeId)
}

export async function addComment(creativeId: string, authorName: string, body: string): Promise<Comment> {
  const comment: Comment = {
    id: crypto.randomUUID(),
    creativeId,
    authorName,
    body,
    createdAt: new Date().toISOString(),
  }

  if (isSupabaseConfigured) {
    // creative_comments.user_id is NOT NULL and RLS requires it to match the
    // signed-in user — this was previously omitted, which made every insert
    // fail (silently) and fall back to localStorage, which then got shadowed
    // by a legitimate-but-empty Supabase read on the next page load.
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    if (userId) {
      const { error } = await supabase.from('creative_comments').insert({
        creative_id: creativeId,
        user_id: userId,
        author_name: authorName,
        body,
      })
      if (!error) return comment
      // Only fall through to local storage if the table itself is missing
      // (migrations not run yet) — any other error should be visible.
      const missingTable = error.code === '42P01' || error.code === 'PGRST205'
      if (!missingTable) throw new Error(error.message)
    }
  }

  const existing = loadLocal(creativeId)
  const updated = [...existing, comment]
  saveLocal(creativeId, updated)
  return comment
}
