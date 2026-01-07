import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://alphawingsai.com'

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Facebook OAuth not configured' },
      { status: 500 }
    )
  }

  // Create Supabase client with proper cookie handling
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  console.log('🔍 Checking auth before Facebook redirect...')
  console.log('User:', user?.id || 'Not found')
  console.log('Auth error:', authError?.message || 'None')

  if (!user) {
    console.error('❌ No authenticated user - redirecting to login')
    return NextResponse.redirect(
      `${appUrl}/login?error=not_authenticated&message=${encodeURIComponent('Please log in first before connecting Facebook')}`
    )
  }

  console.log('✅ User authenticated:', user.id, user.email)

  // Build Facebook OAuth URL with user_id as state
  const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth')
  authUrl.searchParams.append('client_id', clientId)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('state', user.id) // Pass user_id via state
  authUrl.searchParams.append('scope', 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts')
  authUrl.searchParams.append('response_type', 'code')

  console.log('🚀 Redirecting to Facebook OAuth with user:', user.id)

  return NextResponse.redirect(authUrl.toString())
}
