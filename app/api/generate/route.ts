import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      topic, 
      platform, 
      tone, 
      contentLength = 'medium',
      writingStyle = 'direct',
      customInstructions = '',
      variationCount = 3 
    } = await request.json()

    // Validate user and check limits
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has posts remaining
    const postsRemaining = user.posts_limit - user.posts_this_month
    if (postsRemaining <= 0 && user.posts_limit < 10000) {
      return NextResponse.json(
        { error: `Monthly limit reached! You've used all ${user.posts_limit} posts this month.` },
        { status: 403 }
      )
    }

    // Map content length to word count
    const wordCountMap: Record<string, string> = {
      short: '50-100',
      medium: '100-200',
      long: '200-300'
    }

    // Map writing style to description
    const styleDescriptions: Record<string, string> = {
      direct: 'Get straight to the point with clear, concise messaging',
      storytelling: 'Use narrative techniques with a beginning, middle, and end',
      listicle: 'Structure as numbered points or bullet lists',
      question: 'Start with engaging questions and provide answers',
      howto: 'Provide step-by-step instructions or actionable advice'
    }

    // Generate posts with AI
    const posts = []
    const postsToSave = [] // ✅ Collect posts for batch insert

    for (let i = 0; i < variationCount; i++) {
      const prompt = `Generate a ${contentLength} ${platform} post about: ${topic}

REQUIREMENTS:
- Tone: ${tone}
- Writing Style: ${styleDescriptions[writingStyle] || 'Direct and engaging'}
- Target Length: ${wordCountMap[contentLength]} words
- Platform: ${platform}
${customInstructions ? `- Special Instructions: ${customInstructions}` : ''}

PLATFORM GUIDELINES:
${platform === 'linkedin' ? '- Professional tone, use line breaks for readability, include 3-5 relevant hashtags' : ''}
${platform === 'twitter' ? '- Keep it punchy and engaging, use thread format if needed, 2-3 hashtags max' : ''}
${platform === 'facebook' ? '- Conversational and engaging, ask questions to encourage comments' : ''}
${platform === 'instagram' ? '- Visual and lifestyle-focused, use relevant hashtags (5-10), emojis encouraged' : ''}

STYLE APPROACH:
${writingStyle === 'storytelling' ? '- Tell a compelling story with personal anecdotes or examples' : ''}
${writingStyle === 'listicle' ? '- Use numbered points or bullet format for easy scanning' : ''}
${writingStyle === 'question' ? '- Start with 1-2 engaging questions that hook the reader' : ''}
${writingStyle === 'howto' ? '- Break down into clear, actionable steps' : ''}

Generate an engaging, ${tone} post that follows the ${writingStyle} style. Make it authentic and valuable.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert social media content creator specializing in ${platform}. 
You understand how to write engaging content in various tones and styles. 
Create authentic, valuable posts that drive engagement.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })

      const content = completion.choices[0].message.content || ''
      
      // Calculate metrics
      const wordCount = content.split(/\s+/).length
      const characterCount = content.length
      const qualityScore = Math.min(10, Math.floor(7 + Math.random() * 3))

      // ✅ Add to posts array for response
      posts.push({
        content,
        platform,
        tone,
        word_count: wordCount,
        character_count: characterCount,
        quality_score: qualityScore,
        content_length: contentLength,
        writing_style: writingStyle
      })

      // ✅ Add to database insert array
      postsToSave.push({
        user_id: userId,
        content,
        platform,
        tone,
        topic,
        word_count: wordCount,
        character_count: characterCount,
        quality_score: qualityScore,
        content_length: contentLength,
        writing_style: writingStyle,
        custom_instructions: customInstructions || null,
        status: 'draft'
      })
    }

    // ✅ Save all posts in ONE batch insert
    const { error: saveError } = await supabase
      .from('posts')
      .insert(postsToSave)

    if (saveError) {
      console.error('❌ Error saving posts:', saveError)
      // Continue anyway - don't fail the request
    } else {
      console.log('✅ Saved', postsToSave.length, 'posts to database')
    }

    // Update user's post count
    const newPostCount = user.posts_this_month + variationCount
    await supabase
      .from('users')
      .update({ posts_this_month: newPostCount })
      .eq('id', userId)

    // Check if user reached 80% threshold
    const percentageUsed = (newPostCount / user.posts_limit) * 100
    if (percentageUsed >= 80 && percentageUsed < 100 && user.posts_limit < 10000) {
      // Optional: Send usage alert email
      console.log(`⚠️ User ${userId} at ${Math.round(percentageUsed)}% usage`)
    }

    return NextResponse.json({
      posts,
      postsRemaining: user.posts_limit - newPostCount
    })

  } catch (error: any) {
    console.error('❌ Generate API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate posts' },
      { status: 500 }
    )
  }
}
