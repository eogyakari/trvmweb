import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function admin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase server env vars')
  return createClient(url, key, { auth: { persistSession: false } })
}

// Verify the caller (via their Bearer token) is an owner. Returns the admin client or null.
async function requireOwner(req: Request) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return null
  const a = admin()
  const { data: userData, error } = await a.auth.getUser(token)
  if (error || !userData.user) return null
  const { data: row } = await a.from('admin_users').select('role').eq('id', userData.user.id).maybeSingle()
  if (!row || row.role !== 'owner') return null
  return a
}

// GET — list all editors
export async function GET(req: Request) {
  const a = await requireOwner(req)
  if (!a) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  const { data, error } = await a.from('admin_users').select('id, email, role, created_at').order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ editors: data })
}

// POST — create a new editor { email, password, role }
export async function POST(req: Request) {
  const a = await requireOwner(req)
  if (!a) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  const { email, password, role } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  const { data: created, error: cErr } = await a.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (cErr || !created.user) return NextResponse.json({ error: cErr?.message || 'Create failed' }, { status: 500 })
  const { error: iErr } = await a.from('admin_users').insert({
    id: created.user.id, email, role: role === 'owner' ? 'owner' : 'editor',
  })
  if (iErr) {
    // roll back the auth user if the row insert fails
    await a.auth.admin.deleteUser(created.user.id)
    return NextResponse.json({ error: iErr.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

// PATCH — change a role { id, role }
export async function PATCH(req: Request) {
  const a = await requireOwner(req)
  if (!a) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  const { id, role } = await req.json()
  if (!id || !role) return NextResponse.json({ error: 'id and role required' }, { status: 400 })
  const { error } = await a.from('admin_users').update({ role: role === 'owner' ? 'owner' : 'editor' }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE — remove an editor { id }
export async function DELETE(req: Request) {
  const a = await requireOwner(req)
  if (!a) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  // delete the auth user; admin_users row cascades via FK
  const { error } = await a.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await a.from('admin_users').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}