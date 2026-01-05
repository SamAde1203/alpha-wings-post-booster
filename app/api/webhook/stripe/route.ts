import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getPlanFromPriceId } from '@/lib/pricing-config'  // ✅ add this

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    console.error('❌ No stripe-signature header')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('✅ Webhook received:', event.type)

  // 1) Handle checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId || session.client_reference_id

    if (!userId) {
      console.error('❌ No userId in session')
      return NextResponse.json({ error: 'No userId' }, { status: 400 })
    }

    console.log(`💳 Processing checkout for user: ${userId}`)

    try {
      const subscriptionId = session.subscription as string
      if (!subscriptionId) {
        console.error('❌ No subscription ID in session')
        return NextResponse.json({ error: 'No subscription' }, { status: 400 })
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data?.[0]?.price?.id

      if (!priceId) {
        console.error('❌ No priceId on subscription')
        return NextResponse.json({ error: 'No priceId' }, { status: 400 })
      }

      // ✅ Use your central mapping
      const plan = getPlanFromPriceId(priceId)

      console.log(`📝 Updating user ${userId} to plan: ${plan} (priceId=${priceId})`)

      const { error } = await supabase
        .from('users')
        .update({
          subscription_tier: plan,
          subscription_status: subscription.status || 'active',
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer as string,
        })
        .eq('id', userId)

      if (error) {
        console.error('❌ Supabase update error:', error)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      console.log(`✅ User ${userId} updated to ${plan} plan successfully!`)
    } catch (err: any) {
      console.error('❌ Error processing webhook:', err)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  // 2) Handle subscription updates
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    const { data: user, error: findErr } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    if (findErr) {
      console.error('❌ Supabase find user error:', findErr)
    }

    if (user?.id) {
      const priceId = subscription.items.data?.[0]?.price?.id
      const plan = getPlanFromPriceId(priceId)

      await supabase
        .from('users')
        .update({
          subscription_tier: plan,
          subscription_status: subscription.status,
        })
        .eq('id', user.id)

      console.log(`✅ Updated user ${user.id} subscription to ${plan}`)
    }
  }

  // 3) Handle subscription deletion
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    const { data: user, error: findErr } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    if (findErr) {
      console.error('❌ Supabase find user error:', findErr)
    }

    if (user?.id) {
      await supabase
        .from('users')
        .update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
        })
        .eq('id', user.id)

      console.log(`✅ Canceled subscription for user ${user.id}`)
    }
  }

  return NextResponse.json({ received: true })
}
