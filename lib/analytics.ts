// Track custom events in Google Analytics
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params)
  }
}

// Predefined events for Alpha Wings AI Post Booster
export const analytics = {
  // ======================
  // AUTHENTICATION EVENTS
  // ======================
  
  signup: (method: string = 'email') => {
    trackEvent('sign_up', { 
      method,
      timestamp: new Date().toISOString()
    })
  },
  
  login: (method: string = 'email') => {
    trackEvent('login', { 
      method,
      timestamp: new Date().toISOString()
    })
  },
  
  logout: () => {
    trackEvent('logout', {
      timestamp: new Date().toISOString()
    })
  },
  
  // ======================
  // POST GENERATION EVENTS
  // ======================
  
  generatePost: (platform: string, tone: string, topic?: string) => {
    trackEvent('generate_post', { 
      platform,
      tone,
      topic: topic || 'not_specified',
      timestamp: new Date().toISOString()
    })
  },
  
  copyPost: (platform: string) => {
    trackEvent('copy_post', { 
      platform,
      timestamp: new Date().toISOString()
    })
  },
  
  regeneratePost: (platform: string) => {
    trackEvent('regenerate_post', { 
      platform,
      timestamp: new Date().toISOString()
    })
  },
  
  // ======================
  // PRICING & SUBSCRIPTION
  // ======================
  
  viewPricing: () => {
    trackEvent('view_pricing', {
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    })
  },
  
  clickPricingPlan: (plan: string, price: number) => {
    trackEvent('click_pricing_plan', {
      plan_name: plan,
      price,
      currency: 'USD',
      timestamp: new Date().toISOString()
    })
  },
  
  startCheckout: (plan: string, price: number) => {
    trackEvent('begin_checkout', { 
      currency: 'USD',
      value: price,
      items: [{ 
        item_id: plan.toLowerCase().replace(' ', '_'),
        item_name: plan,
        price: price,
        quantity: 1
      }],
      timestamp: new Date().toISOString()
    })
  },
  
  completePurchase: (plan: string, price: number, transactionId: string) => {
    trackEvent('purchase', {
      currency: 'USD',
      value: price,
      transaction_id: transactionId,
      items: [{ 
        item_id: plan.toLowerCase().replace(' ', '_'),
        item_name: plan,
        price: price,
        quantity: 1
      }],
      timestamp: new Date().toISOString()
    })
  },
  
  // ======================
  // ENGAGEMENT EVENTS
  // ======================
  
  clickUpgrade: (currentPlan: string, targetPlan?: string) => {
    trackEvent('click_upgrade', { 
      current_plan: currentPlan,
      target_plan: targetPlan || 'not_specified',
      timestamp: new Date().toISOString()
    })
  },
  
  clickCTA: (ctaName: string, location: string) => {
    trackEvent('click_cta', {
      cta_name: ctaName,
      location,
      timestamp: new Date().toISOString()
    })
  },
  
  viewDashboard: () => {
    trackEvent('view_dashboard', {
      timestamp: new Date().toISOString()
    })
  },
  
  // ======================
  // USAGE TRACKING
  // ======================
  
  usageLimitReached: (plan: string, limit: number) => {
    trackEvent('usage_limit_reached', {
      plan,
      limit,
      timestamp: new Date().toISOString()
    })
  },
  
  viewUsageStats: () => {
    trackEvent('view_usage_stats', {
      timestamp: new Date().toISOString()
    })
  },
  
  // ======================
  // ERROR TRACKING
  // ======================
  
  error: (errorType: string, errorMessage: string, location: string) => {
    trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      location,
      timestamp: new Date().toISOString()
    })
  },
}
