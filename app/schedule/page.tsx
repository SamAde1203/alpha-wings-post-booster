'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navigation from '@/components/Navigation'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { format, addDays } from 'date-fns'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function SchedulePage() {
  const [userId] = useState('438a1d7b-a880-4956-ba3b-e6a69277019b')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([])
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [scheduleTime, setScheduleTime] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    
    // Load scheduled posts
    const { data: scheduled } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_time', { ascending: true })

    // Load saved posts
    const { data: posts } = await supabase
      .from('generated_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    setScheduledPosts(scheduled || [])
    setSavedPosts(posts || [])
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

    const { error } = await supabase.from('scheduled_posts').insert({
      user_id: userId,
      post_id: selectedPost.id,
      content: selectedPost.content,
      platform: selectedPost.platform,
      scheduled_time: scheduledDateTime.toISOString(),
      topic: selectedPost.topic,
      tone: selectedPost.tone,
      status: 'pending',
    })

    if (error) {
      alert('Error scheduling post: ' + error.message)
    } else {
      alert('✅ Post scheduled successfully!')
      setShowScheduleModal(false)
      setSelectedPost(null)
      setScheduleTime('')
      loadData()
    }
  }

  async function cancelScheduledPost(id: string) {
    if (!confirm('Cancel this scheduled post?')) return

    await supabase
      .from('scheduled_posts')
      .update({ status: 'cancelled' })
      .eq('id', id)

    loadData()
  }

  async function deleteScheduledPost(id: string) {
    if (!confirm('Delete this scheduled post?')) return

    await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', id)

    loadData()
  }

  const upcomingPosts = scheduledPosts.filter(p => 
    p.status === 'pending' && new Date(p.scheduled_time) > new Date()
  )

  const postsOnSelectedDate = scheduledPosts.filter(p => {
    const postDate = new Date(p.scheduled_time)
    return postDate.toDateString() === selectedDate.toDateString()
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">📅 Post Scheduler</h2>
          <p className="text-gray-600">Schedule your posts for automatic publishing</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">⏰</div>
            <div className="text-2xl font-bold text-gray-900">{upcomingPosts.length}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-gray-900">
              {scheduledPosts.filter(p => p.status === 'published').length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-gray-900">{savedPosts.length}</div>
            <div className="text-sm text-gray-600">Ready to Schedule</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">📆</div>
            <div className="text-2xl font-bold text-gray-900">{postsOnSelectedDate.length}</div>
            <div className="text-sm text-gray-600">On Selected Date</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📅 Calendar View</h3>
            <div className="calendar-container">
              <Calendar
                onChange={(value) => setSelectedDate(value as Date)}
                value={selectedDate}
                tileClassName={({ date }) => {
                  const hasPost = scheduledPosts.some(p => 
                    new Date(p.scheduled_time).toDateString() === date.toDateString() &&
                    p.status === 'pending'
                  )
                  return hasPost ? 'has-scheduled-post' : ''
                }}
                minDate={new Date()}
              />
            </div>

            {postsOnSelectedDate.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold text-gray-900 mb-3">
                  Posts on {format(selectedDate, 'MMM dd, yyyy')}
                </h4>
                <div className="space-y-2">
                  {postsOnSelectedDate.map(post => (
                    <div key={post.id} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 capitalize">
                            {post.platform} - {format(new Date(post.scheduled_time), 'h:mm a')}
                          </div>
                          <div className="text-xs text-gray-600 truncate max-w-xs">
                            {post.content.substring(0, 60)}...
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          post.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          post.status === 'published' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Posts */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">⏰ Upcoming Posts</h3>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                + Schedule New
              </button>
            </div>

            {upcomingPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-600 mb-4">No upcoming scheduled posts</p>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
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
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize mb-2">
                          {post.platform}
                        </span>
                        <div className="font-bold text-gray-900">
                          {format(new Date(post.scheduled_time), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(post.scheduled_time), 'h:mm a')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => cancelScheduledPost(post.id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteScheduledPost(post.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Schedule a Post</h3>
                <button
                  onClick={() => { setShowScheduleModal(false); setSelectedPost(null); setScheduleTime('') }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {!selectedPost ? (
                <>
                  <h4 className="font-bold text-gray-900 mb-4">Select a post to schedule:</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {savedPosts.map(post => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 cursor-pointer transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                            {post.platform}
                          </span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">{post.topic}</div>
                            <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-3">Selected Post:</h4>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <span className="inline-block px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-medium capitalize mb-2">
                        {selectedPost.platform}
                      </span>
                      <div className="font-medium text-gray-900 mb-2">{selectedPost.topic}</div>
                      <p className="text-sm text-gray-700">{selectedPost.content}</p>
                    </div>
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="mt-3 text-blue-600 text-sm hover:underline"
                    >
                      ← Choose different post
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="block font-medium text-gray-900 mb-2">
                      📅 Schedule Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Posts will be automatically published at the scheduled time
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSchedulePost}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      ✅ Schedule Post
                    </button>
                    <button
                      onClick={() => { setShowScheduleModal(false); setSelectedPost(null); setScheduleTime('') }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
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

      <style jsx global>{`
        .calendar-container {
          font-family: inherit;
        }
        .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        .react-calendar__tile--active {
          background: linear-gradient(to right, #2563eb, #7c3aed) !important;
          color: white;
        }
        .has-scheduled-post {
          background: #dbeafe !important;
          border-radius: 8px;
        }
        .react-calendar__tile:hover {
          background: #f3f4f6;
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}
