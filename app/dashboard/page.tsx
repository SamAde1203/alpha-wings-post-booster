'use client'

import { useState, useEffect, Suspense } from 'react'
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

// Separate component for the content that uses useSearchParams
function DashboardContent() {
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

  function checkConnectionStatus() {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (success === 'facebook_connected') {
      setShowConnectionSuccess(true)
      setConnectionMessage('✅ Facebook account connected successfully!')
      setTimeout(() => setShowConnectionSuccess(false), 5000)
      
      analytics.trackEvent('social_account_connected', {
        platform: 'facebook',
        success: true
      })
    }

    if (error) {
      setShowConnectionError(true)
      setConnectionMessage(`❌ Connection failed: ${message || error}`)
      setTimeout(() => setShowConnectionError(false), 8000)
      
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

          {/* Connected Accounts Section */}
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

              {/* Other platforms - Coming Soon */}
              {/* Add LinkedIn, Twitter, Instagram cards here */}
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Connect your social media accounts to enable direct posting from Alpha Wings
            </p>
          </div>

          {/* REST OF YOUR DASHBOARD CODE */}
          {/* Keep all your existing stats, generation form, etc. */}
          
        </div>
      </main>
    </div>
  )
}

// Main component with Suspense wrapper
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-700">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
