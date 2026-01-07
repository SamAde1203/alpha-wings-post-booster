import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state') // user_id
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://alphawingsai.com'

  console.log('🔍 Facebook Callback Hit!')
  console.log('Code:', code ? 'Present' : 'Missing')
  console.log('State (user_id):', state || 'Missing')

  if (error) {
    console.error('❌ Facebook OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=facebook_auth_failed&message=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (!code) {
    console.error('❌ No authorization code')
    return NextResponse.redirect(`${appUrl}/dashboard?error=no_code`)
  }

  if (!state) {
    console.error('❌ No state parameter (user_id missing)')
    return NextResponse.redirect(
      `${appUrl}/login?error=session_expired&message=${encodeURIComponent('Session expired. Please log in and try again.')}`
    )
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(state)) {
    console.error('❌ Invalid user_id format:', state)
    return NextResponse.redirect(
      `${appUrl}/login?error=invalid_session&message=${encodeURIComponent('Invalid session. Please log in again.')}`
    )
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    const clientSecret = process.env.FACEBOOK_APP_SECRET
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI

    console.log('📝 Config check')
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Facebook OAuth configuration missing')
    }

    // Exchange code for access token
    console.log('🔄 Exchanging code for token...')
    const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
    tokenUrl.searchParams.append('client_id', clientId)
    tokenUrl.searchParams.append('client_secret', clientSecret)
    tokenUrl.searchParams.append('redirect_uri', redirectUri)
    tokenUrl.searchParams.append('code', code)

    const tokenResponse = await fetch(tokenUrl.toString())
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('❌ Token exchange failed:', errorData)
      throw new Error(`Token exchange failed: ${JSON.stringify(errorData)}`)
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ Token received')
    const { access_token, expires_in } = tokenData

    // Get long-lived token
    console.log('🔄 Getting long-lived token...')
    const longTokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
    longTokenUrl.searchParams.append('grant_type', 'fb_exchange_token')
    longTokenUrl.searchParams.append('client_id', clientId)
    longTokenUrl.searchParams.append('client_secret', clientSecret)
    longTokenUrl.searchParams.append('fb_exchange_token', access_token)

    const longTokenResponse = await fetch(longTokenUrl.toString())
    const longTokenData = await longTokenResponse.json()
    const longLivedToken = longTokenData.access_token || access_token
    const tokenExpiry = longTokenData.expires_in || expires_in || 5184000
    console.log('✅ Long-lived token received, expires in:', tokenExpiry, 'seconds')

    // Get user profile
    console.log('🔄 Fetching profile...')
    const profileResponse = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture&access_token=${longLivedToken}`
    )
    if (!profileResponse.ok) {
      const profileError = await profileResponse.json()
      console.error('❌ Profile fetch failed:', profileError)
      throw new Error('Failed to get profile')
    }
    
    const profile = await profileResponse.json()
    console.log('✅ Profile:', profile.name, profile.id)

    // Get pages
    console.log('🔄 Fetching pages...')
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedToken}`
    )
    const pagesData = await pagesResponse.json()
    console.log('✅ Pages:', pagesData.data?.length || 0)

    // Use SERVICE ROLE KEY for direct database access
    console.log('🔄 Creating admin Supabase client...')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const userId = state

    console.log('🔄 Saving to database for user:', userId)
    const connectionData = {
      user_id: userId,
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
    }

    console.log('📝 Connection data:', {
      user_id: connectionData.user_id,
      platform: connectionData.platform,
      platform_user_id: connectionData.platform_user_id,
      platform_username: connectionData.platform_username,
      token_expires_at: connectionData.token_expires_at
    })

    const { data: savedData, error: dbError } = await supabaseAdmin
      .from('social_accounts')
      .upsert(connectionData, {
        onConflict: 'user_id,platform'
      })
      .select()

    if (dbError) {
      console.error('❌ Database error:', dbError)
      console.error('Error details:', JSON.stringify(dbError, null, 2))
      throw new Error(`Database save failed: ${dbError.message}`)
    }

    console.log('✅ Saved successfully!')
    console.log('📊 Saved data:', savedData)

    return NextResponse.redirect(
      `${appUrl}/dashboard?success=facebook_connected&timestamp=${Date.now()}`
    )
  } catch (error) {
    console.error('❌ Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=facebook_connection_failed&message=${encodeURIComponent(errorMessage)}`
    )
  }
}
