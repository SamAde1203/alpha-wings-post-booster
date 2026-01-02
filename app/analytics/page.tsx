'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navigation from '@/components/Navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function AnalyticsPage() {
  const [userId] = useState('438a1d7b-a880-4956-ba3b-e6a69277019b')
  const [stats, setStats] = useState<any>({
    totalPosts: 0,
    thisMonth: 0,
    platforms: {},
    tones: {},
    avgQuality: 0,
    topTopics: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    const { data: posts } = await supabase
      .from('generated_posts')
      .select('*')
      .eq('user_id', userId)

    if (posts) {
      const now = new Date()
      const thisMonth = posts.filter(p => {
        const created = new Date(p.created_at)
        return created.getMonth() === now.getMonth() && 
               created.getFullYear() === now.getFullYear()
      })

      const platforms = posts.reduce((acc: any, p) => {
        acc[p.platform] = (acc[p.platform] || 0) + 1
        return acc
      }, {})

      const tones = posts.reduce((acc: any, p) => {
        acc[p.tone] = (acc[p.tone] || 0) + 1
        return acc
      }, {})

      const topicCounts = posts.reduce((acc: any, p) => {
        acc[p.topic] = (acc[p.topic] || 0) + 1
        return acc
      }, {})

      const topTopics = Object.entries(topicCounts)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)

      const avgQuality = posts.length > 0
        ? posts.reduce((sum, p) => sum + (p.quality_score || 0), 0) / posts.length
        : 0

      setStats({
        totalPosts: posts.length,
        thisMonth: thisMonth.length,
        platforms,
        tones,
        avgQuality: avgQuality.toFixed(1),
        topTopics,
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">📊 Analytics Dashboard</h2>
          <p className="text-gray-600">Track your content performance and insights</p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalPosts}</div>
            <div className="text-sm text-gray-600">Total Posts Generated</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-3xl font-bold text-gray-900">{stats.thisMonth}</div>
            <div className="text-sm text-gray-600">Posts This Month</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-gray-900">{stats.avgQuality}</div>
            <div className="text-sm text-gray-600">Avg Quality Score</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-gray-900">{Object.keys(stats.platforms).length}</div>
            <div className="text-sm text-gray-600">Platforms Used</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Platform Distribution */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📱 Platform Distribution</h3>
            <div className="space-y-4">
              {Object.entries(stats.platforms).map(([platform, count]: any) => {
                const percentage = (count / stats.totalPosts) * 100
                return (
                  <div key={platform}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700 capitalize">{platform}</span>
                      <span className="text-gray-600">{count} posts ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tone Analysis */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">🎭 Tone Analysis</h3>
            <div className="space-y-4">
              {Object.entries(stats.tones).map(([tone, count]: any) => {
                const percentage = (count / stats.totalPosts) * 100
                return (
                  <div key={tone}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700 capitalize">{tone}</span>
                      <span className="text-gray-600">{count} posts ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Topics */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">🔥 Top Topics</h3>
            <div className="space-y-3">
              {stats.topTopics.map(([topic, count]: any, index: number) => (
                <div key={topic} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{topic}</div>
                    <div className="text-sm text-gray-600">{count} posts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Recent Activity</h3>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h4 className="font-bold text-gray-900 mb-2">Activity Chart Coming Soon</h4>
              <p className="text-gray-600">
                Track your posting trends over time with interactive charts
              </p>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">💡 Performance Insights</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-bold mb-1">Keep It Up!</div>
              <div className="text-blue-100 text-sm">
                You're consistently creating quality content
              </div>
            </div>
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-bold mb-1">Diversify Platforms</div>
              <div className="text-blue-100 text-sm">
                Consider posting to more platforms for better reach
              </div>
            </div>
            <div>
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-bold mb-1">High Quality</div>
              <div className="text-blue-100 text-sm">
                Your average quality score is {stats.avgQuality}/10
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
