import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(req: Request) {
  try {
    const { action, ...data } = await req.json()

    switch (action) {
      case 'train':
        return await trainBrandVoice(data)
      case 'analyze':
        return await analyzeBrandVoice(data)
      case 'get':
        return await getBrandVoice(data)
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('❌ Brand voice error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

async function trainBrandVoice(data: any) {
  const { userId, samplePosts } = data

  if (!userId || !samplePosts || samplePosts.length < 3) {
    return NextResponse.json(
      { success: false, error: 'Provide at least 3 sample posts for training' },
      { status: 400 }
      )
  }

  console.log('🎓 Training brand voice...')

  const trainingPrompt = `Analyze these sample posts and extract the brand voice characteristics:

${samplePosts.map((post: string, i: number) => `SAMPLE ${i + 1}:\n${post}\n`).join('\n')}

Provide detailed brand voice profile in JSON:
{
  "tone": "overall tone (professional/casual/inspirational/etc)",
  "personality_traits": ["list of 5-7 traits"],
  "writing_style": "description of style",
  "vocabulary_level": "simple/moderate/advanced",
  "sentence_structure": "short/varied/long",
  "emoji_usage": "none/minimal/moderate/frequent",
  "humor_style": "none/subtle/direct/witty",
  "storytelling_approach": "description",
  "call_to_action_style": "description",
  "unique_phrases": ["commonly used phrases"],
  "topics_of_interest": ["list of topics"],
  "target_audience": "description",
  "key_values": ["list of values"],
  "dos": ["what to do"],
  "donts": ["what to avoid"],
  "example_openings": ["3-5 example opening lines"],
  "example_closings": ["3-5 example closing lines"]
}`

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 3000,
    messages: [{ role: 'user', content: trainingPrompt }]
  })

  const analysisText = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
  const brandVoice = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

  // Save brand voice profile
  const { data: profile, error } = await supabase
    .from('brand_voices')
    .upsert({
      user_id: userId,
      profile: brandVoice,
      sample_posts: samplePosts,
      trained_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save brand voice' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    brandVoice: profile,
    message: 'Brand voice trained successfully! Future posts will match your style.'
  })
}

async function analyzeBrandVoice(data: any) {
  const { content } = data

  if (!content) {
    return NextResponse.json(
      { success: false, error: 'No content provided' },
      { status: 400 }
    )
  }

  const analysisPrompt = `Analyze this post and identify its brand voice characteristics:

${content}

Provide brief analysis in JSON:
{
  "tone": "detected tone",
  "personality": ["3-5 personality traits"],
  "strengths": ["what works well"],
  "consistency_score": (0-10)
}`

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1000,
    messages: [{ role: 'user', content: analysisPrompt }]
  })

  const analysisText = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
  const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

  return NextResponse.json({
    success: true,
    analysis
  })
}

async function getBrandVoice(data: any) {
  const { userId } = data

  const { data: profile, error } = await supabase
    .from('brand_voices')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !profile) {
    return NextResponse.json({
      success: true,
      brandVoice: null,
      message: 'No brand voice trained yet. Add sample posts to train.'
    })
  }

  return NextResponse.json({
    success: true,
    brandVoice: profile
  })
}
