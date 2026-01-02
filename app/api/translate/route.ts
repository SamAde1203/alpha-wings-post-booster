import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const SUPPORTED_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Dutch', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic',
  'Hindi', 'Bengali', 'Turkish', 'Polish', 'Ukrainian', 'Vietnamese',
  'Thai', 'Swedish', 'Danish', 'Norwegian', 'Finnish', 'Greek',
  'Hebrew', 'Indonesian', 'Malay', 'Filipino', 'Czech', 'Romanian',
  'Hungarian', 'Bulgarian', 'Serbian', 'Croatian', 'Slovak', 'Slovenian'
]

export async function POST(req: Request) {
  try {
    const { content, targetLanguage, preserveTone = true } = await req.json()

    if (!content || !targetLanguage) {
      return NextResponse.json(
        { success: false, error: 'Content and target language required' },
        { status: 400 }
      )
    }

    if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
      return NextResponse.json(
        { success: false, error: `Language not supported. Supported: ${SUPPORTED_LANGUAGES.join(', ')}` },
        { status: 400 }
      )
    }

    console.log(`🌍 Translating to ${targetLanguage}...`)

    const translationPrompt = `Translate this social media post to ${targetLanguage}.

${preserveTone ? 'IMPORTANT: Preserve the tone, style, emojis, and formatting. Adapt hashtags and cultural references appropriately for the target language audience.' : 'Translate literally while maintaining readability.'}

Original post:
${content}

Provide ONLY the translated content, nothing else.`

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [{ role: 'user', content: translationPrompt }]
    })

    const translatedContent = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({
      success: true,
      original: content,
      translated: translatedContent,
      targetLanguage,
      characterCount: translatedContent.length
    })

  } catch (error: any) {
    console.error('❌ Translation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    supported_languages: SUPPORTED_LANGUAGES
  })
}
