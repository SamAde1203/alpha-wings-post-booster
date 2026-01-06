'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import { analytics } from '@/lib/analytics'
import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface Post {
  id: string
  content: string
  platform: string
  tone: string
  writing_style: string
  content_length: string
  word_count: number
  quality_score: number
  created_at: string
  status: string
  views?: number
  likes?: number
  comments?: number
  shares?: number
}

interface AnalyticsData {
  totalPosts: number
  postsThisMonth: number
  postsByPlatform: Record<string, number>
  postsByTone: Record<string, number>
  postsByStyle: Record<string, number>
  averageQuality: number
  recentPosts: Post[]
  postsThisWeek: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  draftCount: number
  scheduledCount: number
  postedCount: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')

  useEffect(() => {
    checkAuthAndLoadData()
    analytics.trackEvent('analytics_page_viewed', { timestamp: new Date().toISOString() })
  }, [])

  useEffect(() => {
    if (userId) {
      loadAnalytics()
    }
  }, [userId, timeRange])

  async function checkAuthAndLoadData() {
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session?.user?.id) {
        router.push('/login')
        return
      }
      setUserId(data.session.user.id)
    } catch (err) {
      console.error('Auth error:', err)
      router.push('/login')
    }
  }

  async function loadAnalytics() {
    if (!userId) return
    
    setLoading(true)
    try {
      // Calculate date range
      const now = new Date()
      let startDate = new Date()
      
      if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7)
      } else if (timeRange === 'month') {
        startDate.setMonth(now.getMonth() - 1)
      } else {
        startDate = new Date('2020-01-01') // All time
      }

      // Fetch all posts for this user in the time range
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate analytics
      const postsByPlatform: Record<string, number> = {}
      const postsByTone: Record<string, number> = {}
      const postsByStyle: Record<string, number> = {}
      let totalQuality = 0
      let totalViews = 0
      let totalLikes = 0
      let totalComments = 0
      let totalShares = 0
      let draftCount = 0
      let scheduledCount = 0
      let postedCount = 0

      posts?.forEach((post: Post) => {
        // Platform counts
        postsByPlatform[post.platform] = (postsByPlatform[post.platform] || 0) + 1
        
        // Tone counts
        postsByTone[post.tone] = (postsByTone[post.tone] || 0) + 1
        
        // Style counts
        postsByStyle[post.writing_style] = (postsByStyle[post.writing_style] || 0) + 1
        
        // Quality score
        totalQuality += post.quality_score || 0

        // Engagement metrics
        totalViews += post.views || 0
        totalLikes += post.likes || 0
        totalComments += post.comments || 0
        totalShares += post.shares || 0

        // Status counts
        if (post.status === 'draft') draftCount++
        if (post.status === 'scheduled') scheduledCount++
        if (post.status === 'posted') postedCount++
      })

      // Posts this week
      const weekAgo = new Date()
      weekAgo.setDate(now.getDate() - 7)
      const postsThisWeek = posts?.filter(
        (p: Post) => new Date(p.created_at) >= weekAgo
      ).length || 0

      // Posts this month
      const monthAgo = new Date()
      monthAgo.setMonth(now.getMonth() - 1)
      const postsThisMonth = posts?.filter(
        (p: Post) => new Date(p.created_at) >= monthAgo
      ).length || 0

      setData({
        totalPosts: posts?.length || 0,
        postsThisMonth,
        postsThisWeek,
        postsByPlatform,
        postsByTone,
        postsByStyle,
        averageQuality: posts?.length ? totalQuality / posts.length : 0,
        recentPosts: posts?.slice(0, 10) || [],
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        draftCount,
        scheduledCount,
        postedCount
      })

    } catch (err) {
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function deletePost(postId: string) {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await supabase.from('posts').delete().eq('id', postId)
      analytics.trackEvent('post_deleted', { postId })
      loadAnalytics() // Reload data
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete post')
    }
  }

  function copyPost(content: string) {
    navigator.clipboard.writeText(content)
    analytics.trackEvent('post_copied_from_analytics', {})
    alert('✅ Copied to clipboard!')
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

      <main className="w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16">
                <Image
                  src="/alpha-wings-ai-logo.png"
                  alt="Alpha Wings Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
                <p className="text-gray-600">Track your content performance</p>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-3">
              {(['week', 'month', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
              <div className="text-sm opacity-90 mb-2">Total Posts</div>
              <div className="text-3xl sm:text-4xl font-bold">{data?.totalPosts || 0}</div>
              <div className="text-xs sm:text-sm opacity-75 mt-2">
                {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'All Time'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
              <div className="text-sm opacity-90 mb-2">This Week</div>
              <div className="text-3xl sm:text-4xl font-bold">{data?.postsThisWeek || 0}</div>
              <div className="text-xs sm:text-sm opacity-75 mt-2">Posts generated</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
              <div className="text-sm opacity-90 mb-2">Avg Quality</div>
              <div className="text-3xl sm:text-4xl font-bold">{data?.averageQuality.toFixed(1) || 0}/10</div>
              <div className="text-xs sm:text-sm opacity-75 mt-2">Content score</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
              <div className="text-sm opacity-90 mb-2">This Month</div>
              <div className="text-3xl sm:text-4xl font-bold">{data?.postsThisMonth || 0}</div>
              <div className="text-xs sm:text-sm opacity-75 mt-2">Posts generated</div>
            </div>
          </div>

          {/* Engagement Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data?.totalViews || 0}</div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Total Views</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data?.totalLikes || 0}</div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Total Likes</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data?.totalComments || 0}</div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Comments</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Share2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data?.totalShares || 0}</div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Shares</div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">📄 Draft</h3>
                <span className="text-xl sm:text-2xl font-bold text-gray-700">{data?.draftCount || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full" 
                  style={{ width: `${data?.totalPosts ? (data.draftCount / data.totalPosts * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">⏰ Scheduled</h3>
                <span className="text-xl sm:text-2xl font-bold text-blue-700">{data?.scheduledCount || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${data?.totalPosts ? (data.scheduledCount / data.totalPosts * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">✅ Posted</h3>
                <span className="text-xl sm:text-2xl font-bold text-green-700">{data?.postedCount || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${data?.totalPosts ? (data.postedCount / data.totalPosts * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Posts by Platform */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">📱 By Platform</h3>
              <div className="space-y-3">
                {Object.entries(data?.postsByPlatform || {}).map(([platform, count]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <span className="capitalize font-medium text-gray-700 text-sm sm:text-base">{platform}</span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${(count / (data?.totalPosts || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-900 w-6 sm:w-8 text-sm sm:text-base">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Posts by Tone */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">🎭 By Tone</h3>
              <div className="space-y-3">
                {Object.entries(data?.postsByTone || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([tone, count]) => (
                    <div key={tone} className="flex items-center justify-between">
                      <span className="capitalize font-medium text-gray-700 text-sm sm:text-base">{tone}</span>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-purple-600 h-3 rounded-full transition-all"
                            style={{ width: `${(count / (data?.totalPosts || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 w-6 sm:w-8 text-sm sm:text-base">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Posts by Style */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">✍️ By Style</h3>
              <div className="space-y-3">
                {Object.entries(data?.postsByStyle || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([style, count]) => (
                    <div key={style} className="flex items-center justify-between">
                      <span className="capitalize font-medium text-gray-700 text-sm sm:text-base">{style}</span>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-600 h-3 rounded-full transition-all"
                            style={{ width: `${(count / (data?.totalPosts || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 w-6 sm:w-8 text-sm sm:text-base">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Notice */}
          {data && data.totalViews === 0 && data.totalLikes === 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8">
              <p className="text-sm text-blue-800">
                <strong>📌 Note:</strong> Connect your social accounts and enable auto-posting to track real engagement metrics (views, likes, comments, shares).
              </p>
            </div>
          )}

          {/* Recent Posts */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">📝 Recent Posts</h3>
            <div className="space-y-4">
              {data?.recentPosts.map((post) => (
                <div key={post.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium capitalize">
                        {post.platform}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium capitalize">
                        {post.tone}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium capitalize">
                        {post.writing_style}
                      </span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs sm:text-sm font-medium">
                        ⭐ {post.quality_score}/10
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm sm:text-base text-gray-700 mb-3 line-clamp-3">
                    {post.content}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyPost(post.content)}
                      className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-xs sm:text-sm transition-colors"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-xs sm:text-sm transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
