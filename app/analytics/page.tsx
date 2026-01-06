'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { analytics } from '@/lib/analytics'
import { TrendingUp, Eye, Heart, MessageCircle, Share2, Target, Award, Calendar } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function AnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({})
  const [topPosts, setTopPosts] = useState<any[]>([])
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [platformStats, setPlatformStats] = useState<any[]>([])

  useEffect(() => {
    checkAuth()
    analytics.trackEvent('analytics_page_viewed', { page: 'analytics' })
  }, [])

  useEffect(() => {
    if (userId) {
      loadAnalytics()
    }
  }, [userId])

  async function checkAuth() {
    const { data } = await supabase.auth.getSession()
    if (!data.session?.user?.id) {
      router.push('/login')
      return
    }

    const id = data.session.user.id
    setUserId(id)

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    setUser(userData)
  }

  async function loadAnalytics() {
    if (!userId) return

    setLoading(true)

    // Load all posts for this user
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (posts) {
      // Calculate overall stats
      const totalPosts = posts.length
      const postedCount = posts.filter(p => p.status === 'posted').length
      const scheduledCount = posts.filter(p => p.status === 'scheduled').length
      const draftCount = posts.filter(p => p.status === 'draft').length

      // Calculate engagement (simulated for now - in production this comes from real APIs)
      const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0)
      const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0)
      const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0)
      const totalShares = posts.reduce((sum, p) => sum + (p.shares || 0), 0)

      setStats({
        totalPosts,
        postedCount,
        scheduledCount,
        draftCount,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        avgEngagement: totalPosts > 0 ? ((totalLikes + totalComments + totalShares) / totalPosts).toFixed(1) : 0
      })

      // Get top performing posts (sorted by engagement)
      const sortedByEngagement = [...posts]
        .filter(p => (p.likes || 0) + (p.comments || 0) + (p.shares || 0) > 0)
        .sort((a, b) => {
          const engagementA = (a.likes || 0) + (a.comments || 0) + (a.shares || 0)
          const engagementB = (b.likes || 0) + (b.comments || 0) + (b.shares || 0)
          return engagementB - engagementA
        })
        .slice(0, 5)

      setTopPosts(sortedByEngagement)

      // Get recent posts
      setRecentPosts(posts.slice(0, 10))

      // Calculate platform stats
      const platforms = ['linkedin', 'twitter', 'facebook', 'instagram']
      const platformData = platforms.map(platform => {
        const platformPosts = posts.filter(p => p.platform === platform)
        const count = platformPosts.length
        const engagement = platformPosts.reduce((sum, p) => 
          sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0
        )
        return {
          platform,
          count,
          engagement,
          avgEngagement: count > 0 ? (engagement / count).toFixed(1) : 0
        }
      }).filter(p => p.count > 0)

      setPlatformStats(platformData)
    }

    setLoading(false)
  }

  const platformEmojis: Record<string, string> = {
    linkedin: '💼',
    twitter: '🐦',
    facebook: '📘',
    instagram: '📸'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-700">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            📊 Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Track your content performance and engagement
          </p>
        </div>

        {/* Notice for simulated data */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-blue-800">
            <strong>📌 Note:</strong> Real-time engagement metrics will be available once you connect your social media accounts and enable auto-posting. For now, analytics show post creation statistics.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="text-3xl font-bold text-gray-900">{stats.totalPosts}</div>
            </div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="h-8 w-8 text-purple-600" />
              <div className="text-3xl font-bold text-gray-900">{stats.totalViews}</div>
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="text-3xl font-bold text-gray-900">{stats.totalLikes}</div>
            </div>
            <div className="text-sm text-gray-600">Total Likes</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <div className="text-3xl font-bold text-gray-900">{stats.totalComments}</div>
            </div>
            <div className="text-sm text-gray-600">Comments</div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">📄 Draft</h3>
              <span className="text-2xl font-bold text-gray-700">{stats.draftCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-600 h-2 rounded-full" 
                style={{ width: `${stats.totalPosts > 0 ? (stats.draftCount / stats.totalPosts * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">⏰ Scheduled</h3>
              <span className="text-2xl font-bold text-blue-700">{stats.scheduledCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${stats.totalPosts > 0 ? (stats.scheduledCount / stats.totalPosts * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">✅ Posted</h3>
              <span className="text-2xl font-bold text-green-700">{stats.postedCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${stats.totalPosts > 0 ? (stats.postedCount / stats.totalPosts * 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Platform Performance */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              🎯 Platform Performance
            </h3>

            {platformStats.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No platform data yet</p>
                <a href="/dashboard" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  Generate your first post
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {platformStats.map((platform) => (
                  <div key={platform.platform} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{platformEmojis[platform.platform]}</span>
                        <span className="font-bold text-gray-900 capitalize">{platform.platform}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {platform.count} posts
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📊 Avg Engagement: {platform.avgEngagement}</span>
                      <span>💬 Total: {platform.engagement}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Performing Posts */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              🏆 Top Performing Posts
            </h3>

            {topPosts.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No engagement data yet</p>
                <p className="text-sm text-gray-500">
                  Connect social accounts to track performance
                </p>
                <a href="/connect" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  Connect accounts
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {topPosts.map((post, index) => (
                  <div key={post.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{platformEmojis[post.platform]}</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                            {post.platform}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-600">
                          <span>❤️ {post.likes || 0}</span>
                          <span>💬 {post.comments || 0}</span>
                          <span>🔄 {post.shares || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            📅 Recent Activity
          </h3>

          {recentPosts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{platformEmojis[post.platform]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {post.content.substring(0, 60)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()} • {post.platform}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    post.status === 'posted' ? 'bg-green-100 text-green-700' :
                    post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <h3 className="text-2xl font-bold mb-4">💡 AI Insights</h3>
          <div className="space-y-3">
            <p className="text-blue-100">
              ✨ <strong>Tip:</strong> You've created {stats.totalPosts} posts! Connect your social accounts to start tracking real engagement metrics.
            </p>
            {stats.draftCount > 0 && (
              <p className="text-blue-100">
                📝 <strong>Action:</strong> You have {stats.draftCount} draft posts ready to schedule. Plan your content calendar!
              </p>
            )}
            {platformStats.length > 0 && (
              <p className="text-blue-100">
                🎯 <strong>Performance:</strong> {platformStats[0]?.platform} is your most active platform with {platformStats[0]?.count} posts.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
