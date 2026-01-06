'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { analytics } from '@/lib/analytics'
import { format } from 'date-fns'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function SchedulePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([])
  const [draftPosts, setDraftPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [scheduleTime, setScheduleTime] = useState('')

  useEffect(() => {
    checkAuth()
    analytics.trackEvent('schedule_page_viewed', { page: 'schedule' })
  }, [])

  useEffect(() => {
    if (userId) {
      loadData()
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

  async function loadData() {
    if (!userId) return
    
    setLoading(true)
    
    // Load scheduled posts from posts table
    const { data: scheduled } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .order('scheduled_for', { ascending: true })

    // Load draft posts (ready to schedule)
    const { data: drafts } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(20)

    setScheduledPosts(scheduled || [])
    setDraftPosts(drafts || [])
    setLoading(false)
  }

  async function handleSchedulePost() {
    if (!selectedPost || !scheduleTime) {
      alert('Please select a post and time')
      return
    }

    const scheduledDateTime = new Date(scheduleTime)
    
    if (scheduledDateTime < new Date()) {
      alert('Cannot schedule posts in the past')
      return
    }

    analytics.trackEvent('post_scheduled', {
      post_id: selectedPost.id,
      platform: selectedPost.platform,
      scheduled_for: scheduledDateTime.toISOString()
    })

    const { error } = await supabase
      .from('posts')
      .update({
        scheduled_for: scheduledDateTime.toISOString(),
        status: 'scheduled',
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedPost.id)
      .eq('user_id', userId)

    if (error) {
      console.error('Schedule error:', error)
      alert('Error scheduling post: ' + error.message)
    } else {
      alert('✅ Post scheduled successfully!')
      setShowScheduleModal(false)
      setSelectedPost(null)
      setScheduleTime('')
      loadData()
    }
  }

  async function cancelScheduledPost(postId: string) {
    if (!confirm('Cancel this scheduled post?')) return

    analytics.trackEvent('post_unscheduled', { post_id: postId })

    const { error } = await supabase
      .from('posts')
      .update({
        scheduled_for: null,
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .eq('user_id', userId)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('✅ Post unscheduled!')
      loadData()
    }
  }

  async function deleteScheduledPost(postId: string) {
    if (!confirm('Delete this scheduled post?')) return

    analytics.trackEvent('post_deleted', { post_id: postId })

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('✅ Post deleted!')
      loadData()
    }
  }

  const upcomingPosts = scheduledPosts.filter(p => 
    new Date(p.scheduled_for) > new Date()
  )

  const postsOnSelectedDate = scheduledPosts.filter(p => {
    const postDate = new Date(p.scheduled_for)
    return postDate.toDateString() === selectedDate.toDateString()
  })

  const platformEmojis: Record<string, string> = {
    linkedin: '💼',
    twitter: '🐦',
    facebook: '📘',
    instagram: '📸'
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">📅 Post Scheduler</h2>
          <p className="text-gray-600">Schedule your posts for automatic publishing</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl mb-2">⏰</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{upcomingPosts.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl mb-2">✅</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">0</div>
            <div className="text-xs sm:text-sm text-gray-600">Published</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl mb-2">📝</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{draftPosts.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Ready to Schedule</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="text-2xl sm:text-3xl mb-2">📆</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{postsOnSelectedDate.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">On Selected Date</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Upcoming Posts */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">⏰ Upcoming Posts</h3>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
              >
                + Schedule New
              </button>
            </div>

            {upcomingPosts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-3xl sm:text-4xl mb-4">📭</div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">No upcoming scheduled posts</p>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg text-sm sm:text-base"
                >
                  Schedule Your First Post
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {upcomingPosts.map(post => (
                  <div key={post.id} className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl sm:text-2xl">{platformEmojis[post.platform]}</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                            {post.platform}
                          </span>
                        </div>
                        <div className="font-bold text-gray-900 text-sm sm:text-base">
                          {format(new Date(post.scheduled_for), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          {format(new Date(post.scheduled_for), 'h:mm a')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => cancelScheduledPost(post.id)}
                          className="px-2 sm:px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteScheduledPost(post.id)}
                          className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-700 line-clamp-3">{post.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Draft Posts Available to Schedule */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">📝 Available Posts</h3>
            
            {draftPosts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-3xl sm:text-4xl mb-4">📭</div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">No draft posts available</p>
                <a
                  href="/dashboard"
                  className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 text-sm sm:text-base"
                >
                  Generate Posts
                </a>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {draftPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedPost(post)
                      setShowScheduleModal(true)
                    }}
                    className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl">{platformEmojis[post.platform]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                            {post.platform}
                          </span>
                          <span className="text-xs text-gray-500">
                            {post.word_count} words
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{post.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Schedule Post</h3>
                <button
                  onClick={() => { 
                    setShowScheduleModal(false)
                    setSelectedPost(null)
                    setScheduleTime('') 
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {!selectedPost ? (
                <>
                  <h4 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">Select a post to schedule:</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {draftPosts.map(post => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 cursor-pointer transition-all"
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <span className="text-xl sm:text-2xl">{platformEmojis[post.platform]}</span>
                          <div className="flex-1 min-w-0">
                            <span className="inline-block px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize mb-2">
                              {post.platform}
                            </span>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{post.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">Selected Post:</h4>
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl sm:text-2xl">{platformEmojis[selectedPost.platform]}</span>
                        <span className="px-2 sm:px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-medium capitalize">
                          {selectedPost.platform}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700">{selectedPost.content}</p>
                    </div>
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="mt-3 text-blue-600 text-xs sm:text-sm hover:underline"
                    >
                      ← Choose different post
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="block font-medium text-gray-900 mb-2 text-sm sm:text-base">
                      📅 Schedule Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Posts will be queued for publishing at the scheduled time
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSchedulePost}
                      disabled={!scheduleTime}
                      className="flex-1 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      ✅ Schedule Post
                    </button>
                    <button
                      onClick={() => { 
                        setShowScheduleModal(false)
                        setSelectedPost(null)
                        setScheduleTime('') 
                      }}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
