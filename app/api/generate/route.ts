import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Function to get Supabase client - only created at runtime
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    const { userId, topic, platform, tone, variationCount = 3 } = await request.json()

    // Validate input
    if (!userId || !topic?.trim() || !platform || !tone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check post limits
    const isSuperAdmin = user.posts_limit > 10000
    if (!isSuperAdmin && user.posts_this_month >= user.posts_limit) {
      return NextResponse.json({
        error: `Monthly post limit reached. You've used ${user.posts_this_month}/${user.posts_limit} posts this month.`
      }, { status: 403 })
    }

    let posts: any[] = []

    // Use OpenAI since it's configured
    if (process.env.OPENAI_API_KEY) {
      console.log('🎯 Using OpenAI GPT-4 for generation')
      posts = await generateWithOpenAI(topic, platform, tone, variationCount)
    } else {
      console.log('⚠️ No API key found, using fallback')
      posts = generateFallbackPosts(topic, platform, tone, variationCount)
    }

    // Ensure we have the right number of posts
    const finalPosts = posts.slice(0, variationCount)

    // Save posts to database
    const savedPosts = []
    for (const post of finalPosts) {
      const characterCount = post.content?.length || 0
      const wordCount = post.content?.split(/\s+/).length || 0

      const { data, error } = await supabase
        .from('generated_posts')
        .insert({
          user_id: userId,
          topic,
          platform,
          content: post.content,
          tone,
          ai_engine: process.env.OPENAI_API_KEY ? 'gpt-4' : 'fallback',
          quality_score: post.quality_score || 8.0,
          character_count: characterCount,
          word_count: wordCount,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (!error && data) savedPosts.push(data)
    }

    // Update user stats
    const { error: updateError } = await supabase
      .from('users')
      .update({
        posts_this_month: user.posts_this_month + 1,
        total_posts_generated: (user.total_posts_generated || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user:', updateError)
    }

    const postsRemaining = isSuperAdmin
      ? user.posts_limit
      : Math.max(0, user.posts_limit - (user.posts_this_month + 1))

    return NextResponse.json({
      success: true,
      posts: savedPosts,
      postsRemaining,
      generatedCount: savedPosts.length
    })

  } catch (error: any) {
    console.error('🔴 API Error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// OpenAI Generation Function
async function generateWithOpenAI(topic: string, platform: string, tone: string, variationCount: number) {
  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

    const prompt = `Create exactly ${variationCount} social media posts for ${platform} about "${topic}" with a ${tone} tone.

Requirements for each post:
1. Unique and engaging content
2. Optimized for ${platform} style and audience
3. Use appropriate hashtags and emojis
4. Match the ${tone} tone style
5. Each post should be 150-400 characters
6. Return ONLY a valid JSON array

Format each post as:
{
  "content": "The full post text here with emojis and hashtags",
  "quality_score": 8.5
}

Return ONLY a JSON array like this:
[
  {"content": "Post 1 text here", "quality_score": 8.5},
  {"content": "Post 2 text here", "quality_score": 8.7}
]`

    console.log(`🎯 Generating ${variationCount} ${tone} posts for ${platform} about: ${topic}`)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    })

    const text = completion.choices[0]?.message?.content || '[]'
    console.log('📝 OpenAI response received')

    // Clean and parse the response
    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    console.log('📊 Response preview:', cleaned.substring(0, 200) + '...')

    try {
      const parsed = JSON.parse(cleaned)

      if (Array.isArray(parsed)) {
        console.log('✅ Successfully parsed OpenAI response')
        return parsed.map((post: any) => ({
          content: post.content || post.text || '',
          quality_score: typeof post.quality_score === 'number' ? post.quality_score : 8.0
        }))
      }
      throw new Error('Response is not an array')

    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', parseError)

      // Try to extract JSON from text
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0])
          if (Array.isArray(extracted)) {
            console.log('✅ Extracted JSON from response')
            return extracted.map((post: any) => ({
              content: post.content || post.text || '',
              quality_score: typeof post.quality_score === 'number' ? post.quality_score : 8.0
            }))
          }
        } catch (e) {
          console.error('❌ Even extraction failed:', e)
        }
      }

      // If all parsing fails, create from text
      console.log('🔄 Creating posts from raw text')
      const lines = text.split('\n').filter(line =>
        line.trim().length > 50 &&
        !line.includes('```') &&
        !line.includes('JSON')
      )

      return lines.slice(0, variationCount).map((line, i) => ({
        content: line.trim(),
        quality_score: 8.0 + (Math.random() * 0.5) // 8.0-8.5
      }))
    }

  } catch (error: any) {
    console.error('❌ OpenAI generation failed:', error.message)
    // Fallback to basic posts
    return generateFallbackPosts(topic, platform, tone, variationCount)
  }
}

// Fallback Generation Function
function generateFallbackPosts(topic: string, platform: string, tone: string, variationCount: number) {
  console.log('🔄 Using fallback generation')

  const posts = []
  const platformEmojis: Record<string, string> = {
    linkedin: '💼',
    twitter: '🐦',
    facebook: '👥',
    instagram: '📸'
  }

  const emoji = platformEmojis[platform] || '🚀'

  for (let i = 0; i < variationCount; i++) {
    const templates = [
      `${emoji} ${tone} insight: ${topic}\n\nImportant perspective for ${platform} professionals.\n\nShare your thoughts below! 👇\n\n#${topic.replace(/\s+/g, '')} #${platform}`,

      `🌟 ${topic.toUpperCase()} on ${platform.toUpperCase()}\n\n${tone === 'professional' ? 'Professional analysis' : tone} on this key topic.\n\nJoin the conversation! 💬\n\n#${platform} #ThoughtLeadership`,

      `💭 ${tone} reflection on ${topic}\n\nHow does this impact our future?\n\nLet's discuss! 🔗\n\n#${topic.split(' ').join('')} #FutureTrends`
    ]

    const content = templates[i % templates.length]
    const qualityScore = 7.5 + (Math.random() * 0.5) // 7.5-8.0

    posts.push({
      content,
      quality_score: parseFloat(qualityScore.toFixed(1))
    })
  }

  console.log(`📝 Generated ${posts.length} fallback posts`)
  return posts
}
