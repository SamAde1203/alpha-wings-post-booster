import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://alphawingsai.com'

  console.log('🔍 Facebook Callback Hit!')
  console.log('Code:', code ? 'Present' : 'Missing')
  console.log('Error:', error)

  if (error) {
    console.error('❌ Facebook OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=facebook_auth_failed&message=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (!code) {
    console.error('❌ No authorization code')
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=no_code`
    )
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    const clientSecret = process.env.FACEBOOK_APP_SECRET
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI

    console.log('📝 Config check:')
    console.log('Client ID:', clientId ? 'Present' : 'Missing')
    console.log('Client Secret:', clientSecret ? 'Present' : 'Missing')
    console.log('Redirect URI:', redirectUri)

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

    // Get long-lived token (60 days)
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
    console.log('✅ Long-lived token received')

    // Get user profile
    console.log('🔄 Fetching user profile...')
    const profileResponse = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture&access_token=${longLivedToken}`
    )

    if (!profileResponse.ok) {
      console.error('❌ Profile fetch failed')
      throw new Error('Failed to get user profile')
    }

    const profile = await profileResponse.json()
    console.log('✅ Profile received:', profile.name, profile.id)

    // Get user's pages
    console.log('🔄 Fetching pages...')
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedToken}`
    )
    const pagesData = await pagesResponse.json()
    console.log('✅ Pages received:', pagesData.data?.length || 0)

    // Create Supabase client with cookies
    console.log('🔄 Creating Supabase client...')
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

    // Get current user
    console.log('🔄 Getting authenticated user...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('❌ Auth error:', authError)
      throw new Error(`Authentication error: ${authError.message}`)
    }

    if (!user) {
      console.error('❌ No authenticated user found')
      return NextResponse.redirect(
        `${appUrl}/login?error=not_authenticated&message=${encodeURIComponent('Please log in first')}`
      )
    }

    console.log('✅ User authenticated:', user.id, user.email)

    // Store Facebook connection
    console.log('🔄 Saving to database...')
    const connectionData = {
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
    }

    console.log('📝 Attempting to save:', {
      user_id: connectionData.user_id,
      platform: connectionData.platform,
      platform_user_id: connectionData.platform_user_id,
      platform_username: connectionData.platform_username
    })

    const { data: savedData, error: dbError } = await supabase
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

    console.log('✅ Successfully saved to database!')
    console.log('📊 Saved data:', savedData)

    // Verify it was saved
    const { data: verifyData, error: verifyError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .single()

    if (verifyError) {
      console.error('⚠️ Could not verify save:', verifyError)
    } else {
      console.log('✅ Verification successful! Data exists:', verifyData?.id)
    }

    return NextResponse.redirect(
      `${appUrl}/dashboard?success=facebook_connected&timestamp=${Date.now()}`
    )
  } catch (error) {
    console.error('❌ Facebook OAuth error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Full error:', JSON.stringify(error, null, 2))
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=facebook_connection_failed&message=${encodeURIComponent(errorMessage)}`
    )
  }
}
