'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import { analytics } from '@/lib/analytics'
import ConnectFacebookButton from '@/components/ConnectFacebookButton'




const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState<string | null>(null)
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('linkedin')
  const [tone, setTone] = useState('professional')
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [error, setError] = useState('')
  const [postsRemaining, setPostsRemaining] = useState(5)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [contentLength, setContentLength] = useState('medium')
  const [writingStyle, setWritingStyle] = useState('direct')
  const [customInstructions, setCustomInstructions] = useState('')
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([])
  const [showConnectionSuccess, setShowConnectionSuccess] = useState(false)
  const [showConnectionError, setShowConnectionError] = useState(false)
  const [connectionMessage, setConnectionMessage] = useState('')

  useEffect(() => {
    checkAuth()
    checkConnectionStatus()
  }, [])

  useEffect(() => {
    if (user) {
      analytics.viewDashboard()
      analytics.track('dashboard_plan_view', {
        plan: user.subscription_tier || 'free',
        posts_remaining: postsRemaining,
        posts_used: user.posts_this_month || 0
      })
      loadConnectedAccounts(user.id)
    }
  }, [user])

  // Check for OAuth callback status
  function checkConnectionStatus() {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (success === 'facebook_connected') {
      setShowConnectionSuccess(true)
      setConnectionMessage('✅ Facebook account connected successfully!')
      setTimeout(() => setShowConnectionSuccess(false), 5000)
      
      // Track successful connection
      analytics.trackEvent('social_account_connected', {
        platform: 'facebook',
        success: true
      })
    }

    if (error) {
      setShowConnectionError(true)
      setConnectionMessage(`❌ Connection failed: ${message || error}`)
      setTimeout(() => setShowConnectionError(false), 8000)
      
      // Track connection error
      analytics.error('social_account_connection', message || error, 'dashboard')
    }
  }

  async function checkAuth() {
    try {
      const { data } = await supabase.auth.getSession()

      if (!data.session?.user?.id) {
        router.push('/login')
        return
      }

      const userId = data.session.user.id
      setUserId(userId)
      await loadUserData(userId)
    } catch (err) {
      console.error('Auth error:', err)
      analytics.error('authentication', 'Session check failed', 'dashboard')
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadUserData(userId: string) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setUser(data)
      setPostsRemaining(data.posts_limit - data.posts_this_month)
    }
  }

  async function loadConnectedAccounts(userId: string) {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (data) {
      setConnectedAccounts(data)
      analytics.trackEvent('connected_accounts_loaded', {
        count: data.length,
        platforms: data.map(acc => acc.platform)
      })
    }
  }

  async function disconnectAccount(accountId: string, platform: string) {
    const confirmed = confirm(`Are you sure you want to disconnect your ${platform} account?`)
    if (!confirmed) return

    const { error } = await supabase
      .from('social_accounts')
      .update({ is_active: false })
      .eq('id', accountId)

    if (!error && userId) {
      await loadConnectedAccounts(userId)
      analytics.trackEvent('social_account_disconnected', { platform })
      alert(`✅ ${platform} account disconnected!`)
    }
  }

  function getTierInfo() {
    if (!user) return { name: 'FREE', limit: 5, icon: '🎁' }

    const tier = user.subscription_tier?.toLowerCase() || 'free'

    switch (tier) {
      case 'starter':
        return { name: 'STARTER', limit: 50, icon: '⭐' }
      case 'pro':
        return { name: 'PRO', limit: 200, icon: '🚀' }
      case 'agency':
        return { name: 'AGENCY', limit: 999999, icon: '👑' }
      default:
        return { name: 'FREE', limit: 5, icon: '🎁' }
    }
  }

  const tierInfo = getTierInfo()
  const isUnlimited = tierInfo.limit > 10000

  async function handleGenerate() {
    if (!topic.trim()) {
      setError('Please enter a topic')
      analytics.trackEvent('generate_validation_error', {
        error: 'empty_topic',
        platform,
        tone
      })
      return
    }

    if (!userId) return

    setLoading(true)
    setError('')
    setPosts([])

    try {
      analytics.generatePost(platform, tone, topic)

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topic, platform, tone, contentLength, writingStyle, customInstructions, variationCount: 3 })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setPosts(data.posts)
      setPostsRemaining(data.postsRemaining)
      await loadUserData(userId)

      analytics.trackEvent('post_generation_success', {
        platform,
        tone,
        topic,
        variations_generated: data.posts.length,
        posts_remaining: data.postsRemaining,
        plan: user?.subscription_tier || 'free'
      })

    } catch (err: any) {
      setError(err.message)
      analytics.error('post_generation', err.message, 'dashboard')
      
      if (err.message.includes('limit')) {
        analytics.usageLimitReached(user?.subscription_tier || 'free', tierInfo.limit)
      }
    } finally {
      setLoading(false)
    }
  }

  function copyPost(content: string) {
    navigator.clipboard.writeText(content)
    analytics.copyPost(platform)
    alert('✅ Copied to clipboard!')
  }

  function handlePlatformChange(newPlatform: string) {
    setPlatform(newPlatform)
    analytics.trackEvent('platform_selected', {
      platform: newPlatform,
      previous_platform: platform
    })
  }

  function handleToneChange(newTone: string) {
    setTone(newTone)
    analytics.trackEvent('tone_selected', {
      tone: newTone,
      previous_tone: tone,
      platform
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-700">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      <main className="w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Connection Status Notifications */}
          {showConnectionSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl text-green-700 font-semibold animate-pulse">
              {connectionMessage}
            </div>
          )}

          {showConnectionError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-700 font-semibold">
              {connectionMessage}
            </div>
          )}

          {/* Header with Logo */}
          <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
              <Image
                src="/alpha-wings-ai-logo.png"
                alt="Alpha Wings Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Alpha Wings</h1>
              <p className="text-sm sm:text-base text-gray-600">AI-Powered Social Media Posts</p>
            </div>
          </div>

          {/* Connected Accounts Section - NEW */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Connected Accounts 🔗</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Facebook Card */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                {connectedAccounts.find(acc => acc.platform === 'facebook') ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">Facebook</div>
                        <div className="text-xs text-green-600">✓ Connected</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const account = connectedAccounts.find(acc => acc.platform === 'facebook')
                        if (account) disconnectAccount(account.id, 'Facebook')
                      }}
                      className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">Facebook</div>
                        <div className="text-xs text-gray-500">Not connected</div>
                      </div>
                    </div>
                    <ConnectFacebookButton />
                  </div>
                )}
              </div>

              {/* LinkedIn Card - Coming Soon */}
              <div className="border-2 border-gray-200 rounded-xl p-4 opacity-60">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#0A66C2] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">LinkedIn</div>
                      <div className="text-xs text-gray-500">Coming Soon</div>
                    </div>
                  </div>
                  <button
                    disabled
                    className="w-full px-3 py-2 bg-gray-200 text-gray-500 rounded-lg text-xs font-semibold cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>

              {/* Twitter Card - Coming Soon */}
              <div className="border-2 border-gray-200 rounded-xl p-4 opacity-60">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">Twitter</div>
                      <div className="text-xs text-gray-500">Coming Soon</div>
                    </div>
                  </div>
                  <button
                    disabled
                    className="w-full px-3 py-2 bg-gray-200 text-gray-500 rounded-lg text-xs font-semibold cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>

              {/* Instagram Card - Coming Soon */}
              <div className="border-2 border-gray-200 rounded-xl p-4 opacity-60">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">Instagram</div>
                      <div className="text-xs text-gray-500">Coming Soon</div>
                    </div>
                  </div>
                  <button
                    disabled
                    className="w-full px-3 py-2 bg-gray-200 text-gray-500 rounded-lg text-xs font-semibold cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Connect your social media accounts to enable direct posting from Alpha Wings
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {tierInfo.icon} {tierInfo.name} Plan
                </h2>
                <p className="text-blue-100 text-sm sm:text-base">
                  {isUnlimited
                    ? '♾️ Unlimited AI-powered posts'
                    : `Generate up to ${tierInfo.limit} posts per month`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl sm:text-5xl font-bold">
                  {isUnlimited ? '∞' : postsRemaining}
                </div>
                <div className="text-blue-100 text-sm sm:text-base">
                  {isUnlimited ? 'Unlimited Posts' : 'Posts Remaining'}
                </div>
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div 
              className="bg-white rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => analytics.viewUsageStats()}
            >
              <div className="text-gray-600 text-xs sm:text-sm font-medium">Monthly Limit</div>
              <div className="text-2xl sm:text-2xl font-bold text-blue-600 mt-2">
                {isUnlimited ? '♾️' : tierInfo.limit}
              </div>
            </div>
            <div 
              className="bg-white rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => analytics.viewUsageStats()}
            >
              <div className="text-gray-600 text-xs sm:text-sm font-medium">Used This Month</div>
              <div className="text-2xl sm:text-2xl font-bold text-orange-600 mt-2">{user?.posts_this_month || 0}</div>
            </div>
            <div 
              className="bg-white rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => analytics.viewUsageStats()}
            >
              <div className="text-gray-600 text-xs sm:text-sm font-medium">Remaining</div>
              <div className="text-2xl sm:text-2xl font-bold text-green-600 mt-2">
                {isUnlimited ? '♾️' : postsRemaining}
              </div>
            </div>
          </div>

          {/* Low Posts Warning */}
          {!isUnlimited && postsRemaining < 3 && postsRemaining > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    ⚠️ Running Low on Posts!
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700">
                    You have only {postsRemaining} posts remaining this month. Upgrade to {tierInfo.name === 'FREE' ? 'Starter (50 posts)' : tierInfo.name === 'STARTER' ? 'Pro (200 posts)' : 'Agency (Unlimited)'} to keep creating!
                  </p>
                </div>
                <button
                  onClick={() => {
                    analytics.clickUpgrade(tierInfo.name, tierInfo.name === 'FREE' ? 'Starter' : tierInfo.name === 'STARTER' ? 'Pro' : 'Agency')
                    window.location.href = '/pricing'
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl whitespace-nowrap transition-all text-sm sm:text-base"
                >
                  🚀 Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* Out of Posts */}
          {!isUnlimited && postsRemaining <= 0 && (
            <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    🎉 Monthly Limit Reached!
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700">
                    You've used all {tierInfo.limit} posts for this month. Your limit resets next month, or upgrade now for more!
                  </p>
                </div>
                <button
                  onClick={() => {
                    analytics.clickUpgrade(tierInfo.name, 'any_paid_plan')
                    analytics.trackEvent('limit_reached_upgrade_click', {
                      current_plan: tierInfo.name,
                      posts_used: user?.posts_this_month || 0
                    })
                    window.location.href = '/pricing'
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl whitespace-nowrap transition-all text-sm sm:text-base"
                >
                  📈 Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* REST OF YOUR CODE - Generation Form, Generated Posts, etc. */}
          {/* ... (keep all your existing generation form and posts display code) ... */}
          
          {/* Generation Form */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Generate New Post</h3>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2 text-sm sm:text-base">Topic 💡</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., AI trends in 2026"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={!isUnlimited && postsRemaining <= 0}
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-sm sm:text-base">Platform 📱</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {['linkedin', 'twitter', 'facebook', 'instagram'].map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePlatformChange(p)}
                      disabled={!isUnlimited && postsRemaining <= 0}
                      className={`p-2 sm:p-3 rounded-xl border-2 font-medium capitalize transition-all text-sm sm:text-base ${
                        platform === p
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2 text-sm sm:text-base">Tone 🎭</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                  {['professional', 'casual', 'enthusiastic', 'educational', 'inspirational', 
                    'humorous', 'authoritative', 'conversational', 'motivational', 'storytelling'].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleToneChange(t)}
                      disabled={!isUnlimited && postsRemaining <= 0}
                      className={`p-2 sm:p-3 rounded-xl border-2 font-medium capitalize transition-all text-xs sm:text-sm ${
                        tone === t
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2 text-sm sm:text-base">Content Length 📏</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'short', label: 'Short', desc: '50-100 words' },
                    { value: 'medium', label: 'Medium', desc: '100-200 words' },
                    { value: 'long', label: 'Long', desc: '200-300 words' }
                  ].map((length) => (
                    <button
                      key={length.value}
                      onClick={() => {
                        setContentLength(length.value)
                        analytics.trackEvent('content_length_selected', { length: length.value })
                      }}
                      disabled={!isUnlimited && postsRemaining <= 0}
                      className={`p-3 rounded-xl border-2 font-medium transition-all text-sm ${
                        contentLength === length.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="font-bold">{length.label}</div>
                      <div className="text-xs opacity-75">{length.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2 text-sm sm:text-base">Writing Style ✍️</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                  {[
                    { value: 'direct', label: 'Direct', emoji: '🎯' },
                    { value: 'storytelling', label: 'Story', emoji: '📖' },
                    { value: 'listicle', label: 'Listicle', emoji: '📝' },
                    { value: 'question', label: 'Question', emoji: '❓' },
                    { value: 'howto', label: 'How-to', emoji: '🔧' }
                  ].map((style) => (
                    <button
                      key={style.value}
                      onClick={() => {
                        setWritingStyle(style.value)
                        analytics.trackEvent('writing_style_selected', { style: style.value })
                      }}
                      disabled={!isUnlimited && postsRemaining <= 0}
                      className={`p-2 sm:p-3 rounded-xl border-2 font-medium transition-all text-xs sm:text-sm ${
                        writingStyle === style.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div>{style.emoji}</div>
                      <div>{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2 text-sm sm:text-base">
                  Custom Instructions 💡 <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g., Include a call-to-action, mention our upcoming webinar, use emojis..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[80px]"
                  disabled={!isUnlimited && postsRemaining <= 0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add specific requirements or preferences for your post generation
                </p>
              </div>

              {error && (
                <div className="p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm sm:text-base">
                  <div className="font-bold mb-1">⚠️ {error}</div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || (!isUnlimited && postsRemaining <= 0)}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-sm sm:text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Generating...
                  </span>
                ) : !isUnlimited && postsRemaining <= 0 ? (
                  '❌ Monthly Limit Reached'
                ) : (
                  '✨ Generate Posts'
                )}
              </button>
            </div>
          </div>

          {/* Generated Posts */}
          {posts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Your Generated Posts</h3>
              {posts.map((post, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:items-start mb-4">
                    <h4 className="font-bold text-base sm:text-lg text-gray-900">Variation {i + 1}</h4>
                    <button
                      onClick={() => copyPost(post.content)}
                      className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-xl mb-4 overflow-x-auto">
                    <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-gray-800">{post.content}</pre>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
                    <span>📝 {post.word_count} words</span>
                    <span>🔤 {post.character_count} characters</span>
                    <span>⭐ Quality: {post.quality_score}/10</span>
                    <span className="capitalize">🎭 {post.tone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
