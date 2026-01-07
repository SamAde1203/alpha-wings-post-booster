import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  // Add security - only allow cron jobs or authenticated requests
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()
  console.log('Checking scheduled posts at:', now)
  
  // ✅ FIXED: table name and column names
  const { data: readyPosts, error } = await supabase
    .from('posts')
    .select(`
      *,
      social_accounts (
        access_token,
        platform,
        platform_user_id,
        metadata
      )
    `)
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)
    .limit(10)

  if (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`Found ${readyPosts?.length || 0} posts to publish`)

  let publishedCount = 0
  let failedCount = 0

  for (const post of readyPosts || []) {
    console.log(`Processing post ${post.id} for ${post.platform}`)
    
    try {
      // ✅ FIXED: Find correct social account
      const account = post.social_accounts?.find((acc: any) => 
        acc.platform === post.platform
      )

      if (!account?.access_token) {
        console.log(`No access token for ${post.platform} on post ${post.id}`)
        await supabase
          .from('posts')
          .update({ 
            status: 'failed', 
            error_message: `No ${post.platform} access token`,
            updated_at: now
          })
          .eq('id', post.id)
        failedCount++
        continue
      }

      let result: any = { success: false }
      
      if (post.platform === 'linkedin') {
        // Use your existing LinkedIn function
        result = await postToLinkedIn(account.access_token, post.content, account.platform_user_id)
      } else if (post.platform === 'facebook') {
        // ✅ ADDED: Facebook posting function
        result = await postToFacebook(account.access_token, post.content, account.metadata?.page_id || account.platform_user_id)
      } else {
        console.log(`Unsupported platform: ${post.platform}`)
        await supabase
          .from('posts')
          .update({ 
            status: 'failed', 
            error_message: `Unsupported platform: ${post.platform}`,
            updated_at: now
          })
          .eq('id', post.id)
        failedCount++
        continue
      }

      if (result.success) {
        // ✅ FIXED: Update to posted_at (based on your posts table schema)
        await supabase
          .from('posts')
          .update({ 
            status: 'published', 
            posted_at: now,  // Your posts table has posted_at column
            updated_at: now,
            error_message: null
          })
          .eq('id', post.id)
        publishedCount++
        console.log(`✅ Published post ${post.id} to ${post.platform}`)
      } else {
        await supabase
          .from('posts')
          .update({ 
            status: 'failed', 
            error_message: result.error || 'Publish failed',
            updated_at: now
          })
          .eq('id', post.id)
        failedCount++
        console.log(`❌ Failed to publish post ${post.id}: ${result.error}`)
      }
    } catch (error: any) {
      console.error('Publish error for post', post.id, error)
      await supabase
        .from('posts')
        .update({ 
          status: 'failed', 
          error_message: error.message,
          updated_at: now
        })
        .eq('id', post.id)
      failedCount++
    }
  }

  console.log(`Cron result: ${publishedCount} published, ${failedCount} failed`)
  return NextResponse.json({ 
    success: true,
    published: publishedCount,
    failed: failedCount,
    total: readyPosts?.length || 0
  })
}

// ✅ ADD Facebook posting function (use your page ID 61585961680761)
async function postToFacebook(accessToken: string, content: string, pageId?: string) {
  try {
    console.log(`Posting to Facebook page ${pageId || '61585961680761'}...`)
    
    const facebookPageId = pageId || '61585961680761'
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${facebookPageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          access_token: accessToken
        })
      }
    )
    
    const data = await response.json()
    console.log('Facebook API response:', data)
    
    if (data.error) {
      return {
        success: false,
        error: `Facebook API error: ${JSON.stringify(data.error)}`
      }
    }
    
    return {
      success: true,
      postId: data.id,
      url: `https://facebook.com/${data.id}`
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

// Make sure postToLinkedIn function exists or add it
async function postToLinkedIn(accessToken: string, content: string, userId?: string) {
  try {
    console.log('Posting to LinkedIn...')
    
    // This should match your existing LinkedIn posting logic
    // If you have this function in @/lib/linkedin, it will be imported
    // Otherwise, add the logic here:
    
    // Example LinkedIn API call:
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: `urn:li:person:${userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    })
    
    const data = await response.json()
    
    if (data.serviceErrorCode) {
      return {
        success: false,
        error: `LinkedIn API error: ${JSON.stringify(data)}`
      }
    }
    
    return {
      success: true,
      postId: data.id,
      url: `https://linkedin.com/feed/update/${data.id}`
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}