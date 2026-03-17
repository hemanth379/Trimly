import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const pendingUrl = searchParams.get('pendingUrl')
  const pendingAlias = searchParams.get('pendingAlias')
  const pendingExpiry = searchParams.get('pendingExpiry')

  if (token_hash && type) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error && data.session) {
      // If there's a pending URL, shorten it now
      if (pendingUrl) {
        const serviceSupabase = createClient(
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

        await serviceSupabase.from('links').insert({
          code: pendingAlias || generateCode(),
          destination_url: pendingUrl,
          user_id: data.session.user.id,
          expires_at: pendingExpiry || null
        })
      }

      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.redirect(new URL('/login?error=confirmation_failed', request.url))
}