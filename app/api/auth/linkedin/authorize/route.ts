export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')
  
  // ✅ OFFICIAL SCOPES for Share on LinkedIn + Sign In
  const scope = encodeURIComponent('openid profile email r_liteprofile r_ugc_posts')
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI!)}&` +
    `state=${state}&` +
    `scope=${scope}`

  return NextResponse.redirect(authUrl)
}
