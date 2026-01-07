import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  console.log('🔍 Testing database connection...')
  
  try {
    // Check if service role key exists
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    console.log('URL exists:', !!url)
    console.log('Service key exists:', !!serviceKey)
    console.log('Service key length:', serviceKey?.length || 0)
    
    if (!url || !serviceKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        url_exists: !!url,
        key_exists: !!serviceKey
      }, { status: 500 })
    }
    
    const supabase = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Try to read from social_accounts
    console.log('📊 Attempting to read social_accounts...')
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({
        error: 'Database query failed',
        message: error.message,
        details: error
      }, { status: 500 })
    }
    
    console.log('✅ Query successful, rows:', data?.length || 0)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection works!',
      rows: data?.length || 0,
      data: data
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
