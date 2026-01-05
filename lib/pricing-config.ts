// Add this below your existing code

export const PRICE_IDS = {
  starter: {
    test: 'price_1SlWynCsaEmlzaAVoO4hiyyR',
    live: 'price_1SlDhaCsaEmlzaAVHU6w35Ht',
  },
  pro: {
    test: 'price_1SlX0UCsaEmlzaAV8g7LOIE9',
    live: 'price_1SlDj0CsaEmlzaAVozGhgYC7',
  },
  agency: {
    test: 'price_1SlX1BCsaEmlzaAVFL5YZIiT',
    live: 'price_1SlDk9CsaEmlzaAVbEO1lJKJ',
  },
} as const

export function getPriceId(plan: 'starter' | 'pro' | 'agency'): string {
  const mode = process.env.NEXT_PUBLIC_STRIPE_MODE === 'live' ? 'live' : 'test'
  return PRICE_IDS[plan][mode]
}
