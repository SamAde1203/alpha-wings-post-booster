'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const userId = '438a1d7b-a880-4956-ba3b-e6a69277019b'

 const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    posts: '5 posts/month',
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
    features: [
      '50 AI-generated posts',
      'All social platforms',
      'Advanced analytics',
      'Priority support',
      'Schedule posts',
      'Brand voice training',
    ],
    priceId: 'price_1SlWynCsaEmlzaAVoO4hiyyR', // ✅ TEST MODE
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$29.99',
    period: '/month',
    posts: '200 posts/month',
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
    priceId: 'price_1SlX0UCsaEmlzaAV8g7LOIE9', // ✅ TEST MODE
    highlight: false,
  },
  {
    name: 'Agency',
    price: '$99.99',
    period: '/month',
    posts: 'Unlimited posts',
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
    priceId: 'price_1SlX1BCsaEmlzaAVFL5YZIiT', // ✅ TEST MODE
    highlight: false,
  },
]



  async function handleSubscribe(priceId: string | null, planName: string) {
    if (!priceId) {
      window.location.href = '/dashboard'
      return
    }

    setLoading(planName)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      const { url } = data

      // NEW METHOD: Direct redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
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
              ✈️ Alpha Wings Post Booster
            </h1>
            <a
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Home
            </a>
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
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-xl p-8 relative transition-transform hover:scale-105 ${
                plan.highlight ? 'ring-4 ring-blue-500' : ''
              }`}
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
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                disabled={loading === plan.name}
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
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h4 className="font-bold text-lg mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes! No long-term contracts. Cancel from your dashboard anytime.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h4 className="font-bold text-lg mb-2">Do unused posts roll over?</h4>
              <p className="text-gray-600">Posts reset monthly. Upgrade for more posts or unlimited access.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h4 className="font-bold text-lg mb-2">What payment methods accepted?</h4>
              <p className="text-gray-600">We accept all major credit cards via secure Stripe payments.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h4 className="font-bold text-lg mb-2">Can I upgrade my plan?</h4>
              <p className="text-gray-600">Yes! Upgrade or downgrade anytime from your dashboard.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
