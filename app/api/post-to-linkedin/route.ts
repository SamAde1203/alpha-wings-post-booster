import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { userId, postContent } = await request.json()

    // Get existing token (your working one)
    const { data: account } = await supabase
      .from('social_accounts')
      .select('access_token')
      .eq('user_id', userId)
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .single()

    if (!account?.access_token) {
      return NextResponse.json({ success: false, error: 'Connect LinkedIn first' })
    }

    // 1. Get person URN
    const meRes = await fetch('https://api.linkedin.com/v2/me?projection=(id)', {
      headers: { 
        'Authorization': `Bearer ${account.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })
    const me = await meRes.json()
    const personUrn = `urn:li:person:${me.id}`

    // 2. Post (OFFICIAL UGC endpoint)
    const postData = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: postContent },
          shareMediaCategory: "NONE"
        }
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
    }

    const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202501'
      },
      body: JSON.stringify(postData)
    })

    const postResult = await postRes.json()
    
    if (postRes.ok) {
      const postUrn = postRes.headers.get('X-RestLi-Id')
      return NextResponse.json({ 
        success: true, 
        postUrn,
        url: `https://linkedin.com/feed/update/${postUrn}/` 
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: postResult.message || 'Post failed',
      details: postResult 
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
