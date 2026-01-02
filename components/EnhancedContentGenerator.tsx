'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface EnhancedContentGeneratorProps {
  userId: string
  userPlan: string
  postsRemaining: number
}

export default function EnhancedContentGenerator({
  userId,
  userPlan,
  postsRemaining
}: EnhancedContentGeneratorProps) {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('linkedin')
  const [tone, setTone] = useState('professional')
  const [targetAudience, setTargetAudience] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<any[]>([])
  const [selectedVariation, setSelectedVariation] = useState(0)
  const [error, setError] = useState('')

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'from-blue-500 to-blue-600' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'from-sky-400 to-sky-600' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'from-blue-600 to-indigo-600' },
    { id: 'instagram', name: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-600' }
  ]

  const tones = [
    { id: 'professional', name: 'Professional', emoji: '💼' },
    { id: 'casual', name: 'Casual', emoji: '😊' },
    { id: 'enthusiastic', name: 'Enthusiastic', emoji: '🚀' },
    { id: 'educational', name: 'Educational', emoji: '📚' },
    { id: 'inspirational', name: 'Inspirational', emoji: '✨' }
  ]

  async function handleGenerate() {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    if (postsRemaining <= 0) {
      setError('You have reached your post limit. Please upgrade your plan.')
      return
    }

    setLoading(true)
    setError('')
    setGeneratedPosts([])

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          topic,
          platform,
          tone,
          targetAudience,
          variationCount: 3
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate content')
      }

      const data = await response.json()
      setGeneratedPosts(data.posts || [])
      setSelectedVariation(0)
    } catch (err: any) {
      setError(err.message || 'Failed to generate content')
      console.error('Generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(content: string) {
    navigator.clipboard.writeText(content)
    alert('Copied to clipboard!')
  }

  return (
    <div className="space-y-8">
      {/* Stats Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Plan: {userPlan.toUpperCase()}</h2>
            <p className="text-blue-100">Generate engaging content for all your social platforms</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{postsRemaining}</div>
            <div className="text-blue-100">Posts Remaining</div>
          </div>
        </div>
      </div>

      {/* Generation Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Generate New Post</h3>

        {/* Topic Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's your topic? 💡
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., AI trends in 2026, Marketing strategies, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Platform Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Platform 📱
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  platform === p.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-3xl mb-2">{p.icon}</div>
                <div className="text-sm font-medium text-gray-900">{p.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tone Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Tone 🎭
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  tone === t.id
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">{t.emoji}</div>
                <div className="text-xs font-medium text-gray-900">{t.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience (Optional) 🎯
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., Tech entrepreneurs, Small business owners, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || postsRemaining <= 0}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Magic...
            </span>
          ) : (
            '✨ Generate Post'
          )}
        </button>
      </div>

      {/* Generated Posts */}
      {generatedPosts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Generated Posts 🎉</h3>

          {/* Variation Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {generatedPosts.map((post, index) => (
              <button
                key={index}
                onClick={() => setSelectedVariation(index)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedVariation === index
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Variation {index + 1}
              </button>
            ))}
          </div>

          {/* Selected Post */}
          {generatedPosts[selectedVariation] && (
            <div className="space-y-4">
              <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {generatedPosts[selectedVariation].content}
                </pre>
              </div>

              {/* Post Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {generatedPosts[selectedVariation].character_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Characters</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {generatedPosts[selectedVariation].quality_score || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Quality Score</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {generatedPosts[selectedVariation].emoji_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Emojis</div>
                </div>
                <div className="p-4 bg-pink-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    {generatedPosts[selectedVariation].hashtag_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Hashtags</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(generatedPosts[selectedVariation].content)}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  📋 Copy to Clipboard
                </button>
                <button
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  📅 Schedule Post
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
