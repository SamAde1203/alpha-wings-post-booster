import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies() // ✅ AWAIT it!
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        }
      }
    }
  )

  try {
    const { userId, postId, platform = 'linkedin', scheduledAt } = await request.json()
    
    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: userId,
        post_id: postId,
        platform,
        scheduled_time: scheduledAt,
        status: 'pending',
        auto_publish: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('DB Error:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      scheduledPostId: data.id,
      message: `✅ Post scheduled for ${new Date(scheduledAt).toLocaleString()}` 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to schedule post' 
    }, { status: 500 })
  }
}
