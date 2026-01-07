import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: NextRequest) {
  try {
    const { userId, postContent } = await request.json()

    if (!userId || !postContent) {
      return NextResponse.json(
        { error: 'User ID and post content required' },
        { status: 400 }
      )
    }

    // 1. Get user's LinkedIn account
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'LinkedIn account not found. Please connect LinkedIn first.' },
        { status: 404 }
      )
    }

    if (!account.access_token) {
      return NextResponse.json(
        { error: 'LinkedIn access token missing' },
        { status: 401 }
      )
    }

    // 2. Get LinkedIn member ID if not saved
    let linkedInUserId = account.platform_user_id
    
    if (!linkedInUserId) {
      // Try to fetch it from LinkedIn
      try {
        const profileResponse = await fetch(
          'https://api.linkedin.com/v2/me?projection=(id)',
          {
            headers: {
              'Authorization': `Bearer ${account.access_token}`,
              'LinkedIn-Version': '202410'
            }
          }
        )
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          linkedInUserId = profileData.id
          
          // Update database with the ID
          await supabase
            .from('social_accounts')
            .update({ platform_user_id: linkedInUserId })
            .eq('id', account.id)
        }
      } catch (profileError) {
        console.warn('Could not fetch LinkedIn profile:', profileError)
      }
    }

    if (!linkedInUserId) {
      return NextResponse.json(
        { error: 'LinkedIn user ID not available. Please reconnect LinkedIn.' },
        { status: 400 }
      )
    }

    // 3. Post to LinkedIn using REST API
    const postResponse = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202410',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: `urn:li:person:${linkedInUserId}`,
        commentary: postContent,
        visibility: 'PUBLIC',
        lifecycleState: 'PUBLISHED',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: []
        }
      })
    })

    const postData = await postResponse.json()

    if (!postResponse.ok) {
      console.error('LinkedIn posting error:', postData)
      return NextResponse.json(
        { 
          error: `LinkedIn API error: ${postData.message || 'Unknown error'}`,
          details: postData
        },
        { status: postResponse.status }
      )
    }

    // Extract post URL from response
    let postUrl = ''
    if (postData.id) {
      const postUrn = postData.id
      postUrl = `https://www.linkedin.com/feed/update/${postUrn.split(':').pop()}/`
    }

    return NextResponse.json({
      success: true,
      message: 'Posted to LinkedIn successfully',
      url: postUrl,
      postId: postData.id
    })

  } catch (error) {
    console.error('LinkedIn posting endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}