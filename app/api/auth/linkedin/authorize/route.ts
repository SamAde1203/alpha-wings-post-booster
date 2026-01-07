import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Build LinkedIn OAuth URL
    const linkedInAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
    linkedInAuthUrl.searchParams.append('response_type', 'code')
    linkedInAuthUrl.searchParams.append('client_id', process.env.LINKEDIN_CLIENT_ID!)
    linkedInAuthUrl.searchParams.append('redirect_uri', process.env.LINKEDIN_REDIRECT_URI!)
    linkedInAuthUrl.searchParams.append('state', userId)
    linkedInAuthUrl.searchParams.append('scope', 'openid profile email w_member_social')

    return NextResponse.json({ authUrl: linkedInAuthUrl.toString() })
  } catch (error) {
    console.error('Error generating LinkedIn auth URL:', error)
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}
