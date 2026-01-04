import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://alphawingsai.com'

if (!STRIPE_SECRET_KEY) console.error('❌ Missing STRIPE_SECRET_KEY')
if (!SUPABASE_URL) console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL')
if (!SUPABASE_SERVICE_ROLE_KEY) console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY')

const stripe = new Stripe(STRIPE_SECRET_KEY || '', {
 apiVersion: '2024-06-20' as any,
  maxNetworkRetries: 2,
})

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')

export async function POST(request: NextRequest) {
  try {
    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server misconfigured (missing env vars).' },
        { status: 500 }
      )
    }

    const { priceId, userId, email } = await request.json()

    if (!priceId || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields', missing: { priceId: !priceId, userId: !userId, email: !email } },
        { status: 400 }
      )
    }

    console.log(`💳 Creating checkout for user ${userId} with price ${priceId}`)

    // Fetch user customer id
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (userErr) {
      console.error('❌ Supabase fetch user error:', userErr)
      return NextResponse.json({ error: 'Failed to fetch user record' }, { status: 500 })
    }

    let customerId = user?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      })

      customerId = customer.id
      console.log(`✅ Created Stripe customer: ${customerId}`)

      const { error: updateErr } = await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)

      if (updateErr) {
        console.error('❌ Supabase update stripe_customer_id error:', updateErr)
        // Not fatal to checkout, but good to know
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: userId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing?canceled=true`,
      metadata: { userId },
    })

    console.log(`✅ Checkout session created: ${session.id}`)
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('❌ Checkout error:', error?.message || error)

    // Stripe network/DNS type errors often show like ENOTFOUND / ECONNRESET
    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
