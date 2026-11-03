import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function admin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase server env vars')
  return createClient(url, key, { auth: { persistSession: false } })
}

async function requireOwner(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return null
  const a = admin()
  const { data: userData, error } = await a.auth.getUser(token)
  if (error || !userData.user) return null
  const { data: row } = await a.from('admin_users').select('role').eq('id', userData.user.id).maybeSingle()
  if (!row || row.role !== 'owner') return null
  return { a, callerId: userData.user.id }
}

async function ownerCount(a: ReturnType<typeof admin>) {
  const { count } = await a.from('admin_users').select('*', { count: 'exact', head: true }).eq('role', 'owner')
  return count || 0
}

const cleanPerms = (p: unknown): string[] =>
  Array.isArray(p) ? p.filter(x => typeof x === 'string') : []

// GET — list all admins
export async function GET(req: Request) {
  const ctx = await requireOwner(req)
  if (!ctx) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  const { data, error } = await ctx.a.from('admin_users').select('id, email, role, permissions, created_at').order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ editors: data })
}

// POST — create { email, password, role, permissions }
export async function POST(req: Request) {
  const ctx = await requireOwner(req)
  if (!ctx) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  const { email, password, role, permissions } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  const a = ctx.a
  const { data: created, error: cErr } = await a.auth.admin.createUser({ email, password, email_confirm: true })
  if (cErr || !created.user) return NextResponse.json({ error: cErr?.message || 'Create failed' }, { status: 500 })
  const isOwner = role === 'owner'
  const { error: iErr } = await a.from('admin_users').insert({
    id: created.user.id, email,
    role: isOwner ? 'owner' : 'editor',
    permissions: isOwner ? [] : cleanPerms(permissions),
  })
  if (iErr) { await a.auth.admin.deleteUser(created.user.id); return NextResponse.json({ error: iErr.message }, { status: 500 }) }
  return NextResponse.json({ ok: true })
}

// PATCH — update { id, role?, permissions? }
export async function PATCH(req: Request) {
  const ctx = await requireOwner(req)
  if (!ctx) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  const { id, role, permissions } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const a = ctx.a

  const { data: target } = await a.from('admin_users').select('role').eq('id', id).maybeSingle()
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const update: Record<string, unknown> = {}
  if (typeof role === 'string') {
    // Prevent demoting the last owner.
    if (target.role === 'owner' && role !== 'owner' && (await ownerCount(a)) <= 1) {
      return NextResponse.json({ error: 'Cannot demote the last owner.' }, { status: 400 })
    }
    update.role = role === 'owner' ? 'owner' : 'editor'
    if (role === 'owner') update.permissions = []   // owners have full access
  }
  if (Array.isArray(permissions)) update.permissions = cleanPerms(permissions)

  const { error } = await a.from('admin_users').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE — remove { id }. Owners cannot be deleted (demote first).
export async function DELETE(req: Request) {
  const ctx = await requireOwner(req)
  if (!ctx) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const a = ctx.a
  const { data: target } = await a.from('admin_users').select('role').eq('id', id).maybeSingle()
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (target.role === 'owner') {
    return NextResponse.json({ error: 'Owners cannot be removed. Change their role to Editor first.' }, { status: 400 })
  }
  const { error } = await a.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await a.from('admin_users').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}