export async function GET() {
  const now = new Date().toISOString()
  
  const { data: readyPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)
    .limit(5)

  for (const post of readyPosts || []) {
    try {
      // Post to LinkedIn (your existing function)
      const published = await postToLinkedIn(post.user_id, post.content)
      
      if (published.success) {
        await supabase
          .from('posts')
          .update({ 
            status: 'published', 
            published_at: now 
          })
          .eq('id', post.id)
      } else {
        await supabase
          .from('posts')
          .update({ 
            status: 'failed', 
            error_message: published.error 
          })
          .eq('id', post.id)
      }
    } catch (error) {
      console.error('Publish failed:', post.id, error)
    }
  }

  return NextResponse.json({ published: readyPosts?.length || 0 })
}
