import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Function to get Supabase client - only created at runtime
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()

  try {
    const payload = await request.json()

    console.log('📨 Webhook received:', payload.type)

    // Handle different webhook types
    switch (payload.type) {
      case 'user.created':
        await handleUserCreated(supabase, payload)
        break
      case 'user.updated':
        await handleUserUpdated(supabase, payload)
        break
      default:
        console.log(`⏭️ Unhandled webhook type: ${payload.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('❌ Webhook error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

async function handleUserCreated(supabase: any, payload: any) {
  try {
    const { user } = payload

    if (!user?.id || !user?.email) {
      console.error('❌ Missing user data')
      return
    }

    console.log(`👤 Creating user record for ${user.email}`)

    const { error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subscription_tier: 'free',
        subscription_status: 'inactive',
        posts_limit: 5,
        posts_this_month: 0,
      })

    if (error) {
      console.error('❌ Database error:', error.message)
      return
    }

    console.log(`✅ User ${user.id} created successfully`)
  } catch (err: any) {
    console.error('❌ Error handling user created:', err.message)
  }
}

async function handleUserUpdated(supabase: any, payload: any) {
  try {
    const { user } = payload

    if (!user?.id) {
      console.error('❌ Missing user ID')
      return
    }

    console.log(`🔄 Updating user record for ${user.id}`)

    const { error } = await supabase
      .from('users')
      .update({
        email: user.email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('❌ Database error:', error.message)
      return
    }

    console.log(`✅ User ${user.id} updated successfully`)
  } catch (err: any) {
    console.error('❌ Error handling user updated:', err.message)
  }
}
