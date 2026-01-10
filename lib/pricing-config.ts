// lib/pricing-config.ts

export type PlanTier = 'starter' | 'pro' | 'agency' | 'free'
export type PaidPlan = Exclude<PlanTier, 'free'>

// LIVE price IDs ONLY
export const PLAN_TO_PRICE_ID: Record<PaidPlan, string> = {
  starter: 'price_1SlDhaCsaEmlzaAVHU6w35Ht',
  pro: 'price_1SlDj0CsaEmlzaAVozGhgYC7',
  agency: 'price_1SlDk9CsaEmlzaAVbEO1lJKJ',
} as const

export function getPriceId(plan: PaidPlan): string {
  return PLAN_TO_PRICE_ID[plan]
}

// Used by Stripe webhooks to map subscription → plan
export const PRICE_TO_PLAN_MAP: Record<string, PaidPlan> = {
  'price_1SlDhaCsaEmlzaAVHU6w35Ht': 'starter',
  'price_1SlDj0CsaEmlzaAVozGhgYC7': 'pro',
  'price_1SlDk9CsaEmlzaAVbEO1lJKJ': 'agency',
}

export function getPlanFromPriceId(priceId?: string | null): PlanTier {
  if (!priceId) return 'free'
  return PRICE_TO_PLAN_MAP[priceId] ?? 'free'
}
