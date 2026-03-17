import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Props {
  params: Promise<{ code: string }>
}

export default async function RedirectPage({ params }: Props) {
  const { code } = await params
  const headersList = await headers()

  const { data: link, error } = await supabase
    .from('links')
    .select('id, destination_url, is_active, expires_at')
    .eq('code', code)
    .single()

  if (error || !link || !link.is_active) {
    redirect('/')
  }

  // Check if link has expired
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    redirect('/?error=link_expired')
  }

  // Track the click
  const userAgent = headersList.get('user-agent') || ''
  const deviceType = userAgent.includes('Mobile') ? 'mobile' : 'desktop'
  const browserName = userAgent.includes('Chrome')
    ? 'Chrome'
    : userAgent.includes('Firefox')
    ? 'Firefox'
    : userAgent.includes('Safari')
    ? 'Safari'
    : 'Other'

  await supabase.from('clicks').insert({
    link_id: link.id,
    device_type: deviceType,
    browser_name: browserName,
  })

  redirect(link.destination_url)
}