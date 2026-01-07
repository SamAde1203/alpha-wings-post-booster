import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { message, userId, platform = 'facebook' } = await request.json()
    
    console.log('📝 Post request:', { 
      platform, 
      userId, 
      messageLength: message?.length 
    })
    
    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      )
    }
    
    // Get social account from database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const { data: account, error: dbError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('is_active', true)
      .single()
    
    if (dbError || !account) {
      console.error(`❌ No ${platform} account found:`, dbError)
      return NextResponse.json(
        { error: `${platform} account not connected` },
        { status: 404 }
      )
    }
    
    console.log(`✅ Found ${platform} account for:`, account.platform_username)
    
    // Handle Facebook posting
    if (platform === 'facebook') {
      const pages = account.profile_data?.pages || []
      
      if (pages.length === 0) {
        return NextResponse.json(
          { error: 'No Facebook pages found' },
          { status: 404 }
        )
      }
      
      const page = pages[0]
      console.log('📄 Posting to page:', page.name, page.id)
      
      const fbResponse = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            access_token: page.access_token
          })
        }
      )
      
      const fbData = await fbResponse.json()
      
      if (!fbResponse.ok) {
        console.error('❌ Facebook API error:', fbData)
        return NextResponse.json(
          { error: 'Failed to post to Facebook', details: fbData },
          { status: 400 }
        )
      }
      
      console.log('✅ Posted successfully! Post ID:', fbData.id)
      
      // Save post to database for tracking
      await supabase
        .from('posts')
        .insert({
          user_id: userId,
          platform: 'facebook',
          content: message,
          post_id: fbData.id,
          status: 'published',
          published_at: new Date().toISOString()
        })
      
      return NextResponse.json({
        success: true,
        message: 'Posted to Facebook successfully!',
        postId: fbData.id,
        page: page.name
      })
    }
    
    // Add LinkedIn, Twitter, Instagram here later
    return NextResponse.json(
      { error: `${platform} posting not yet supported` },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
