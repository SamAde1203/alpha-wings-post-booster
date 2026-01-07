import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('user_id')
  
  const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://alphawingsai.com'

  console.log('🔍 Facebook OAuth initiation')
  console.log('User ID received:', userId || 'MISSING')

  if (!clientId || !redirectUri) {
    console.error('❌ Facebook OAuth not configured')
    return NextResponse.json(
      { error: 'Facebook OAuth not configured' },
      { status: 500 }
    )
  }

  if (!userId) {
    console.error('❌ No user_id provided')
    return NextResponse.redirect(
      `${appUrl}/login?error=not_authenticated&message=${encodeURIComponent('Please log in first')}`
    )
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    console.error('❌ Invalid user_id format:', userId)
    return NextResponse.redirect(
      `${appUrl}/login?error=invalid_session&message=${encodeURIComponent('Invalid session')}`
    )
  }

  console.log('✅ Valid user_id:', userId)

  // Build Facebook OAuth URL with user_id as state
  const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth')
  authUrl.searchParams.append('client_id', clientId)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('state', userId) // Pass user_id via state
  authUrl.searchParams.append('scope', 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts')
  authUrl.searchParams.append('response_type', 'code')

  console.log('🚀 Redirecting to Facebook OAuth')

  return NextResponse.redirect(authUrl.toString())
}
