export async function POST(request: NextRequest) {
  try {
    const { userId, postContent } = await request.json()

    const { data: account } = await supabase
      .from('social_accounts')
      .select('access_token')
      .eq('user_id', userId)
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .single()

    if (!account?.access_token) {
      return NextResponse.json({ success: false, error: 'No LinkedIn account' })
    }

    // 1️⃣ GET PERSON URN (REQUIRED)
    const meResponse = await fetch('https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    const meData = await meResponse.json()
    if (!meResponse.ok) {
      return NextResponse.json({ success: false, error: 'Invalid token', details: meData })
    }

    const personUrn = `urn:li:person:${meData.id}`  // e.g. urn:li:person:ABC123

    // 2️⃣ CREATE POST
    const postData = {
      author: personUrn,
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

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {  // ✅ FIXED ENDPOINT
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202501'
      },
      body: JSON.stringify(postData),
    })

    const result = await response.json()
    console.log('✅ Post result:', result)

    if (!response.ok) {
      return NextResponse.json({ success: false, error: result.message || 'Post failed', details: result })
    }

    const postUrn = response.headers.get('X-RestLi-Id')
    return NextResponse.json({
      success: true,
      postUrn,
      url: `https://www.linkedin.com/feed/update/${postUrn}/`
    })

  } catch (error: any) {
    console.error('💥 Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
