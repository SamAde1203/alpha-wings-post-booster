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
    const searchParams = request.nextUrl.searchParams  // ✅ CORRECT
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('🔵 Callback:', { code: !!code, state, error })

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

    // Token exchange
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
    console.log('🔵 Token response status:', tokenResponse.status, tokenData)

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('❌ Token failed:', tokenData)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=token_failed&details=${encodeURIComponent(JSON.stringify(tokenData))}`
      )
    }

    // ✅ FIXED: token_expires_at as ISO string
    const expiresAt = tokenData.expires_in 
      ? new Date(Date.now() + parseInt(tokenData.expires_in) * 1000).toISOString()
      : null

    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: state,
        platform: 'linkedin',
        platform_user_id: null,
        platform_username: 'LinkedIn',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: expiresAt,  // ✅ ISO string
        profile_data: null,
        is_active: true,
      }, { onConflict: 'user_id,platform' })

    if (dbError) {
      console.error('❌ DB error:', dbError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=db_error&details=${encodeURIComponent(dbError.message)}`
      )
    }

    console.log('✅ LinkedIn connected!')
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
