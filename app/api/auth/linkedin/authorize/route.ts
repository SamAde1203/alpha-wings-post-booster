import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const linkedInAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
    linkedInAuthUrl.searchParams.append('response_type', 'code')
    linkedInAuthUrl.searchParams.append('client_id', process.env.LINKEDIN_CLIENT_ID!)
    linkedInAuthUrl.searchParams.append('redirect_uri', process.env.LINKEDIN_REDIRECT_URI!)
    linkedInAuthUrl.searchParams.append('state', userId)

    // Absolutely minimal scope: only posting
    linkedInAuthUrl.searchParams.append('scope', 'w_member_social r_liteprofile')

    return NextResponse.json({ authUrl: linkedInAuthUrl.toString() })
  } catch (error) {
    console.error('Error generating LinkedIn auth URL:', error)
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}
