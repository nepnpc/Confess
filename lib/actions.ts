'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  addConfession,
  deleteConfessionById,
  updateConfessionStatus,
  incrementLikes,
} from './db'
import {
  signAdminToken,
  getAdminPassword,
  setAdminCookie,
  clearAdminCookie,
  isAdmin,
} from './auth'

export interface ActionState {
  error?: string
  success?: boolean
  message?: string
}

// ── Confession submission ──────────────────────────────────────────────────

export async function submitConfession(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const text = (formData.get('text') as string | null)?.trim() ?? ''
  const category = (formData.get('category') as string | null) ?? ''
  const redactedRaw = (formData.get('redactedWords') as string | null) ?? '[]'

  if (text.length < 20) {
    return { error: 'A confession needs at least 20 characters.' }
  }
  if (text.length > 600) {
    return { error: 'Keep it under 600 characters.' }
  }
  if (!category) {
    return { error: 'Choose a category.' }
  }

  let redactedWords: string[] = []
  try {
    const parsed = JSON.parse(redactedRaw)
    if (Array.isArray(parsed)) {
      const textLower = text.toLowerCase()
      redactedWords = parsed
        .filter((w): w is string => typeof w === 'string' && w.length >= 3)
        .filter((w) => textLower.includes(w.toLowerCase()))
        .slice(0, 20) // cap at 20 redactions
    }
  } catch {
    // ignore malformed JSON, proceed with no redactions
  }

  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const year = now.getFullYear()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const timestamp = `${month}.${day}.${year} — ${hh}:${mm}`

  const suffix = String(Math.floor(Math.random() * 999)).padStart(3, '0')

  addConfession({
    id: crypto.randomUUID(),
    text,
    category,
    handle: `ANONYMOUS_${suffix}`,
    timestamp,
    createdAt: Date.now(),
    likes: 0,
    views: 0,
    status: 'pending',
    redactedWords,
  })

  return {
    success: true,
    message: 'Received. Your confession is pending review.',
  }
}

// ── Likes ──────────────────────────────────────────────────────────────────

export async function likeConfession(id: string): Promise<number> {
  return incrementLikes(id)
}

// ── Admin: login / logout ──────────────────────────────────────────────────

export async function adminLogin(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = (formData.get('password') as string | null) ?? ''

  if (password !== getAdminPassword()) {
    return { error: 'Invalid password.' }
  }

  const token = await signAdminToken()
  await setAdminCookie(token)

  redirect('/admin')
}

export async function adminLogout(): Promise<void> {
  await clearAdminCookie()
  redirect('/admin/login')
}

// ── Admin: confession management ──────────────────────────────────────────

export async function approveConfession(id: string): Promise<void> {
  if (!(await isAdmin())) throw new Error('Unauthorized')
  updateConfessionStatus(id, 'approved')
  revalidatePath('/')
  revalidatePath('/admin')
}

export async function rejectConfession(id: string): Promise<void> {
  if (!(await isAdmin())) throw new Error('Unauthorized')
  updateConfessionStatus(id, 'rejected')
  revalidatePath('/admin')
}

export async function deleteConfession(id: string): Promise<void> {
  if (!(await isAdmin())) throw new Error('Unauthorized')
  deleteConfessionById(id)
  revalidatePath('/')
  revalidatePath('/admin')
}
