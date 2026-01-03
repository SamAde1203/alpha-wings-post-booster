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

interface WelcomeEmailProps {
  userName?: string
  dashboardUrl?: string
}

export default function WelcomeEmail({
  userName = 'there',
  dashboardUrl = 'https://alphawingsai.com/dashboard',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Alpha Wings AI Post Booster! 🚀</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Welcome to Alpha Wings! ✈️</Heading>
          </Section>

          <Text style={text}>Hi {userName},</Text>

          <Text style={text}>
            🎉 Welcome to <strong>Alpha Wings AI Post Booster</strong>! We're thrilled to have you on board.
          </Text>

          <Text style={text}>
            You now have access to AI-powered social media content generation across 6 platforms.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Go to Dashboard →
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Happy posting! 🚀<br />
            The Alpha Wings Team
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

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 24px',
}

const buttonContainer = {
  padding: '27px 24px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#2563eb',
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

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '0 24px',
  marginTop: '12px',
}
