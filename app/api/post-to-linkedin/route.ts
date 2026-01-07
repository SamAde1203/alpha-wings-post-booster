import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, postContent } = await request.json()

    // Get LinkedIn token from DB
    const { data: account } = await supabase
      .from('social_accounts')
      .select('access_token')
      .eq('user_id', userId)
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .single()

    if (!account?.access_token) {
      return NextResponse.json({ 
        success: false, 
        error: 'No active LinkedIn account found' 
      }, { status: 400 })
    }

    const postData = {
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: postContent },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }

    const response = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202401'
      },
      body: JSON.stringify(postData),
    })

    const result = await response.json()
    console.log('LinkedIn API result:', result)

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: result.message || 'Posting failed',
        details: result 
      }, { status: 500 })
    }

    const postId = result.id || result.urn
    return NextResponse.json({
      success: true,
      postId,
      url: `https://www.linkedin.com/feed/update/${postId}/`
    })

  } catch (error: any) {
    console.error('LinkedIn post error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
