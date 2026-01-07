import { NextRequest, NextResponse } from 'next/server'

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'

function buildAuthUrl(state: string) {
  const scope = encodeURIComponent('openid profile email w_member_social')
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI
  const clientId = process.env.LINKEDIN_CLIENT_ID

  if (!redirectUri || !clientId) {
    throw new Error('Missing LINKEDIN_REDIRECT_URI or LINKEDIN_CLIENT_ID')
  }

  const authUrl =
    `${LINKEDIN_AUTH_URL}?` +
    `response_type=code&` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${encodeURIComponent(state)}&` +
    `scope=${encodeURIComponent(scope)}`

  // ✅ safe debug logs
  console.log('LINKEDIN CONFIG', {
    clientId: clientId.slice(0, 6) + '...',
    redirectUri,
    scope,
  })
  console.log('Auth URL:', authUrl)

  return authUrl
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const authUrl = buildAuthUrl(userId)
    return NextResponse.json({ authUrl, success: true })
  } catch (error: any) {
    console.error('❌ Error generating LinkedIn auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state') || 'default'

    const authUrl = buildAuthUrl(state)
    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    console.error('❌ Error redirecting to LinkedIn auth:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=linkedin_config_error`
    )
  }
}
