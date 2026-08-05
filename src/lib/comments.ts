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
    const { error } = await supabase.from('creative_comments').insert({
      creative_id: creativeId,
      author_name: authorName,
      body,
    })
    if (!error) return comment
    // fall through to local storage on error (e.g. table not migrated yet)
  }

  const existing = loadLocal(creativeId)
  const updated = [...existing, comment]
  saveLocal(creativeId, updated)
  return comment
}
