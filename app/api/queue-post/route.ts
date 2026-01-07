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
    const { userId, content, platform = 'linkedin', scheduledAt } = await request.json()
    
    console.log('Queue post:', { userId, platform, scheduledAt: new Date(scheduledAt) })
    
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content,
        platform,
        status: 'scheduled',
        scheduled_at: scheduledAt
      })
      .select()
      .single()

    if (error) {
      console.error('DB Error:', error)
      throw error
    }

    console.log('Saved post:', data.id)
    return NextResponse.json({ 
      success: true, 
      postId: data.id,
      message: `✅ Saved #${data.id.slice(-4)} for ${new Date(scheduledAt).toLocaleString()}` 
    })
  } catch (error: any) {
    console.error('Queue error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
