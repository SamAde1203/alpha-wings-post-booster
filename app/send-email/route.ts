import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import WelcomeEmail from '@/emails/welcome'
import UsageAlertEmail from '@/emails/usage-alert'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { type, to, data } = await request.json()

    let email
    let subject = ''

    // Select email template based on type
    switch (type) {
      case 'welcome':
        email = WelcomeEmail({
          userName: data.userName,
          dashboardUrl: data.dashboardUrl || 'https://alphawingsai.com/dashboard'
        })
        subject = '🎉 Welcome to Alpha Wings AI Post Booster!'
        break

      case 'usage-alert':
        email = UsageAlertEmail({
          userName: data.userName,
          postsUsed: data.postsUsed,
          postsLimit: data.postsLimit,
          percentageUsed: data.percentageUsed,
          upgradeUrl: data.upgradeUrl || 'https://alphawingsai.com/pricing'
        })
        subject = `⚠️ You've used ${data.percentageUsed}% of your monthly posts`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    // Send email
    const result = await resend.emails.send({
      from: 'Alpha Wings AI <hello@alphawingsai.com>',
      to: [to],
      subject: subject,
      react: email,
    })

    return NextResponse.json({
      success: true,
      id: result.data?.id
    })

  } catch (error: any) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
