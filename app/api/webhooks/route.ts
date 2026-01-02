import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') || ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id || session.metadata?.userId

      if (!userId) {
        console.error('No user ID in session')
        break
      }

      // Get subscription details
      const subscriptionId = session.subscription as string
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0].price.id

      // Map price ID to tier and limits
      let tier = 'free'
      let postsLimit = 5

      // YOU'LL REPLACE THESE WITH YOUR ACTUAL PRICE IDs FROM STRIPE
      if (priceId === 'prod_Tif1COawB532U0') {
        tier = 'starter'
        postsLimit = 50
      } else if (priceId === 'prod_Tif3GcKj45bDgP') {
        tier = 'pro'
        postsLimit = 200
      } else if (priceId === 'prod_Tif4mCiLCXIlJW') {
        tier = 'agency'
        postsLimit = 999999
      }

      // Update user in database
      await supabase
        .from('users')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          posts_limit: postsLimit,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
        })
        .eq('id', userId)

      console.log(`✅ User ${userId} upgraded to ${tier}`)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Find user by Stripe customer ID
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (!user) break

      const priceId = subscription.items.data[0].price.id
      let tier = 'free'
      let postsLimit = 5

      if (priceId === 'price_YOUR_STARTER_ID') {
        tier = 'starter'
        postsLimit = 50
      } else if (priceId === 'price_YOUR_PRO_ID') {
        tier = 'pro'
        postsLimit = 200
      } else if (priceId === 'price_YOUR_AGENCY_ID') {
        tier = 'agency'
        postsLimit = 999999
      }

      await supabase
        .from('users')
        .update({
          subscription_tier: tier,
          subscription_status: subscription.status,
          posts_limit: postsLimit,
        })
        .eq('id', user.id)

      console.log(`✅ Subscription updated for user ${user.id}`)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (!user) break

      // Downgrade to free tier
      await supabase
        .from('users')
        .update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
          posts_limit: 5,
        })
        .eq('id', user.id)

      console.log(`✅ User ${user.id} downgraded to free`)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
