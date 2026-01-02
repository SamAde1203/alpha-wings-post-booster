'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navigation from '@/components/Navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function PostsPage() {
  const [userId] = useState('438a1d7b-a880-4956-ba3b-e6a69277019b')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadPosts()
  }, [filter])

  async function loadPosts() {
    setLoading(true)
    
    let query = supabase
      .from('generated_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('platform', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading posts:', error)
    } else {
      setPosts(data || [])
    }
    
    setLoading(false)
  }

  function copyPost(content: string) {
    navigator.clipboard.writeText(content)
    alert('✅ Copied to clipboard!')
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return

    await supabase.from('generated_posts').delete().eq('id', id)
    loadPosts()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">📚 My Posts</h2>
          <p className="text-gray-600">View and manage all your generated posts</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-medium text-gray-700">Filter:</span>
            {['all', 'linkedin', 'twitter', 'facebook', 'instagram'].map((platform) => (
              <button
                key={platform}
                onClick={() => setFilter(platform)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  filter === platform
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            Total posts: <span className="font-bold">{posts.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Generate your first AI-powered post!</p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl"
            >
              ✨ Create Post
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize mb-2">
                      {post.platform}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900">{post.topic}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyPost(post.content)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
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
