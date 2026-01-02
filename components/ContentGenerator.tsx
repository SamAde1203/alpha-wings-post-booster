'use client'

import { useState } from 'react'
import { Sparkles, Wand2, RotateCw, Copy, Download, Share2, Calendar, BarChart3 } from 'lucide-react'

interface ContentGeneratorProps {
  userId: string
}

export default function ContentGenerator({ userId }: ContentGeneratorProps) {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('LinkedIn')
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [language, setLanguage] = useState('English')
  const [includeEmojis, setIncludeEmojis] = useState(true)
  const [includeHashtags, setIncludeHashtags] = useState(true)
  
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [variations, setVariations] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState('')
  const [postId, setPostId] = useState<string | null>(null)

  const platforms = [
    'LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'TikTok', 'YouTube',
    'Reddit', 'Pinterest', 'Threads', 'Medium', 'Quora', 'Discord'
  ]

  const tones = [
    { value: 'professional', label: '👔 Professional', description: 'Formal and authoritative' },
    { value: 'casual', label: '😊 Casual', description: 'Friendly and conversational' },
    { value: 'inspirational', label: '✨ Inspirational', description: 'Motivating and uplifting' },
    { value: 'humorous', label: '😂 Humorous', description: 'Witty and entertaining' },
    { value: 'educational', label: '📚 Educational', description: 'Informative and teaching' },
    { value: 'storytelling', label: '📖 Storytelling', description: 'Narrative and engaging' }
  ]

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian',
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'
  ]

  async function handleGenerate() {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setGenerating(true)
    setError('')
    setGeneratedContent('')
    setVariations([])
    setAnalysis(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          platform,
          userId,
          tone,
          length,
          language,
          includeEmojis,
          includeHashtags,
          aiEngine: 'auto'
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedContent(data.content)
        setPostId(data.postId)
        setAnalysis(data.analysis)
      } else {
        setError(data.error || 'Failed to generate content')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate content')
    } finally {
      setGenerating(false)
    }
  }

  async function handleRegenerate() {
    if (!generatedContent || !postId) return

    setGenerating(true)
    try {
      const response = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent: generatedContent,
          postId,
          userId,
          variationCount: 3
        }),
      })

      const data = await response.json()

      if (data.success) {
        setVariations(data.variations)
      }
    } catch (err) {
      console.error('Regeneration failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  async function handleAnalyze() {
    if (!generatedContent) return

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generatedContent,
          platform
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAnalysis(data.analysis)
      }
    } catch (err) {
      console.error('Analysis failed:', err)
    }
  }

  function copyToClipboard(content: string) {
    navigator.clipboard.writeText(content)
    // TODO: Show toast notification
    alert('Copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Wand2 className="w-8 h-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900">AI Content Generator</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Topic */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What do you want to post about? *
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="E.g., The future of AI in healthcare, tips for remote work productivity..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all resize-none"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Tone */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tone & Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    tone === t.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{t.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length
            </label>
            <div className="flex gap-2">
              {(['short', 'medium', 'long'] as const).map((len) => (
                <button
                  key={len}
                  onClick={() => setLength(len)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium capitalize transition-all ${
                    length === len
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEmojis}
                  onChange={(e) => setIncludeEmojis(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <span className="text-gray-700">Emojis 😊</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <span className="text-gray-700">Hashtags #</span>
              </label>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating Magic...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5" />
              Generate Post
            </span>
          )}
        </button>
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-gray-900">Your Generated Post</h3>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(generatedContent)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={handleRegenerate}
                disabled={generating}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Regenerate
              </button>
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analyze
              </button>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed text-lg">
              {generatedContent}
            </p>
          </div>

          {/* Analysis */}
          {analysis && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-sm text-green-600 font-medium">Quality Score</div>
                <div className="text-3xl font-bold text-green-700 mt-1">
                  {analysis.qualityScore?.toFixed(1) || 'N/A'}/10
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">Engagement</div>
                <div className="text-3xl font-bold text-blue-700 mt-1">
                  {analysis.engagementPrediction?.toFixed(0) || 'N/A'}%
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">AI Engine</div>
                <div className="text-2xl font-bold text-purple-700 mt-1 capitalize">
                  {analysis.aiEngine || 'Claude'}
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="text-sm text-orange-600 font-medium">Readability</div>
                <div className="text-3xl font-bold text-orange-700 mt-1">
                  {analysis.readabilityScore?.toFixed(0) || 'N/A'}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Variations */}
      {variations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Alternative Versions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variations.map((variation) => (
              <div
                key={variation.id}
                className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all cursor-pointer"
                onClick={() => {
                  setGeneratedContent(variation.content)
                  setVariations([])
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-purple-600 capitalize">
                    {variation.tone}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {variation.quality_score?.toFixed(1)}/10
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-6">
                  {variation.content}
                </p>
                <button className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Use this version →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
