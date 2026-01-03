'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import { analytics } from '@/lib/analytics'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function Dashboard() {
  const router = useRouter()
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

  useEffect(() => {
    checkAuth()
  }, [])

  // 🎯 Track dashboard view on mount
  useEffect(() => {
    if (user) {
      analytics.viewDashboard()
      analytics.trackEvent('dashboard_plan_view', {
        plan: user.subscription_tier || 'free',
        posts_remaining: postsRemaining,
        posts_used: user.posts_this_month || 0
      })
    }
  }, [user])

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
      // 🎯 Track auth error
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
      // 🎯 Track validation error
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
      // 🎯 Track post generation attempt
      analytics.generatePost(platform, tone, topic)

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topic, platform, tone, variationCount: 3 })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setPosts(data.posts)
      setPostsRemaining(data.postsRemaining)
      await loadUserData(userId)

      // 🎯 Track successful generation
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
      
      // 🎯 Track generation error
      analytics.error('post_generation', err.message, 'dashboard')
      
      // 🎯 Track if user hit limit
      if (err.message.includes('limit')) {
        analytics.usageLimitReached(user?.subscription_tier || 'free', tierInfo.limit)
      }
    } finally {
      setLoading(false)
    }
  }

  function copyPost(content: string) {
    navigator.clipboard.writeText(content)
    
    // 🎯 Track copy event
    analytics.copyPost(platform)
    
    alert('✅ Copied to clipboard!')
  }

  // 🎯 Track platform selection
  function handlePlatformChange(newPlatform: string) {
    setPlatform(newPlatform)
    analytics.trackEvent('platform_selected', {
      platform: newPlatform,
      previous_platform: platform
    })
  }

  // 🎯 Track tone selection
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

          {/* Plan Details - Responsive Grid */}
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
                    // 🎯 Track upgrade click
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
                    // 🎯 Track upgrade click from limit reached
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
                  {['professional', 'casual', 'enthusiastic', 'educational', 'inspirational'].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleToneChange(t)}
                      disabled={!isUnlimited && postsRemaining <= 0}
                      className={`p-2 sm:p-3 rounded-xl border-2 font-medium capitalize transition-all text-xs sm:text-base ${
                        tone === t
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div>{t}</div>
                    </button>
                  ))}
                </div>
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
