import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const requestHeaders = headers()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return requestHeaders.get(name)
        }
      }
    }
  )

  try {
    // ✅ CHANGED: Expect 'content' not 'postId'
    const { userId, content, platform = 'linkedin', scheduledAt } = await request.json()
    
    console.log('Queue post:', { 
      userId, 
      platform, 
      contentLength: content?.length,
      scheduledAt: new Date(scheduledAt) 
    })
    
    // ✅ CHANGED: Insert into 'posts' table, not 'scheduled_posts'
    const { data, error } = await supabase
      .from('posts')  // CHANGED: from 'scheduled_posts' to 'posts'
      .insert({
        user_id: userId,
        content: content,      // Direct content (not post_id)
        platform: platform,
        scheduled_at: scheduledAt,  // CHANGED: column name in posts table
        status: 'scheduled',   // CHANGED: status value for posts table
        tone: 'custom',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('DB Error:', error)
      throw error
    }

    console.log('Post saved to posts table:', data.id)
    return NextResponse.json({ 
      success: true, 
      postId: data.id,
      message: `✅ Post scheduled for ${new Date(scheduledAt).toLocaleString()}` 
    })
  } catch (error: any) {
    console.error('Queue error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to schedule post' 
    }, { status: 500 })
  }
}