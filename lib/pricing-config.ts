// lib/pricing-config.ts

export type PlanTier = 'starter' | 'pro' | 'agency' | 'free'
export type PaidPlan = Exclude<PlanTier, 'free'>

type StripeMode = 'test' | 'live'
const STRIPE_MODE: StripeMode =
  process.env.NEXT_PUBLIC_STRIPE_MODE === 'live' ? 'live' : 'test'

// 1) Plan -> PriceId (used by pricing page / checkout initiation)
export const PLAN_TO_PRICE_ID: Record<PaidPlan, Record<StripeMode, string>> = {
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

export function getPriceId(plan: PaidPlan): string {
  return PLAN_TO_PRICE_ID[plan][STRIPE_MODE]
}

// 2) PriceId -> Plan (used by webhook to set tier)
export const PRICE_TO_PLAN_MAP: Record<string, PaidPlan> = {
  // TEST
  'price_1SlWynCsaEmlzaAVoO4hiyyR': 'starter',
  'price_1SlX0UCsaEmlzaAV8g7LOIE9': 'pro',
  'price_1SlX1BCsaEmlzaAVFL5YZIiT': 'agency',

  // LIVE
  'price_1SlDhaCsaEmlzaAVHU6w35Ht': 'starter',
  'price_1SlDj0CsaEmlzaAVozGhgYC7': 'pro',
  'price_1SlDk9CsaEmlzaAVbEO1lJKJ': 'agency',
}

export function getPlanFromPriceId(priceId?: string | null): PlanTier {
  if (!priceId) return 'free'
  return PRICE_TO_PLAN_MAP[priceId] ?? 'free'
}
