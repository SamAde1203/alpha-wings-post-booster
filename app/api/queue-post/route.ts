import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, content, platform = 'linkedin', scheduledAt } = await request.json()
    
    const { error } = await supabase
      .from('post_queue')
      .insert({
        user_id: userId,
        content,
        platform,
        scheduled_at: scheduledAt
      })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: `Post scheduled for ${new Date(scheduledAt).toLocaleString()}` 
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
