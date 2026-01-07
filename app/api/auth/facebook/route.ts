import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Facebook OAuth not configured' },
      { status: 500 }
    )
  }

  // Get current user to pass in state
  const cookieStore = await cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Try to get user from cookies
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  
  let userId = 'anonymous'
  
  if (authCookie) {
    try {
      // Get session from cookie
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        userId = session.user.id
        console.log('✅ Found user:', userId)
      }
    } catch (err) {
      console.error('❌ Could not get session:', err)
    }
  }

  // Build Facebook OAuth URL with user_id as state
  const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth')
  authUrl.searchParams.append('client_id', clientId)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('state', userId) // Pass user_id via state
  authUrl.searchParams.append('scope', 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts')
  authUrl.searchParams.append('response_type', 'code')

  console.log('🚀 Redirecting to Facebook with state:', userId)

  return NextResponse.redirect(authUrl.toString())
}
