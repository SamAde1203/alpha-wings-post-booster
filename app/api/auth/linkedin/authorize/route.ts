import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const scope = encodeURIComponent('r_liteprofile r_emailaddress w_member_social')
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI!)}&` +
      `state=${userId}&` +
      `scope=${scope}`

    console.log('🔵 Generated LinkedIn auth URL for user:', userId)
    
    return NextResponse.json({ 
      authUrl,
      success: true 
    })
  } catch (error) {
    console.error('❌ Error generating LinkedIn auth URL:', error)
    return NextResponse.json({ 
      error: 'Failed to generate auth URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Optional: Keep GET for direct navigation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state') || 'default'
  
  const scope = encodeURIComponent('r_liteprofile r_emailaddress w_member_social')
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI!)}&` +
    `state=${state}&` +
    `scope=${scope}`

  console.log('🔵 Redirecting to LinkedIn auth:', authUrl)
  return NextResponse.redirect(authUrl)
}