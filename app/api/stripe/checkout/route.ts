import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Pricing tiers
const PRICING_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER || '',
    price: 29,
    posts: 50,
    features: [
      '50 AI-generated posts/month',
      'All 6 platforms',
      'Basic analytics',
      'Email support'
    ]
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO || '',
    price: 79,
    posts: 200,
    features: [
      '200 AI-generated posts/month',
      'All 15+ platforms',
      'Advanced analytics',
      'Brand voice training',
      'Auto-scheduling',
      'A/B testing',
      'Priority support'
    ]
  },
  agency: {
    name: 'Agency',
    priceId: process.env.STRIPE_PRICE_AGENCY || '',
    price: 199,
    posts: -1, // unlimited
    features: [
      'Unlimited AI-generated posts',
      'All 15+ platforms',
      'Advanced analytics + exports',
      'Brand voice training',
      'Auto-scheduling',
      'A/B testing',
      'Team collaboration (5 seats)',
      'White-label options',
      'API access',
      'Dedicated support'
    ]
  }
}

export async function POST(req: Request) {
  try {
    const { planId, userId, email } = await req.json()

    if (!planId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS]
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan' },
        { status: 400 }
      )
    }

    console.log(`💳 Creating checkout session for ${plan.name} plan...`)

    // Check if user already has a subscription
    const { data: existingUser } = await supabase
      .from('users')
      .select('stripe_customer_id, subscription_tier')
      .eq('id', userId)
      .single()

    let customerId = existingUser?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          supabase_user_id: userId
        }
      })
      customerId = customer.id

      // Save customer ID to database
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: userId,
        plan_id: planId
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_id: planId
        }
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })

  } catch (error: any) {
    console.error('❌ Stripe checkout error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
