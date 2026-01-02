'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navigation from '@/components/Navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function SettingsPage() {
  const [userId] = useState('438a1d7b-a880-4956-ba3b-e6a69277019b')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    setUser(data)
    setLoading(false)
  }

  async function handleManageSubscription() {
    if (!user?.stripe_customer_id) {
      window.location.href = '/pricing'
      return
    }

    // Create Stripe portal session
    try {
      const res = await fetch('/api/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: user.stripe_customer_id }),
      })

      const { url } = await res.json()
      window.location.href = url
    } catch (error) {
      alert('Error opening billing portal')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-2xl">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Settings</h2>
          <p className="text-gray-600">Manage your account and subscription</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {message}
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">📧 Account Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                {user?.email || 'N/A'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-600 text-sm font-mono">
                {userId}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">💎 Subscription</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div>
                <div className="text-sm text-gray-600 mb-1">Current Plan</div>
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {user?.subscription_tier || 'Free'}
                </div>
                <div className="text-sm text-gray-600 mt-1 capitalize">
                  Status: {user?.subscription_status || 'Active'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {user?.posts_limit === 999999 ? '∞' : user?.posts_limit || 5}
                </div>
                <div className="text-sm text-gray-600">Posts/Month</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">This Month</div>
                <div className="text-2xl font-bold text-gray-900">
                  {user?.posts_this_month || 0}
                </div>
                <div className="text-xs text-gray-500">Posts Used</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">All Time</div>
                <div className="text-2xl font-bold text-gray-900">
                  {user?.total_posts_generated || 0}
                </div>
                <div className="text-xs text-gray-500">Total Posts</div>
              </div>
            </div>

            <div className="flex gap-3">
              {user?.subscription_tier === 'free' ? (
                <a
                  href="/pricing"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-center shadow-lg hover:shadow-xl transition-all"
                >
                  🚀 Upgrade Plan
                </a>
              ) : (
                <button
                  onClick={handleManageSubscription}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  💳 Manage Subscription
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
          <h3 className="text-xl font-bold text-red-600 mb-6">⚠️ Danger Zone</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-2">Delete Account</h4>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all data. This action cannot be undone.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you ABSOLUTELY sure? This will delete ALL your data permanently!')) {
                    alert('Account deletion feature coming soon. Contact support@alphawings.com')
                  }
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
