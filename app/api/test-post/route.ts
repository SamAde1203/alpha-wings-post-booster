import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { message, userId } = await request.json()
    
    console.log('📝 Test post request:', { message: message?.substring(0, 50), userId })
    
    // Get Facebook connection from database
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
      .eq('platform', 'facebook')
      .eq('is_active', true)
      .single()
    
    if (dbError || !account) {
      console.error('❌ No Facebook account found:', dbError)
      return NextResponse.json(
        { error: 'Facebook account not connected' },
        { status: 404 }
      )
    }
    
    console.log('✅ Found Facebook account for:', account.platform_username)
    
    // Get the first page from profile_data
    const pages = account.profile_data?.pages || []
    
    if (pages.length === 0) {
      return NextResponse.json(
        { error: 'No Facebook pages found' },
        { status: 404 }
      )
    }
    
    const page = pages[0]
    console.log('📄 Posting to page:', page.name, page.id)
    
    // Post to Facebook using page access token
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
    
    return NextResponse.json({
      success: true,
      message: 'Posted to Facebook successfully!',
      postId: fbData.id,
      page: page.name
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
