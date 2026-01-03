import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface UsageAlertProps {
  userName?: string
  postsUsed?: number
  postsLimit?: number
  percentageUsed?: number
  upgradeUrl?: string
}

export default function UsageAlertEmail({
  userName = 'there',
  postsUsed = 4,
  postsLimit = 5,
  percentageUsed = 80,
  upgradeUrl = 'https://alphawingsai.com/pricing',
}: UsageAlertProps) {
  const postsRemaining = postsLimit - postsUsed

  return (
    <Html>
      <Head />
      <Preview>{`⚠️ You've used ${percentageUsed}% of your monthly posts!`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={warningIcon}>⚠️</Text>
            <Heading style={h1}>Usage Alert</Heading>
          </Section>

          <Text style={text}>Hi {userName},</Text>

          <Text style={text}>
            You're running low on posts this month!
          </Text>

          <Section style={statsBox}>
            <Text style={statLabel}>Posts Used:</Text>
            <Text style={statValue}>{postsUsed} / {postsLimit}</Text>
            <Text style={statLabel}>Remaining:</Text>
            <Text style={statValueWarning}>{postsRemaining} posts</Text>
          </Section>

          <Text style={text}>
            You've used <strong>{percentageUsed}%</strong> of your monthly limit. Don't let this slow down your content creation!
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={upgradeUrl}>
              Upgrade Now →
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            <strong>Upgrade Options:</strong><br />
            • <strong>Starter:</strong> $9.99/mo - 50 posts<br />
            • <strong>Pro:</strong> $29.99/mo - 200 posts<br />
            • <strong>Agency:</strong> $99.99/mo - Unlimited posts
          </Text>

          <Text style={footer}>
            Your limit resets on the 1st of next month.
          </Text>

          <Text style={footer}>
            Questions? <Link href="mailto:hello@alphawingsai.com" style={link}>Contact Support</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const header = {
  textAlign: 'center' as const,
  padding: '32px 0',
}

const warningIcon = {
  fontSize: '48px',
  margin: '0',
}

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 24px',
}

const statsBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px',
  textAlign: 'center' as const,
}

const statLabel = {
  color: '#78350f',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const statValue = {
  color: '#78350f',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '8px 0 16px 0',
}

const statValueWarning = {
  color: '#dc2626',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '8px 0 0 0',
}

const buttonContainer = {
  padding: '27px 24px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#f59e0b',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 28px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '0 24px',
  marginTop: '12px',
}
