import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Optimal posting times by platform (based on research)
const OPTIMAL_TIMES = {
  linkedin: [
    { day: 'tuesday', hour: 10 },
    { day: 'tuesday', hour: 12 },
    { day: 'wednesday', hour: 10 },
    { day: 'thursday', hour: 9 },
    { day: 'thursday', hour: 14 }
  ],
  twitter: [
    { day: 'wednesday', hour: 9 },
    { day: 'wednesday', hour: 15 },
    { day: 'friday', hour: 9 }
  ],
  facebook: [
    { day: 'thursday', hour: 13 },
    { day: 'friday', hour: 13 }
  ],
  instagram: [
    { day: 'monday', hour: 11 },
    { day: 'tuesday', hour: 14 },
    { day: 'wednesday', hour: 15 }
  ]
}

export async function POST(req: Request) {
  try {
    const { action, ...data } = await req.json()

    switch (action) {
      case 'schedule':
        return await schedulePost(data)
      case 'get_optimal_times':
        return await getOptimalTimes(data)
      case 'list':
        return await listScheduledPosts(data)
      case 'cancel':
        return await cancelScheduledPost(data)
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('❌ Scheduling error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

async function schedulePost(data: any) {
  const { postId, userId, platform, scheduledTime, autoPublish = false } = data

  if (!postId || !userId || !scheduledTime) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Save scheduled post
  const { data: scheduled, error } = await supabase
    .from('scheduled_posts')
    .insert({
      post_id: postId,
      user_id: userId,
      platform,
      scheduled_time: scheduledTime,
      auto_publish: autoPublish,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to schedule post' },
      { status: 500 }
    )
  }

  // TODO: Set up cron job or queue for actual posting
  // Use Vercel Cron, Upstash QStash, or similar

  return NextResponse.json({
    success: true,
    scheduledPost: scheduled,
    message: `Post scheduled for ${new Date(scheduledTime).toLocaleString()}`
  })
}

async function getOptimalTimes(data: any) {
  const { platform, timezone = 'UTC', count = 5 } = data

  if (!platform) {
    return NextResponse.json(
      { success: false, error: 'Platform required' },
      { status: 400 }
    )
  }

  const times = OPTIMAL_TIMES[platform.toLowerCase() as keyof typeof OPTIMAL_TIMES] || []
  
  // Generate next N optimal times
  const now = new Date()
  const suggestions = []

  for (let i = 0; i < count && suggestions.length < count; i++) {
    for (const time of times) {
      const nextDate = getNextDayOfWeek(now, time.day)
      nextDate.setHours(time.hour, 0, 0, 0)

      if (nextDate > now) {
        suggestions.push({
          datetime: nextDate.toISOString(),
          dayOfWeek: time.day,
          hour: time.hour,
          reason: `Peak engagement time for ${platform}`,
          engagement_boost: '+15-25%'
        })
      }

      if (suggestions.length >= count) break
    }
  }

  return NextResponse.json({
    success: true,
    platform,
    timezone,
    suggestions: suggestions.slice(0, count)
  })
}

async function listScheduledPosts(data: any) {
  const { userId, status = 'all' } = data

  let query = supabase
    .from('scheduled_posts')
    .select(`
      *,
      generated_posts (
        content,
        platform,
        topic
      )
    `)
    .eq('user_id', userId)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  query = query.order('scheduled_time', { ascending: true })

  const { data: posts, error } = await query

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scheduled posts' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    scheduled_posts: posts
  })
}

async function cancelScheduledPost(data: any) {
  const { scheduledPostId, userId } = data

  const { error } = await supabase
    .from('scheduled_posts')
    .update({ status: 'cancelled' })
    .eq('id', scheduledPostId)
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to cancel post' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Post cancelled successfully'
  })
}

function getNextDayOfWeek(date: Date, dayName: string): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const targetDay = days.indexOf(dayName.toLowerCase())
  const currentDay = date.getDay()
  const daysUntilTarget = (targetDay + 7 - currentDay) % 7 || 7
  
  const result = new Date(date)
  result.setDate(result.getDate() + daysUntilTarget)
  return result
}
