import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const { content, platform } = await req.json()

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'No content provided' },
        { status: 400 }
      )
    }

    console.log('🔍 Analyzing content...')

    // AI-powered analysis
    const analysisPrompt = `Analyze this ${platform} post and provide detailed insights:

POST:
${content}

Provide analysis in JSON format:
{
  "quality_score": (0-10),
  "engagement_prediction": (0-100),
  "readability_score": (0-100),
  "tone": "detected tone",
  "strengths": ["list of 3-5 strengths"],
  "weaknesses": ["list of 3-5 areas to improve"],
  "suggestions": ["list of 3-5 specific improvements"],
  "hook_strength": (0-10),
  "cta_effectiveness": (0-10),
  "emoji_usage": "appropriate/excessive/insufficient",
  "hashtag_effectiveness": (0-10),
  "target_audience_match": "description",
  "estimated_reach": "prediction with reasoning"
}`

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [{ role: 'user', content: analysisPrompt }]
    })

    const analysisText = message.content[0].type === 'text' ? message.content[0].text : '{}'
    
    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    // Calculate additional metrics
    const metrics = {
      character_count: content.length,
      word_count: content.split(/\s+/).length,
      sentence_count: content.split(/[.!?]+/).filter(s => s.trim()).length,
      emoji_count: (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length,
      hashtag_count: (content.match(/#\w+/g) || []).length,
      mention_count: (content.match(/@\w+/g) || []).length,
      link_count: (content.match(/https?:\/\/\S+/g) || []).length,
      question_count: (content.match(/\?/g) || []).length,
      exclamation_count: (content.match(/!/g) || []).length,
      reading_time_seconds: Math.ceil(content.split(/\s+/).length / 200 * 60)
    }

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        metrics,
        overall_score: (
          (analysis.quality_score * 10) +
          (analysis.engagement_prediction) +
          (analysis.readability_score) +
          (analysis.hook_strength * 10) +
          (analysis.cta_effectiveness * 10)
        ) / 5
      }
    })

  } catch (error: any) {
    console.error('❌ Analysis error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
