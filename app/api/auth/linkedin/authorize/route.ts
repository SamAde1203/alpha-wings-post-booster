import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state') || 'default'
  
  const scope = encodeURIComponent('r_liteprofile r_emailaddress w_member_social')  // YOUR WORKING SCOPES
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI!)}&` +
    `state=${state}&` +
    `scope=${scope}`

  console.log('🔵 Redirecting to LinkedIn auth:', authUrl)
  return NextResponse.redirect(authUrl)
}
