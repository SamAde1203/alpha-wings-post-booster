import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  try {
    // ✅ Fixed: no trailing spaces
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })
    
    if (!profileResponse.ok) {
      console.warn('Profile fetch failed:', await profileResponse.text())
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired token' 
      }, { status: 401 })
    }

    const profile = await profileResponse.json()

    // ✅ Return only verified fields
    return NextResponse.json({ 
      success: true,
      memberId: profile.sub,           // numeric string
      name: profile.name || `${profile.given_name} ${profile.family_name}`.trim(),
      email: profile.email,
      // ❌ Do NOT construct urn:li:person:... — you're not using personal posts
    })

  } catch (error: any) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch profile',
      details: error.message
    }, { status: 500 })
  }
}