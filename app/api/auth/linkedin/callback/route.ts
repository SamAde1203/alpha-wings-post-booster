import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('🔵 LinkedIn Callback:', { code: !!code, state, error })

    if (error) {
      console.error('❌ OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=oauth_error:${error}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_code_state`
      )
    }

    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      }),
    })

    const tokenData = await tokenResponse.json()
    console.log('🔵 Token response:', { 
      status: tokenResponse.status,
      hasToken: !!tokenData.access_token,
      scopes: tokenData.scope 
    })

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('❌ Token failed:', tokenData)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=token_failed&details=${encodeURIComponent(JSON.stringify(tokenData))}`
      )
    }

    // 2. Get user info (CRITICAL - need person URN for posting)
    const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    let userData = null
    let linkedInUserId = null
    let userEmail = null
    let userName = 'LinkedIn User'

    if (userResponse.ok) {
      userData = await userResponse.json()
      console.log('🔵 User info:', userData)
      
      // Extract LinkedIn person URN (format: "urn:li:person:abc123")
      linkedInUserId = userData.sub
      
      // Get email and name
      userEmail = userData.email || null
      userName = userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim() || 'LinkedIn User'
      
      if (!linkedInUserId) {
        // Fallback: Try to get URN from me endpoint
        try {
          const meResponse = await fetch('https://api.linkedin.com/v2/me', {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'X-Restli-Protocol-Version': '2.0.0'
            },
          })
          if (meResponse.ok) {
            const meData = await meResponse.json()
            linkedInUserId = meData.id
            console.log('🔵 Fallback user ID from /me:', linkedInUserId)
          }
        } catch (meError) {
          console.error('Fallback /me error:', meError)
        }
      }
    } else {
      console.warn('⚠️ Could not get user info:', await userResponse.text())
    }

    // 3. Calculate token expiry
    const expiresAt = tokenData.expires_in 
      ? new Date(Date.now() + parseInt(tokenData.expires_in) * 1000).toISOString()
      : null

    // 4. Save to database with user URN
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: state,
        platform: 'linkedin',
        platform_user_id: linkedInUserId, // ✅ CRITICAL: Store the LinkedIn person URN
        platform_username: userName,
        platform_user_email: userEmail,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: expiresAt,
        profile_data: userData, // Store full user data
        metadata: {
          scopes: tokenData.scope ? tokenData.scope.split(' ') : [],
          user_info: userData
        },
        is_active: true,
      }, { 
        onConflict: 'user_id,platform',
        ignoreDuplicates: false 
      })

    if (dbError) {
      console.error('❌ DB error:', dbError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=db_error&details=${encodeURIComponent(dbError.message)}`
      )
    }

    console.log('✅ LinkedIn connected successfully! User ID:', linkedInUserId)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=linkedin_connected`
    )

  } catch (err: any) {
    console.error('💥 Callback crash:', err)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=crash&details=${encodeURIComponent(err.message)}`
    )
  }
}