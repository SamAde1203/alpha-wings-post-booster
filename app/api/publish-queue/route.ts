import { createClient } from '@supabase/supabase-js'
import { postToLinkedIn } from '@/lib/linkedin'
import { NextResponse } from 'next/server'

type PublishResult = {
  success: boolean
  error?: string
  postId?: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const now = new Date().toISOString()

  const { data: readyPosts } = await supabase
    .from('posts')
    .select('*, socialaccounts(accesstoken, platform_username, platform)')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)
    .limit(5)

  let publishedCount = 0

  for (const post of readyPosts || []) {
    try {
      const account = post.socialaccounts?.find((acc: any) =>
        acc.platform === post.platform
      )

      if (!account?.accesstoken) {
        await supabase
          .from('posts')
          .update({ status: 'failed', error_message: 'No access token' })
          .eq('id', post.id)
        continue
      }

      let result: PublishResult = { success: false }

      if (post.platform === 'linkedin') {
        result = await postToLinkedIn(account.accesstoken, post.content)
      } else if (post.platform === 'facebook') {
        // Not implemented yet (prevents build errors)
        result = { success: false, error: 'Facebook publishing not implemented yet' }
      } else {
        result = { success: false, error: `Unsupported platform: ${post.platform}` }
      }

      if (result.success) {
        await supabase
          .from('posts')
          .update({ status: 'published', published_at: now })
          .eq('id', post.id)
        publishedCount++
      } else {
        await supabase
          .from('posts')
          .update({
            status: 'failed',
            error_message: result.error || 'Publish failed'
          })
          .eq('id', post.id)
      }
    } catch (error: any) {
      console.error('Publish error:', post.id, error)
      await supabase
        .from('posts')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', post.id)
    }
  }

  console.log(`Cron published ${publishedCount} posts`)
  return NextResponse.json({ published: publishedCount })
}
