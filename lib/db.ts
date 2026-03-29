import { createClient } from '@libsql/client'

export type ConfessionStatus = 'pending' | 'approved' | 'rejected'

export interface Confession {
  id: string
  text: string
  category: string
  handle: string
  timestamp: string
  createdAt: number
  likes: number
  views: number
  status: ConfessionStatus
  redactedWords: string[]
}

function getClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL ?? 'file:./data/local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
}

/** Map a raw DB row to a typed Confession */
function rowToConfession(row: Record<string, unknown>): Confession {
  return {
    id: row.id as string,
    text: row.text as string,
    category: row.category as string,
    handle: row.handle as string,
    timestamp: row.timestamp as string,
    createdAt: row.created_at as number,
    likes: row.likes as number,
    views: row.views as number,
    status: row.status as ConfessionStatus,
    redactedWords: JSON.parse((row.redacted_words as string) ?? '[]'),
  }
}

export async function getConfessions(): Promise<Confession[]> {
  const db = getClient()
  const result = await db.execute(
    'SELECT * FROM confessions ORDER BY created_at DESC'
  )
  return result.rows.map(rowToConfession)
}

export async function getApprovedConfessions(): Promise<Confession[]> {
  const db = getClient()
  const result = await db.execute(
    "SELECT * FROM confessions WHERE status = 'approved' ORDER BY created_at DESC"
  )
  return result.rows.map(rowToConfession)
}

export async function addConfession(c: Confession): Promise<void> {
  const db = getClient()
  await db.execute({
    sql: `INSERT INTO confessions
            (id, text, category, handle, timestamp, created_at, likes, views, status, redacted_words)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      c.id,
      c.text,
      c.category,
      c.handle,
      c.timestamp,
      c.createdAt,
      c.likes,
      c.views,
      c.status,
      JSON.stringify(c.redactedWords),
    ],
  })
}

export async function deleteConfessionById(id: string): Promise<void> {
  const db = getClient()
  await db.execute({ sql: 'DELETE FROM confessions WHERE id = ?', args: [id] })
}

export async function updateConfessionStatus(
  id: string,
  status: ConfessionStatus
): Promise<void> {
  const db = getClient()
  await db.execute({
    sql: 'UPDATE confessions SET status = ? WHERE id = ?',
    args: [status, id],
  })
}

export async function incrementLikes(id: string): Promise<number> {
  const db = getClient()
  await db.execute({
    sql: 'UPDATE confessions SET likes = likes + 1 WHERE id = ?',
    args: [id],
  })
  const result = await db.execute({
    sql: 'SELECT likes FROM confessions WHERE id = ?',
    args: [id],
  })
  return (result.rows[0]?.likes as number) ?? 0
}

export async function getStats(): Promise<{
  total: number
  pending: number
  approved: number
  rejected: number
  totalLikes: number
  totalViews: number
}> {
  const db = getClient()
  const result = await db.execute(`
    SELECT
      COUNT(*)                                          AS total,
      SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
      SUM(likes)                                        AS total_likes,
      SUM(views)                                        AS total_views
    FROM confessions
  `)
  const row = result.rows[0]
  return {
    total:      Number(row.total      ?? 0),
    pending:    Number(row.pending    ?? 0),
    approved:   Number(row.approved   ?? 0),
    rejected:   Number(row.rejected   ?? 0),
    totalLikes: Number(row.total_likes ?? 0),
    totalViews: Number(row.total_views ?? 0),
  }
}
