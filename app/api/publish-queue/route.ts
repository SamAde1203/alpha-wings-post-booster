import { createClient } from '@supabase/supabase-js'
import { postToLinkedIn } from '@/lib/linkedin'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function postToFacebook(accessToken: string, content: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        access_token: accessToken,
      }),
    });

    const data = await response.json();
    return response.ok 
      ? { success: true, data } 
      : { success: false, error: data.error?.message || 'Facebook API error' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function GET() {
  const now = new Date().toISOString()
  
  const { data: readyPosts } = await supabase
    .from('posts')
    .select('*, socialaccounts(accesstoken, platform_username)')
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

      let result: any
      
      if (post.platform === 'linkedin') {
        result = await postToLinkedIn(account.accesstoken, post.content)
      } else if (post.platform === 'facebook') {
        result = await postToFacebook(account.accesstoken, post.content)
      }

      if (result?.success) {
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
            error_message: result?.error || 'Publish failed' 
          })
          .eq('id', post.id)
      }
    } catch (error: any) {
      await supabase
        .from('posts')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', post.id)
    }
  }

  return NextResponse.json({ published: publishedCount })
}
