import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://alphawingsai.com'

  if (error) {
    console.error('Facebook OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=facebook_auth_failed&message=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=no_code`
    )
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    const clientSecret = process.env.FACEBOOK_APP_SECRET
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Facebook OAuth configuration missing')
    }

    // Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
    tokenUrl.searchParams.append('client_id', clientId)
    tokenUrl.searchParams.append('client_secret', clientSecret)
    tokenUrl.searchParams.append('redirect_uri', redirectUri)
    tokenUrl.searchParams.append('code', code)

    const tokenResponse = await fetch(tokenUrl.toString())
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      throw new Error(`Token exchange failed: ${JSON.stringify(errorData)}`)
    }

    const tokenData = await tokenResponse.json()
    const { access_token, expires_in } = tokenData

    // Get long-lived token (60 days)
    const longTokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
    longTokenUrl.searchParams.append('grant_type', 'fb_exchange_token')
    longTokenUrl.searchParams.append('client_id', clientId)
    longTokenUrl.searchParams.append('client_secret', clientSecret)
    longTokenUrl.searchParams.append('fb_exchange_token', access_token)

    const longTokenResponse = await fetch(longTokenUrl.toString())
    const longTokenData = await longTokenResponse.json()
    const longLivedToken = longTokenData.access_token || access_token
    const tokenExpiry = longTokenData.expires_in || expires_in || 5184000 // 60 days default

    // Get user profile
    const profileResponse = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture&access_token=${longLivedToken}`
    )

    if (!profileResponse.ok) {
      throw new Error('Failed to get user profile')
    }

    const profile = await profileResponse.json()

    // Get user's pages (optional - for posting to pages)
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedToken}`
    )
    const pagesData = await pagesResponse.json()

    // Save to database
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        `${appUrl}/login?error=not_authenticated`
      )
    }

    // Store Facebook connection
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: user.id,
        platform: 'facebook',
        platform_user_id: profile.id,
        platform_username: profile.name,
        access_token: longLivedToken,
        token_expires_at: new Date(Date.now() + tokenExpiry * 1000).toISOString(),
        profile_data: {
          ...profile,
          pages: pagesData.data || []
        },
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,platform'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save connection')
    }

    return NextResponse.redirect(
      `${appUrl}/dashboard?success=facebook_connected`
    )
  } catch (error) {
    console.error('Facebook OAuth error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=facebook_connection_failed&message=${encodeURIComponent(errorMessage)}`
    )
  }
}
