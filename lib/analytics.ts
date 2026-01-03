// Analytics utility for tracking user events
export const analytics = {
  // Main tracking method
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      console.log('📊 Analytics:', event, properties)
    }
  },
  
  // Alias for track
  trackEvent: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      console.log('📊 Analytics:', event, properties)
    }
  },
  
  // Page view tracking
  page: (pageName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      console.log('📄 Page View:', pageName, properties)
    }
  },
  
  // User identification
  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      console.log('👤 Identify:', userId, traits)
    }
  },
  
  // Predefined events
  signup: (method: string = 'email') => {
    analytics.track('user_signup', { method })
  },
  
  login: (method: string = 'email') => {
    analytics.track('user_login', { method })
  },
  
  logout: () => {
    analytics.track('user_logout')
  },
  
  generatePost: (platform: string, tone: string, topic?: string) => {
    analytics.track('post_generated', { platform, tone, topic })
  },
  
  copyPost: (platform: string) => {
    analytics.track('post_copied', { platform })
  },
  
  viewDashboard: () => {
    analytics.track('dashboard_viewed')
  },
  
  viewPricing: () => {
    analytics.track('pricing_viewed')
  },
  
  selectPlan: (plan: string, price: number) => {
    analytics.track('plan_selected', { plan, price })
  },
  
  startCheckout: (plan: string, price: number) => {
    analytics.track('checkout_started', { plan, price })
  },
  
  completeCheckout: (plan: string, price: number, transactionId?: string) => {
    analytics.track('checkout_completed', { plan, price, transactionId })
  },
  
  error: (errorType: string, errorMessage: string, location: string) => {
    analytics.track('error_occurred', { errorType, errorMessage, location })
  },
  
  // Usage tracking
  usageLimitReached: (plan: string, limit: number) => {
    analytics.track('usage_limit_reached', { plan, limit })
  },
  
  viewUsageStats: () => {
    analytics.track('usage_stats_viewed')
  },
  
  clickUpgrade: (currentPlan: string, targetPlan: string) => {
    analytics.track('upgrade_button_clicked', { currentPlan, targetPlan })
  },
  
  // CTA tracking
  clickCTA: (ctaName: string, location: string) => {
    analytics.track('cta_clicked', { ctaName, location })
  },
  
  clickPricingPlan: (planName: string, priceAmount: number) => {
    analytics.track('pricing_plan_clicked', { planName, priceAmount })
  },
}
