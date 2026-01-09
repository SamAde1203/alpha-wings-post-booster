import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

function generateState(): string {
  return randomUUID()
}

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'

function buildAuthUrl(state: string) {
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI
  const clientId = process.env.LINKEDIN_CLIENT_ID

  if (!redirectUri || !clientId) {
    throw new Error('Missing LINKEDIN_REDIRECT_URI or LINKEDIN_CLIENT_ID')
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,  // ✅ Uses passed state (now = userId!)
    scope: 'openid profile w_member_social email'
  })

  const authUrl = `${LINKEDIN_AUTH_URL}?${params.toString()}`
  console.log('🔍 Auth URL:', authUrl)
  return authUrl
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // 🔥 FIX: Use REAL userId as state!
    const state = userId  
    const authUrl = buildAuthUrl(state)
    
    return NextResponse.json({ authUrl, success: true })
  } catch (error: any) {
    console.error('❌ Error generating LinkedIn auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL', details: error?.message },
      { status: 500 }
    )
  }
}
