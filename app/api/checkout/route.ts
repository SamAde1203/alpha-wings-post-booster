import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://alphawingsai.com'

// Fail-fast (shows clearly in Vercel logs)
if (!STRIPE_SECRET_KEY) console.error('❌ Missing STRIPE_SECRET_KEY')
if (!SUPABASE_URL) console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL')
if (!SUPABASE_SERVICE_ROLE_KEY) console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY')

// IMPORTANT: use the apiVersion your installed Stripe typings expect.
// If your build previously complained about '"2025-12-15.clover"', use that here.
const stripe = new Stripe(STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
  maxNetworkRetries: 2,
})

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')

export async function POST(request: NextRequest) {
  // ✅ Server-only debug (safe: only prints prefix)
  console.log('STRIPE KEY PREFIX:', process.env.STRIPE_SECRET_KEY?.slice(0, 8))

  try {
    // Env guard (prevents mystery 500s)
    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server misconfigured (missing env vars).' },
        { status: 500 }
      )
    }

    const { priceId, userId, email } = await request.json()

    // Required fields guard
    if (!priceId || !userId || !email) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missing: { priceId: !priceId, userId: !userId, email: !email },
        },
        { status: 400 }
      )
    }

    console.log(`💳 Creating checkout for user ${userId} with price ${priceId}`)

    // ✅ Optional but VERY helpful: validates price + reveals test/live mismatch
    const p = await stripe.prices.retrieve(priceId)
    console.log('PRICE CHECK', {
      id: p.id,
      active: p.active,
      recurring: p.recurring,
      type: p.type,
      livemode: p.livemode,
    })

    // Fetch existing Stripe customer id from your users table
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (userErr) {
      console.error('❌ Supabase fetch user error:', userErr)
      return NextResponse.json({ error: 'Failed to fetch user record' }, { status: 500 })
    }

    let customerId = user?.stripe_customer_id as string | null | undefined

    // Create Stripe customer if missing
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
        // Not fatal for checkout, but you should fix it
      }
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: userId, // helpful for webhooks
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing?canceled=true`,
	  allow_promotion_codes: true,
      metadata: { userId },
    })

    console.log(`✅ Checkout session created: ${session.id}`)
    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (error: any) {
    // Strong logging to reveal the REAL underlying cause (DNS, bad key, mismatch, etc.)
    console.error('❌ Checkout error message:', error?.message)
    console.error('❌ Checkout error code:', error?.code)
    console.error('❌ Checkout error type:', error?.type)
    console.error('❌ Checkout error stack:', error?.stack)

    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
