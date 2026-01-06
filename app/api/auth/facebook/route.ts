import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI
  const state = searchParams.get('state') || crypto.randomUUID()

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Facebook OAuth not configured' },
      { status: 500 }
    )
  }

  // Build Facebook OAuth URL
  const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth')
  authUrl.searchParams.append('client_id', clientId)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('state', state)
  authUrl.searchParams.append('scope', 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts')
  authUrl.searchParams.append('response_type', 'code')

  return NextResponse.redirect(authUrl.toString())
}
