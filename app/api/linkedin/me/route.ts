import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  try {
    // Try OpenID userinfo endpoint first
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })
    
    const profile = await profileResponse.json()
    
    if (profileResponse.ok && profile.sub) {
      return NextResponse.json({ 
        success: true,
        memberId: profile.sub, 
        urn: `urn:li:person:${profile.sub}`,
        name: profile.name,
        email: profile.email
      })
    }
    
    // Fallback to v2 me endpoint
    const meResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })
    
    const meData = await meResponse.json()
    
    return NextResponse.json({ 
      success: true,
      memberId: meData.id, 
      urn: `urn:li:person:${meData.id}`,
      name: `${meData.localizedFirstName || ''} ${meData.localizedLastName || ''}`.trim()
    })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch profile' 
    }, { status: 500 })
  }
}
