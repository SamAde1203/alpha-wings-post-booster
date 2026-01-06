'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { analytics } from '@/lib/analytics'
import { User, Mail, CreditCard, Bell, Shield, Trash2 } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [authUser, setAuthUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    checkAuth()
    analytics.trackEvent('settings_page_viewed', { page: 'settings' })
  }, [])

  async function checkAuth() {
    const { data } = await supabase.auth.getSession()
    if (!data.session?.user?.id) {
      router.push('/login')
      return
    }

    setAuthUser(data.session.user)
    setEmail(data.session.user.email || '')

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.session.user.id)
      .single()

    setUser(userData)
    setLoading(false)
  }

  async function handleUpdateEmail() {
    if (!email || email === authUser?.email) {
      alert('Please enter a new email address')
      return
    }

    setSaving(true)
    analytics.trackEvent('email_update_attempted', { old_email: authUser?.email })

    const { error } = await supabase.auth.updateUser({ email })

    if (error) {
      alert('❌ Error updating email: ' + error.message)
    } else {
      alert('✅ Email update sent! Check your inbox for confirmation.')
    }

    setSaving(false)
  }

  async function handleUpdatePassword() {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setSaving(true)
    analytics.trackEvent('password_update_attempted', { user_id: user?.id })

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      alert('❌ Error updating password: ' + error.message)
    } else {
      alert('✅ Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setSaving(false)
  }

  async function handleCancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return
    }

    analytics.trackEvent('subscription_cancel_attempted', { 
      plan: user?.subscription_tier,
      user_id: user?.id 
    })

    alert('⚠️ To cancel your subscription, please contact support at hello@alphawingsai.com or manage it through your Stripe customer portal.')
  }

  async function handleDeleteAccount() {
    if (!confirm('⚠️ WARNING: This will permanently delete your account and all data. This cannot be undone!')) {
      return
    }

    const confirmText = prompt('Type "DELETE" to confirm account deletion:')
    if (confirmText !== 'DELETE') {
      alert('Account deletion cancelled')
      return
    }

    analytics.trackEvent('account_deletion_attempted', { user_id: user?.id })

    // In production, you'd call an API endpoint to handle this properly
    alert('⚠️ To delete your account, please contact support at hello@alphawingsai.com')
  }

  const tierColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700',
    starter: 'bg-blue-100 text-blue-700',
    pro: 'bg-purple-100 text-purple-700',
    agency: 'bg-yellow-100 text-yellow-700'
  }

  const tierEmojis: Record<string, string> = {
    free: '🎁',
    starter: '⭐',
    pro: '🚀',
    agency: '👑'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-700">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            ⚙️ Settings
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account and subscription
          </p>
        </div>

        {/* Account Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {tierEmojis[user?.subscription_tier?.toLowerCase() || 'free']} {user?.subscription_tier?.toUpperCase() || 'FREE'} Plan
              </h2>
              <p className="text-blue-100 mb-1">{authUser?.email}</p>
              <p className="text-sm text-blue-100">
                {user?.posts_this_month || 0} / {user?.posts_limit || 5} posts used this month
              </p>
            </div>
            <a
              href="/pricing"
              onClick={() => analytics.clickCTA('upgrade_from_settings', 'settings_page')}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              {user?.subscription_tier === 'free' ? 'Upgrade Plan' : 'Change Plan'}
            </a>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Account Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleUpdateEmail}
                    disabled={saving || email === authUser?.email}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  You'll receive a confirmation email to verify the change
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <strong>User ID:</strong> {user?.id}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Member since:</strong> {new Date(user?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleUpdatePassword}
                disabled={saving || !newPassword || !confirmPassword}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Subscription Management */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Subscription</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Current Plan</p>
                  <p className="text-sm text-gray-600">
                    {user?.subscription_tier?.toUpperCase() || 'FREE'} - {user?.posts_limit || 5} posts/month
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${tierColors[user?.subscription_tier?.toLowerCase() || 'free']}`}>
                  {tierEmojis[user?.subscription_tier?.toLowerCase() || 'free']} {user?.subscription_tier?.toUpperCase() || 'FREE'}
                </span>
              </div>

              {user?.subscription_tier !== 'free' && (
                <button
                  onClick={handleCancelSubscription}
                  className="w-full py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600"
                >
                  Cancel Subscription
                </button>
              )}

              <a
                href="/pricing"
                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                View All Plans
              </a>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="h-6 w-6 text-red-600" />
              <h3 className="text-xl font-bold text-red-900">Danger Zone</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Once you delete your account, there is no going back. All your data, posts, and subscription will be permanently deleted.
              </p>

              <button
                onClick={handleDeleteAccount}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
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
