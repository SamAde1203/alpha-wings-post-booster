'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { analytics } from '@/lib/analytics'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function PostsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    checkAuth()
    analytics.trackEvent('posts_page_viewed', { page: 'posts' })
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, filterPlatform, filterStatus])

  async function checkAuth() {
    const { data } = await supabase.auth.getSession()
    if (!data.session?.user?.id) {
      router.push('/login')
      return
    }

    const userId = data.session.user.id
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    setUser(userData)
    await loadPosts(userId)
  }

  async function loadPosts(userId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading posts:', error)
      analytics.error('load_posts', error.message, 'posts_page')
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }

  function filterPosts() {
    let filtered = [...posts]

    if (filterPlatform !== 'all') {
      filtered = filtered.filter(p => p.platform === filterPlatform)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus)
    }

    setFilteredPosts(filtered)
  }

  function copyPost(content: string) {
    navigator.clipboard.writeText(content)
    analytics.trackEvent('post_copied', { source: 'posts_page' })
    alert('✅ Copied to clipboard!')
  }

  async function deletePost(postId: string) {
    if (!confirm('Are you sure you want to delete this post?')) return

    analytics.trackEvent('post_deleted', { post_id: postId })

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('Error deleting post:', error)
      alert('❌ Error deleting post')
    } else {
      setPosts(posts.filter(p => p.id !== postId))
      alert('✅ Post deleted successfully!')
    }
  }

  const platformEmojis: Record<string, string> = {
    linkedin: '💼',
    twitter: '🐦',
    facebook: '📘',
    instagram: '📸'
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    posted: 'bg-green-100 text-green-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-700">Loading your posts...</div>
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
            📚 My Posts
          </h1>
          <p className="text-lg text-gray-600">
            All your AI-generated posts in one place
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-3xl font-bold text-gray-900">{posts.length}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">📄</div>
            <div className="text-3xl font-bold text-blue-600">
              {posts.filter(p => p.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">⏰</div>
            <div className="text-3xl font-bold text-orange-600">
              {posts.filter(p => p.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-3xl font-bold text-green-600">
              {posts.filter(p => p.status === 'posted').length}
            </div>
            <div className="text-sm text-gray-600">Posted</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                value={filterPlatform}
                onChange={(e) => {
                  setFilterPlatform(e.target.value)
                  analytics.trackEvent('posts_filtered', { filter: 'platform', value: e.target.value })
                }}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Platforms</option>
                <option value="linkedin">💼 LinkedIn</option>
                <option value="twitter">🐦 Twitter</option>
                <option value="facebook">📘 Facebook</option>
                <option value="instagram">📸 Instagram</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  analytics.trackEvent('posts_filtered', { filter: 'status', value: e.target.value })
                }}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">📄 Draft</option>
                <option value="scheduled">⏰ Scheduled</option>
                <option value="posted">✅ Posted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Posts Yet</h3>
            <p className="text-gray-600 mb-6">
              {filterPlatform !== 'all' || filterStatus !== 'all'
                ? 'No posts match your filters. Try adjusting them.'
                : 'Generate your first AI-powered post in the dashboard!'}
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              ✨ Generate Posts
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{platformEmojis[post.platform]}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900 capitalize">
                          {post.platform}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[post.status]}`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyPost(post.content)}
                      className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                    {post.content}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>📝 {post.word_count} words</span>
                  <span>🔤 {post.character_count} chars</span>
                  <span>⭐ Quality: {post.quality_score}/10</span>
                  <span className="capitalize">🎭 {post.tone}</span>
                  {post.topic && <span>💡 {post.topic}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
