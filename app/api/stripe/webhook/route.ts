import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '' // Use service role for admin operations
)

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

const PLAN_LIMITS = {
  starter: 50,
  pro: 200,
  agency: 999999
}

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      WEBHOOK_SECRET
    )

    console.log(`🎉 Stripe webhook: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const planId = session.metadata?.plan_id

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session')
    return
  }

  console.log(`✅ Checkout completed for user ${userId}, plan ${planId}`)

  // Update user subscription in database
  await supabase
    .from('users')
    .update({
      subscription_tier: planId,
      subscription_status: 'active',
      stripe_subscription_id: session.subscription,
      posts_limit: PLAN_LIMITS[planId as keyof typeof PLAN_LIMITS],
      posts_this_month: 0,
      subscription_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  // Send welcome email (TODO: implement with Resend or SendGrid)
  console.log(`📧 TODO: Send welcome email to user ${userId}`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  const planId = subscription.metadata?.plan_id

  if (!userId) {
    console.error('Missing user_id in subscription metadata')
    return
  }

  console.log(`🔄 Subscription updated for user ${userId}`)

  await supabase
    .from('users')
    .update({
      subscription_tier: planId || 'pro',
      subscription_status: subscription.status,
      posts_limit: planId ? PLAN_LIMITS[planId as keyof typeof PLAN_LIMITS] : 200,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('Missing user_id in subscription metadata')
    return
  }

  console.log(`❌ Subscription cancelled for user ${userId}`)

  await supabase
    .from('users')
    .update({
      subscription_tier: 'free',
      subscription_status: 'cancelled',
      posts_limit: 5,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  // Send cancellation email
  console.log(`📧 TODO: Send cancellation email to user ${userId}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const userId = invoice.subscription_details?.metadata?.user_id

  if (!userId) return

  console.log(`💰 Payment succeeded for user ${userId}`)

  // Reset monthly usage
  await supabase
    .from('users')
    .update({
      posts_this_month: 0,
      last_payment_at: new Date().toISOString(),
      subscription_status: 'active'
    })
    .eq('id', userId)

  // Log payment
  await supabase.from('payment_history').insert({
    user_id: userId,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    status: 'succeeded',
    invoice_id: invoice.id,
    created_at: new Date().toISOString()
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const userId = invoice.subscription_details?.metadata?.user_id

  if (!userId) return

  console.log(`⚠️ Payment failed for user ${userId}`)

  await supabase
    .from('users')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  // Send payment failed email
  console.log(`📧 TODO: Send payment failed email to user ${userId}`)
}
