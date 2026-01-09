'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { analytics } from '@/lib/analytics'
import { getPriceId } from '@/lib/pricing-config'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // 🎯 Get real user from auth
  useEffect(() => {
    async function loadUser() {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          setUserId(data.session.user.id)
          setUserEmail(data.session.user.email || '')
          console.log('✅ User loaded:', data.session.user.id)
        } else {
          console.log('⚠️ No user session found')
        }
      } catch (err) {
        console.error('Error loading user:', err)
      } finally {
        setIsLoadingUser(false)
      }
    }
    loadUser()
    analytics.viewPricing()
  }, [])

  const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    posts: '5 posts/month',
    priceAmount: 0,
    features: [
      '5 AI-generated posts',
      'All social platforms',
      'Basic analytics',
      'Email support',
    ],
    priceId: null,
    highlight: false,
  },
  {
    name: 'Starter',
    price: '$9.99',
    period: '/month',
    posts: '50 posts/month',
    priceAmount: 9.99,
    features: [
      '50 AI-generated posts',
      'All social platforms',
      'Advanced analytics',
      'Priority support',
      'Schedule posts',
      'Brand voice training',
    ],
    priceId: getPriceId('starter'),
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$29.99',
    period: '/month',
    posts: '200 posts/month',
    priceAmount: 29.99,
    features: [
      '200 AI-generated posts',
      'All social platforms',
      'Premium analytics',
      'Priority support',
      'Schedule posts',
      'Brand voice training',
      'Team collaboration',
      'API access',
    ],
    priceId: getPriceId('pro'),
    highlight: false,
  },
  {
    name: 'Agency',
    price: '$99.99',
    period: '/month',
    posts: 'Unlimited posts',
    priceAmount: 99.99,
    features: [
      'Unlimited AI posts',
      'All social platforms',
      'Enterprise analytics',
      'Dedicated support',
      'Schedule posts',
      'Brand voice training',
      'Team collaboration',
      'API access',
      'White-label option',
      'Custom integrations',
    ],
    priceId: getPriceId('agency'),
    highlight: false,
  },
]


  async function handleSubscribe(priceId: string | null, planName: string, priceAmount: number) {
    // 🎯 Track plan click
    analytics.clickPricingPlan(planName, priceAmount)

    if (!priceId) {
      // Free plan - redirect to dashboard
      analytics.trackEvent('free_plan_selected', { plan: planName })
      window.location.href = '/dashboard'
      return
    }

    // Check if user is logged in
    if (!userId || !userEmail) {
      alert('Please log in to subscribe to a paid plan')
      router.push('/login?redirect=/pricing')
      return
    }

    setLoading(planName)

    try {
      console.log('📤 Sending checkout request:', { priceId, userId, email: userEmail })

      // 🎯 Track checkout start
      analytics.startCheckout(planName, priceAmount)

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId,
          userId,
          email: userEmail
        }),
      })

      const data = await res.json()
      console.log('📥 Checkout response:', data)

      if (!res.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      const { url } = data

      if (url) {
        // 🎯 Track redirect to Stripe
        analytics.trackEvent('redirect_to_stripe', {
          plan: planName,
          price: priceAmount,
          priceId: priceId
        })
        console.log('✅ Redirecting to Stripe:', url)
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('❌ Subscription error:', error)
      
      // 🎯 Track checkout error
      analytics.error('checkout', error.message || 'Payment failed', 'pricing_page')
      analytics.trackEvent('checkout_error', {
        plan: planName,
        error: error.message || 'Unknown error'
      })
      
      alert(error.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Alpha Wings Post Booster
            </h1>
            <div className="flex items-center gap-4">
              {userId ? (
                <span className="text-sm text-gray-600">
                  ✅ Logged in
                </span>
              ) : (
                <a
                  href="/login"
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Log In
                </a>
              )}
              <a
                href="/"
                onClick={() => analytics.trackEvent('pricing_back_to_home', { page: 'pricing' })}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600">
            Simple, transparent pricing. Start free, upgrade anytime.
          </p>
          {!userId && (
            <p className="mt-4 text-sm text-orange-600 font-medium">
              ⚠️ Please log in to subscribe to paid plans
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-xl p-8 relative transition-transform hover:scale-105 ${
                plan.highlight ? 'ring-4 ring-blue-500' : ''
              }`}
              onMouseEnter={() => {
                analytics.trackEvent('pricing_plan_hover', {
                  plan: plan.name,
                  price: plan.priceAmount
                })
              }}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                <p className="text-sm font-semibold text-blue-600">{plan.posts}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId, plan.name, plan.priceAmount)}
                disabled={loading === plan.name || (plan.priceId !== null && !userId)}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.name ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Loading...
                  </span>
                ) : plan.name === 'Free' ? (
                  'Get Started'
                ) : !userId ? (
                  'Log In to Subscribe'
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-8">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => analytics.trackEvent('faq_click', { question: 'cancel_anytime' })}
            >
              <h4 className="font-bold text-lg mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes! No long-term contracts. Cancel from your dashboard anytime.</p>
            </div>
            <div 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => analytics.trackEvent('faq_click', { question: 'posts_rollover' })}
            >
              <h4 className="font-bold text-lg mb-2">Do unused posts roll over?</h4>
              <p className="text-gray-600">Posts reset monthly. Upgrade for more posts or unlimited access.</p>
            </div>
            <div 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => analytics.trackEvent('faq_click', { question: 'payment_methods' })}
            >
              <h4 className="font-bold text-lg mb-2">What payment methods accepted?</h4>
              <p className="text-gray-600">We accept all major credit cards via secure Stripe payments.</p>
            </div>
            <div 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => analytics.trackEvent('faq_click', { question: 'upgrade_plan' })}
            >
              <h4 className="font-bold text-lg mb-2">Can I upgrade my plan?</h4>
              <p className="text-gray-600">Yes! Upgrade or downgrade anytime from your dashboard.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
