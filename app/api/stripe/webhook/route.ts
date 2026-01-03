import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Function to get Supabase client - only created at runtime
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key)
}

// Map Stripe price IDs to subscription tiers
const PRICE_TIER_MAP: Record<string, { tier: string; limit: number }> = {
  // TEST MODE PRICES
  'price_1SlWynCsaEmlzaAVoO4hiyyR': { tier: 'starter', limit: 50 },
  'price_1SlX0UCsaEmlzaAV8g7LOIE9': { tier: 'pro', limit: 200 },
  'price_1SlX1BCsaEmlzaAVFL5YZIiT': { tier: 'agency', limit: 999999 },

  // LIVE MODE PRICES (for production)
  'price_1SlDhaCsaEmlzaAVHU6w35Ht': { tier: 'starter', limit: 50 },
  'price_1SlDj0CsaEmlzaAVozGhgYC7': { tier: 'pro', limit: 200 },
  'price_1SlDk9CsaEmlzaAVbEO1lJKJ': { tier: 'agency', limit: 999999 },
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()

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
    console.error('❌ Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id || session.metadata?.userId

      if (!userId) {
        console.error('❌ No user ID in session')
        break
      }

      try {
        // Get subscription details
        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id

        // Map price ID to tier
        const tierInfo = PRICE_TIER_MAP[priceId]
        if (!tierInfo) {
          console.error(`⚠️ Unknown price ID: ${priceId}`)
          break
        }

        // Update user in database
        const { error } = await supabase
          .from('users')
          .update({
            subscription_tier: tierInfo.tier,
            subscription_status: 'active',
            posts_limit: tierInfo.limit,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            subscription_started_at: new Date().toISOString(),
            posts_this_month: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (error) {
          console.error(`❌ Database error: ${error.message}`)
          break
        }

        console.log(`✅ User ${userId} upgraded to ${tierInfo.tier} (limit: ${tierInfo.limit} posts)`)
      } catch (err: any) {
        console.error(`❌ Error processing checkout: ${err.message}`)
      }
      break
    }

    case 'customer.subscription.updated': {
      try {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const { data: users, error: queryError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)

        if (queryError || !users || users.length === 0) {
          console.error(`⚠️ User not found for customer: ${customerId}`)
          break
        }

        const user = users[0]
        const priceId = subscription.items.data[0].price.id
        const tierInfo = PRICE_TIER_MAP[priceId]

        if (!tierInfo) {
          console.error(`⚠️ Unknown price ID: ${priceId}`)
          break
        }

        const { error } = await supabase
          .from('users')
          .update({
            subscription_tier: tierInfo.tier,
            subscription_status: subscription.status as string,
            posts_limit: tierInfo.limit,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (error) {
          console.error(`❌ Database error: ${error.message}`)
          break
        }

        console.log(`✅ Subscription updated for user ${user.id} → ${tierInfo.tier} (limit: ${tierInfo.limit} posts)`)
      } catch (err: any) {
        console.error(`❌ Error processing subscription update: ${err.message}`)
      }
      break
    }

    case 'customer.subscription.deleted': {
      try {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: users, error: queryError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)

        if (queryError || !users || users.length === 0) {
          console.error(`⚠️ User not found for customer: ${customerId}`)
          break
        }

        const user = users[0]

        // Downgrade to free tier
        const { error } = await supabase
          .from('users')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            posts_limit: 5,
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (error) {
          console.error(`❌ Database error: ${error.message}`)
          break
        }

        console.log(`✅ User ${user.id} downgraded to free (limit: 5 posts)`)
      } catch (err: any) {
        console.error(`❌ Error processing subscription deletion: ${err.message}`)
      }
      break
    }

    case 'invoice.payment_succeeded': {
      try {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find user by Stripe customer ID
        const { data: users, error: queryError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)

        if (queryError || !users || users.length === 0) {
          console.error(`⚠️ User not found for customer: ${customerId}`)
          break
        }

        const user = users[0]

        // Log payment and reset monthly usage
        await supabase
          .from('users')
          .update({
            posts_this_month: 0,
            last_payment_at: new Date().toISOString(),
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        // Record payment history
        await supabase.from('payment_history').insert({
          user_id: user.id,
          amount: invoice.amount_paid ? invoice.amount_paid / 100 : 0,
          currency: invoice.currency || 'usd',
          status: 'succeeded',
          invoice_id: invoice.id,
          created_at: new Date().toISOString(),
        })

        console.log(`💰 Payment succeeded for user ${user.id} - Amount: $${invoice.amount_paid ? (invoice.amount_paid / 100).toFixed(2) : '0.00'}`)
      } catch (err: any) {
        console.error(`❌ Error processing payment succeeded: ${err.message}`)
      }
      break
    }

    case 'invoice.payment_failed': {
      try {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find user by Stripe customer ID
        const { data: users, error: queryError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)

        if (queryError || !users || users.length === 0) {
          console.error(`⚠️ User not found for customer: ${customerId}`)
          break
        }

        const user = users[0]

        // Update subscription status to past due
        await supabase
          .from('users')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        console.log(`⚠️ Payment failed for user ${user.id}`)
      } catch (err: any) {
        console.error(`❌ Error processing payment failed: ${err.message}`)
      }
      break
    }

    default:
      console.log(`⏭️ Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
