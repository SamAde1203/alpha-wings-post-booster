'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Navigation from '@/components/Navigation'

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

  useEffect(() => {
    getCurrentUser()
  }, [])

  async function getCurrentUser() {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()

      if (!res.ok || !data.userId) {
        router.push('/login')
        return
      }

      setUserId(data.userId)
    } catch (err) {
      console.error('Error getting current user:', err)
      router.push('/login')
    }
  }

  useEffect(() => {
    if (userId) {
      loadUserData()
    }
  }, [userId])

  async function loadUserData() {
    if (!userId) return

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
  // Helper function to get tier display info
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
      return
    }

    setLoading(true)
    setError('')
    setPosts([])

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topic, platform, tone, variationCount: 3 })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setPosts(data.posts)
      setPostsRemaining(data.postsRemaining)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function copyPost(content: string) {
    navigator.clipboard.writeText(content)
    alert('✅ Copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Stats Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {tierInfo.icon} {tierInfo.name} Plan
              </h2>
              <p className="text-blue-100">
                {isUnlimited
                  ? '♾️ Unlimited AI-powered posts'
                  : `Generate up to ${tierInfo.limit} posts per month`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">
                {isUnlimited ? '∞' : postsRemaining}
              </div>
              <div className="text-blue-100">
                {isUnlimited ? 'Unlimited Posts' : 'Posts Remaining'}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Details */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-gray-600 text-sm font-medium">Monthly Limit</div>
            <div className="text-2xl font-bold text-blue-600">
              {isUnlimited ? '♾️' : tierInfo.limit}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-gray-600 text-sm font-medium">Used This Month</div>
            <div className="text-2xl font-bold text-orange-600">{user?.posts_this_month || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-gray-600 text-sm font-medium">Remaining</div>
            <div className="text-2xl font-bold text-green-600">
              {isUnlimited ? '♾️' : postsRemaining}
            </div>
          </div>
        </div>

        {/* Low Posts Warning */}
        {!isUnlimited && postsRemaining < 3 && postsRemaining > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ⚠️ Running Low on Posts!
                </h3>
                <p className="text-gray-700">
                  You have only {postsRemaining} posts remaining this month. Upgrade to {tierInfo.name === 'FREE' ? 'Starter (50 posts)' : tierInfo.name === 'STARTER' ? 'Pro (200 posts)' : 'Agency (Unlimited)'} to keep creating!
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl whitespace-nowrap transition-all"
              >
                🚀 Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Out of Posts */}
        {!isUnlimited && postsRemaining <= 0 && (
          <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🎉 Monthly Limit Reached!
                </h3>
                <p className="text-gray-700">
                  You've used all {tierInfo.limit} posts for this month. Your limit resets next month, or upgrade now for more!
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl whitespace-nowrap transition-all"
              >
                📈 Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Generation Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6">Generate New Post</h3>

          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Topic 💡</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI trends in 2026"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={!isUnlimited && postsRemaining <= 0}
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Platform 📱</label>
              <div className="grid grid-cols-4 gap-3">
                {['linkedin', 'twitter', 'facebook', 'instagram'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    disabled={!isUnlimited && postsRemaining <= 0}
                    className={`p-3 rounded-xl border-2 font-medium capitalize transition-all ${
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
              <label className="block font-medium mb-2">Tone 🎭</label>
              <div className="grid grid-cols-5 gap-3">
                {['professional', 'casual', 'enthusiastic', 'educational', 'inspirational'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    disabled={!isUnlimited && postsRemaining <= 0}
                    className={`p-3 rounded-xl border-2 font-medium capitalize transition-all ${
                      tone === t
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="text-xs">{t}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
                <div className="font-bold mb-1">⚠️ {error}</div>
                {error.includes('Limit reached') && (
                  <div className="text-sm mt-2">
                    <p>You've used all your posts for this month! 🎉</p>
                    <p className="mt-1">
                      <a href="/pricing" className="text-red-600 font-bold underline">
                        Upgrade now
                      </a> to continue generating amazing content!
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || (!isUnlimited && postsRemaining <= 0)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            <h3 className="text-2xl font-bold text-gray-900">Your Generated Posts</h3>
            {posts.map((post, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-lg text-gray-900">Variation {i + 1}</h4>
                  <button
                    onClick={() => copyPost(post.content)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-md hover:shadow-lg"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl mb-4">
                  <pre className="whitespace-pre-wrap font-sans text-gray-800">{post.content}</pre>
                </div>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span>📝 {post.word_count} words</span>
                  <span>🔤 {post.character_count} characters</span>
                  <span>⭐ Quality: {post.quality_score}/10</span>
                  <span className="capitalize">🎭 {post.tone}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
