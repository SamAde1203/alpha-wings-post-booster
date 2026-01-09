import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(request: Request) {
  try {
    const { content, platform } = await request.json()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Generate 8-10 relevant, trending hashtags for ${platform} posts. 
          Mix of popular (high reach) and niche (targeted) hashtags.
          Format: Return ONLY hashtags separated by spaces, each starting with #.
          No explanations, no numbering.`
        },
        {
          role: 'user',
          content: `Post content: ${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    })

    const hashtagText = completion.choices[0].message.content?.trim() || ''
    const hashtags = hashtagText.split(' ').filter(tag => tag.startsWith('#'))

    return NextResponse.json({ 
      hashtags,
      count: hashtags.length
    })
  } catch (error: any) {
    console.error('Hashtag generation error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
