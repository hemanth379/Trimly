import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  const { url, customAlias, expiresAt } = await req.json()

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const authHeader = req.headers.get('authorization')
  let userId = null

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (user) userId = user.id
  }

  const code = customAlias || generateCode()

  // Check if custom alias already exists
  if (customAlias) {
    const { data: existing } = await supabase
      .from('links')
      .select('id')
      .eq('code', customAlias)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'This alias is already taken! Try another one.' },
        { status: 400 }
      )
    }
  }

  const { error } = await supabase
    .from('links')
    .insert({
      code,
      destination_url: url,
      user_id: userId,
      expires_at: expiresAt || null
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${code}`
  return NextResponse.json({ shortUrl })
}