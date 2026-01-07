// /api/post-to-linkedin/route.ts
import { postToLinkedIn } from '@/lib/linkedin'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, postContent } = await request.json()
    
    // Get LinkedIn access token from database
    const supabase = createServerClient(...)
    
    const { data: account } = await supabase
      .from('social_accounts')
      .select('access_token, platform_user_id')
      .eq('user_id', userId)
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .single()
    
    if (!account) {
      return NextResponse.json({ 
        success: false, 
        error: 'LinkedIn account not connected' 
      })
    }
    
    // Post to LinkedIn
    const result = await postToLinkedIn(
      account.access_token,
      postContent,
      account.platform_user_id
    )
    
    if (result.success) {
      // Save to posts table
      await supabase.from('posts').insert({
        user_id: userId,
        content: postContent,
        platform: 'linkedin',
        status: 'published',
        posted_at: new Date().toISOString(),
        tone: 'custom'
      })
      
      return NextResponse.json({
        success: true,
        url: result.url,
        postId: result.postId
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      })
    }
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}