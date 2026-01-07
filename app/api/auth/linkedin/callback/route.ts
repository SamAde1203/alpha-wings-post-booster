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

    console.log('🔵 LinkedIn callback received:', { hasCode: !!code, state, error })

    if (error) {
      console.error('❌ LinkedIn OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=linkedin_auth_failed&message=${error}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_params`
      )
    }

    // 1) Exchange code for access token
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

    if (!tokenResponse.ok) {
      console.error('❌ LinkedIn token error:', tokenData)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=token_exchange_failed`
      )
    }

    console.log('✅ LinkedIn access token received')

    // 2) Get basic member profile using v2 /me
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const profileData = await profileResponse.json()
    console.log('🔎 LinkedIn /me status:', profileResponse.status, profileData)

    if (!profileResponse.ok) {
      console.error('❌ LinkedIn profile error:', profileData)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=profile_fetch_failed`
      )
    }

    const firstName = profileData.localizedFirstName || ''
    const lastName = profileData.localizedLastName || ''
    const fullName = `${firstName} ${lastName}`.trim() || 'LinkedIn User'

    console.log('✅ LinkedIn profile received:', fullName)

    // 3) Save to database
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert(
        {
          user_id: state,                     // state = Supabase user id
          platform: 'linkedin',
          platform_user_id: profileData.id,   // v2 member id
          platform_username: fullName,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: new Date(
            Date.now() + (tokenData.expires_in ?? 0) * 1000
          ).toISOString(),
          profile_data: profileData,
          is_active: true,
        },
        {
          onConflict: 'user_id,platform',
        }
      )

    if (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=database_error`
      )
    }

    console.log('✅ LinkedIn account saved to database')

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=linkedin_connected`
    )
  } catch (err) {
    console.error('❌ LinkedIn callback error:', err)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=unexpected_error`
    )
  }
}
