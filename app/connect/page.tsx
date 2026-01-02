'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navigation from '@/components/Navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function ConnectPage() {
  const [userId] = useState('438a1d7b-a880-4956-ba3b-e6a69277019b')
  const [connections, setConnections] = useState<any>({
    linkedin: null,
    twitter: null,
    facebook: null,
    instagram: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConnections()
  }, [])

  async function loadConnections() {
    const { data } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', userId)

    if (data) {
      const mapped = data.reduce((acc: any, conn: any) => {
        acc[conn.platform] = conn
        return acc
      }, {})
      setConnections(mapped)
    }
    setLoading(false)
  }

  async function handleConnect(platform: string) {
    // Placeholder for OAuth flow
    alert(`🚀 ${platform} OAuth integration coming soon!\n\nFor now, you can:\n1. Generate posts\n2. Copy them\n3. Post manually\n\nFull auto-posting launches next week!`)
  }

  async function handleDisconnect(platform: string) {
    if (!confirm(`Disconnect ${platform}?`)) return

    await supabase
      .from('social_connections')
      .delete()
      .eq('user_id', userId)
      .eq('platform', platform)

    loadConnections()
  }

  const platforms = [
    {
      name: 'linkedin',
      displayName: 'LinkedIn',
      icon: '💼',
      color: 'from-blue-600 to-blue-700',
      description: 'Connect your LinkedIn profile to auto-post professional content',
      features: ['Auto-post updates', 'Schedule posts', 'Track engagement'],
    },
    {
      name: 'twitter',
      displayName: 'Twitter/X',
      icon: '🐦',
      color: 'from-sky-500 to-blue-600',
      description: 'Connect Twitter to share your thoughts with the world',
      features: ['Auto-tweet', 'Thread posting', 'Schedule tweets'],
    },
    {
      name: 'facebook',
      displayName: 'Facebook',
      icon: '👥',
      color: 'from-blue-700 to-indigo-700',
      description: 'Connect Facebook to reach your audience',
      features: ['Auto-post to timeline', 'Post to pages', 'Schedule posts'],
    },
    {
      name: 'instagram',
      displayName: 'Instagram',
      icon: '📸',
      color: 'from-pink-500 to-purple-600',
      description: 'Connect Instagram for visual content sharing',
      features: ['Auto-post images', 'Story scheduling', 'Caption generation'],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">🔗 Connect Social Media</h2>
          <p className="text-gray-600">Link your accounts for automatic posting and scheduling</p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🚀</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Auto-Posting Made Easy</h3>
              <p className="text-blue-100 mb-3">
                Connect your social media accounts once, then automatically publish your AI-generated posts across all platforms.
              </p>
              <div className="flex gap-3 text-sm">
                <span className="px-3 py-1 bg-white/20 rounded-full">✅ Secure OAuth</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">✅ One-Click Posting</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">✅ Schedule Anywhere</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">🔗</div>
            <div className="text-2xl font-bold text-gray-900">
              {Object.values(connections).filter(c => c).length}
            </div>
            <div className="text-sm text-gray-600">Connected</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">📤</div>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Auto-Posted</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">⏰</div>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Total Reach</div>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {platforms.map(platform => {
            const isConnected = connections[platform.name]

            return (
              <div key={platform.name} className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${platform.color} flex items-center justify-center text-3xl shadow-lg`}>
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{platform.displayName}</h3>
                      {isConnected ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-sm text-green-600 font-medium">Connected</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not connected</span>
                      )}
                    </div>
                  </div>
                  {isConnected && (
                    <button
                      onClick={() => handleDisconnect(platform.name)}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                <p className="text-gray-600 mb-6">{platform.description}</p>

                <div className="space-y-2 mb-6">
                  {platform.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {isConnected ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600 font-semibold">✅ Active</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Connected on {new Date(isConnected.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Configure ${platform.displayName} posting preferences`)}
                      className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      ⚙️ Configure Settings
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.name)}
                    className={`w-full py-3 bg-gradient-to-r ${platform.color} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all`}
                  >
                    🔗 Connect {platform.displayName}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* How It Works */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">🎯 How Auto-Posting Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                1️⃣
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Generate Content</h4>
              <p className="text-sm text-gray-600">Create amazing posts with AI in seconds</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                2️⃣
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Schedule or Post</h4>
              <p className="text-sm text-gray-600">Choose when to publish to your connected accounts</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                3️⃣
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Track Results</h4>
              <p className="text-sm text-gray-600">Monitor engagement and optimize your strategy</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
