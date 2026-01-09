import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, postContent } = await request.json()

    if (!userId || !postContent) {
      return NextResponse.json({ error: 'Missing userId or postContent' }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { data: account } = await supabase
      .from('social_accounts')
      .select('access_token, platform_user_id')
      .eq('user_id', userId)
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .single()

    if (!account?.access_token) {
      return NextResponse.json({ success: false, error: 'No LinkedIn token found' }, { status: 400 })
    }

    let authorUrn = account.platform_user_id

    // 🔁 If platform_user_id is null or missing, fetch it using the token
    if (!authorUrn) {
      console.log('ℹ️ Fetching user ID from LinkedIn API...')
      const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${account.access_token}` }
      })

      if (!profileRes.ok) {
        console.error('❌ Failed to fetch userinfo:', await profileRes.text())
        return NextResponse.json({ success: false, error: 'Could not verify LinkedIn profile' }, { status: 400 })
      }

      const profile = await profileRes.json()
      // Ensure profile.sub is a numeric string
      if (!profile.sub || isNaN(Number(profile.sub))) {
        return NextResponse.json({ success: false, error: 'Invalid LinkedIn user ID format' }, { status: 400 })
      }

      authorUrn = `urn:li:person:${profile.sub}`

      // 🔁 Save it back to DB for future use
      await supabase
        .from('social_accounts')
        .update({ platform_user_id: authorUrn })
        .eq('user_id', userId)
        .eq('platform', 'linkedin')
    }

    // ✅ Final payload
    const postData = {
      author: authorUrn, // e.g. "urn:li:person:1234567890"
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

    // ✅ Fixed: no spaces, updated version
    const response = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202508', // ✅ current version
      },
      body: JSON.stringify(postData),
    })

    const result = await response.json()
    console.log('📤 LinkedIn post response:', { status: response.status, result })

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: result.message || 'Posting failed',
        details: result 
      }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      postId: result.id,
      message: 'Posted to LinkedIn successfully!'
    })

  } catch (error: any) {
    console.error('💥 Post error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}