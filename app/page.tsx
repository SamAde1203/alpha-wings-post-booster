// app/page.tsx 
'use client'

import Link from 'next/link'
import Image from "next/image"
import { Check, X, Zap, DollarSign, Clock, Sparkles, Target, TrendingUp, Users, Play, ChevronRight, Star, Shield } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import { useEffect } from 'react'
import { Play, ChevronRight, Star, Shield } from 'lucide-react'

export default function HomePage() {
  // Track landing page view
  useEffect(() => {
    analytics.trackEvent('view_landing_page', {
      page: 'home',
      timestamp: new Date().toISOString()
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image
              src="/alpha-wings-ai-logo.png"
              alt="Alpha Wings AI"
              width={40}
              height={40}
              priority
            />
            <span className="text-xl md:text-2xl font-bold text-gray-900">
              Alpha Wings Post Booster
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              href="/login"
              onClick={() => analytics.clickCTA('header_login', 'header')}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Login
            </Link>
            <Link 
              href="/login"
              onClick={() => analytics.clickCTA('header_get_started', 'header')}
              className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
<section className="pt-28 pb-16 px-4 relative overflow-hidden">
  {/* Background effect */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-50"></div>
  
  <div className="container mx-auto max-w-6xl text-center relative z-10">
    {/* Trust badges */}
    <div className="mb-6 flex flex-wrap justify-center items-center gap-3">
      <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
        🚀 #1 AI Content Generator
      </span>
      <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
        ⚡ 10x Faster Than Manual Writing
      </span>
      <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
        💰 Save 90% vs Competitors
      </span>
    </div>
    
    {/* Main headline - More benefit-focused */}
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        AI Writes Your Social Media Posts
      </span>
      <br />
      <span className="text-3xl md:text-5xl lg:text-6xl">
        So You Don't Have To
      </span>
    </h1>
    
    {/* Subheadline with clear benefits */}
    <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
      Generate <strong className="text-blue-600">high-performing content</strong> for LinkedIn, Twitter, Facebook & Instagram in seconds. 
      <span className="block mt-2 text-lg md:text-xl">
        Save <span className="text-green-600 font-bold">$2,000+ per year</span> compared to Buffer, Hootsuite & Later.
      </span>
    </p>
    
    {/* Primary CTAs with clearer hierarchy */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
      <Link 
        href="/login"
        onClick={() => analytics.clickCTA('hero_get_started_free', 'hero_section')}
        className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 font-bold text-lg inline-flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
      >
        <Zap className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
        Start Creating Free
        <span className="ml-2 text-blue-200">(5 posts/month)</span>
      </Link>
      
      <Link 
        href="/pricing"
        onClick={() => analytics.clickCTA('hero_compare_plans', 'hero_section')}
        className="bg-white text-gray-800 px-8 py-4 rounded-xl hover:bg-gray-50 font-bold text-lg inline-flex items-center justify-center border-2 border-gray-300 hover:border-blue-500 transition-all shadow-md"
      >
        <DollarSign className="mr-2" />
        Compare All Plans
      </Link>
    </div>
    
    {/* Demo video preview */}
    <div className="mb-10">
      <Link 
        href="#demo-video"
        onClick={() => analytics.clickCTA('hero_watch_demo', 'hero_section')}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg group"
      >
        <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
        Watch 60-Second Demo
        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
    
    {/* Trust indicators - Social proof */}
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 max-w-2xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* User count */}
        <div className="text-center md:text-left">
          <div className="text-2xl md:text-3xl font-bold text-gray-900">500+</div>
          <div className="text-sm text-gray-600">Creators & Businesses</div>
        </div>
        
        {/* Rating */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
            ))}
            <span className="ml-2 text-lg font-bold text-gray-900">4.8/5</span>
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        
        {/* Time saved */}
        <div className="text-center md:text-left">
          <div className="text-2xl md:text-3xl font-bold text-gray-900">10h+</div>
          <div className="text-sm text-gray-600">Saved Per Week</div>
        </div>
      </div>
    </div>
    
    {/* Quick benefits - Scannable */}
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { icon: Zap, text: '10-Second Content Generation' },
        { icon: Target, text: 'Platform-Optimized Posts' },
        { icon: Clock, text: 'Smart Auto-Scheduling' },
        { icon: Shield, text: 'No Credit Card Required' },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-center space-x-2 text-gray-700">
          <item.icon className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium">{item.text}</span>
        </div>
      ))}
    </div>
  </div>
</section>
      {/* Social Proof */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 mb-6">Trusted by solopreneurs, coaches, and content creators</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <Users className="h-12 w-12 text-gray-700" />
            <TrendingUp className="h-12 w-12 text-gray-700" />
            <Target className="h-12 w-12 text-gray-700" />
            <Sparkles className="h-12 w-12 text-gray-700" />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            You're Being Ripped Off by Social Media Subscription Tools
          </h2>
          <p className="text-center text-gray-700 mb-12 text-lg">
            Here's the truth nobody talks about:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { tool: 'Buffer', price: '$864/year', issue: 'YOU still write all your posts manually' },
              { tool: 'Hootsuite', price: '$2,988/year', issue: "For features you'll never use" },
              { tool: 'Hypefury', price: '$1,188/year', issue: 'Only works on Twitter (seriously?)' },
              { tool: 'Later', price: '$960/year', issue: 'Their AI features? Non-existent' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 hover:shadow-lg transition-shadow">
                <div className="flex items-start">
                  <X className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-gray-900">{item.tool} charges {item.price}</h3>
                    <p className="text-gray-700">{item.issue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <p className="text-lg text-gray-800">
              Meanwhile, you're spending <strong>10+ hours per week</strong> creating content for multiple platforms, 
              watching your engagement tank because <strong>inconsistency kills growth</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The AI-Powered Social Media Tool That Actually Creates Your Content.
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Post Booster doesn't just schedule your posts.<br />
              It <strong>WRITES</strong> them. <strong>OPTIMIZES</strong> them. <strong>ADAPTS</strong> them for each platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Sparkles,
                title: 'AI Content Generation',
                desc: 'Never stare at a blank screen again. AI writes engaging, platform-optimized posts in seconds.',
                color: 'blue'
              },
              {
                icon: Zap,
                title: 'Multi-Platform Support',
                desc: 'One idea becomes 4 platform-specific posts for LinkedIn, Twitter, Facebook & Instagram.',
                color: 'purple'
              },
              {
                icon: Clock,
                title: 'Smart Scheduling',
                desc: 'Schedule posts for optimal engagement times across all your connected accounts.',
                color: 'green'
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center border-t-4 border-blue-600">
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-700">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/pricing"
              onClick={() => analytics.clickCTA('solution_start_creating', 'solution_section')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-bold text-lg inline-flex items-center shadow-lg hover:shadow-xl transition-all"
            >
              Start Creating Better Content Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Everything You Get with Post Booster
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              '🤖 AI Content Generation',
              '💼 LinkedIn Optimization',
              '🐦 Twitter/X Integration',
              '📘 Facebook Support',
              '📸 Instagram Ready',
              '#️⃣ Smart Hashtag Optimization',
              '📅 Intelligent Scheduling',
              '💡 Content Ideas Generator',
              '⚡ Bulk Post Creation',
              '🔄 Content Variations',
              '📱 Mobile-Friendly Dashboard',
              '💰 Flexible Pricing'
            ].map((feature, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-md flex items-start hover:shadow-lg transition-shadow border border-gray-200">
                <Check className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="font-medium text-gray-900">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            The Real Cost of Subscription Tools.
          </h2>
          <p className="text-center text-gray-700 mb-12 text-lg">
            Let's do the math:
          </p>
          
          <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-900">Tool</th>
                    <th className="px-6 py-4 text-right font-bold text-gray-900">Year 1</th>
                    <th className="px-6 py-4 text-right font-bold text-gray-900">5 Years</th>
                    <th className="px-6 py-4 text-right font-bold text-gray-900">Savings vs Post Booster</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">Sprout Social</td>
                    <td className="px-6 py-4 text-right text-gray-900">$5,988</td>
                    <td className="px-6 py-4 text-right text-red-700 font-bold">$29,940</td>
                    <td className="px-6 py-4 text-right text-green-700 font-bold">$29,843</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">Hootsuite</td>
                    <td className="px-6 py-4 text-right text-gray-900">$2,988</td>
                    <td className="px-6 py-4 text-right text-red-700 font-bold">$14,940</td>
                    <td className="px-6 py-4 text-right text-green-700 font-bold">$14,843</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">Hypefury</td>
                    <td className="px-6 py-4 text-right text-gray-900">$1,188</td>
                    <td className="px-6 py-4 text-right text-red-700 font-bold">$5,940</td>
                    <td className="px-6 py-4 text-right text-green-700 font-bold">$5,843</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">Buffer</td>
                    <td className="px-6 py-4 text-right text-gray-900">$864</td>
                    <td className="px-6 py-4 text-right text-red-700 font-bold">$4,320</td>
                    <td className="px-6 py-4 text-right text-green-700 font-bold">$4,223</td>
                  </tr>
                  <tr className="bg-green-50 border-t-2 border-green-600">
                    <td className="px-6 py-4 font-bold text-green-800">Post Booster</td>
                    <td className="px-6 py-4 text-right font-bold text-green-800">$9.99-$99.99/mo</td>
                    <td className="px-6 py-4 text-right font-bold text-green-800 text-xl">From $9.99 ✓</td>
                    <td className="px-6 py-4 text-right font-bold text-green-800">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xl text-gray-700 mb-6">
              You could buy Post Booster <strong className="text-blue-600">154 times</strong> and still spend less than 5 years of Hootsuite.
            </p>
            <p className="text-lg text-gray-600">
              That's a <strong>down payment on a house</strong> you're saving. 🏠
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Stop Paying Subscriptions. Start Owning Your Tools.
          </h2>
          <p className="text-xl mb-8 text-white opacity-95">
            Join smart entrepreneurs who are saving thousands per year while posting better content.
          </p>
          <Link 
            href="/pricing"
            onClick={() => analytics.clickCTA('cta_main', 'cta_section')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-bold text-lg inline-block shadow-lg hover:shadow-xl transition-all"
          >
            View Pricing Plans →
          </Link>
          <p className="mt-6 text-white opacity-95">
            ✅ 30-Day Money-Back Guarantee | ✅ Cancel Anytime | ✅ Free Plan Available
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'What plans are available?',
                a: 'We offer 4 plans: Free (5 posts/month), Starter ($9.99/mo - 50 posts), Pro ($29.99/mo - 200 posts), and Agency ($99.99/mo - unlimited). All paid plans include AI generation, multi-platform posting, and analytics.'
              },
              {
                q: 'Which platforms does it support?',
                a: 'Currently: LinkedIn, Twitter/X, Facebook, and Instagram. We focus on the platforms that matter most for business growth and content creators.'
              },
              {
                q: 'How good is the AI content generation?',
                a: 'The AI is powered by GPT-4 (the same AI behind ChatGPT). It generates professional, engaging, platform-optimized content. You can edit anything it writes, but 90% of users post the AI-generated content as-is or with minor tweaks.'
              },
              {
                q: 'What if I don\'t like it?',
                a: '30-day money-back guarantee. If Post Booster doesn\'t save you time and help you post consistently, just email us within 30 days for a full refund. No questions asked.'
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="font-bold text-lg mb-2 text-gray-900">{faq.q}</h3>
                <p className="text-gray-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Ready to Stop Paying Subscriptions?
          </h3>
          <Link 
            href="/login"
            onClick={() => analytics.clickCTA('final_get_started', 'final_cta_section')}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-bold text-lg inline-flex items-center shadow-lg hover:shadow-xl transition-all"
          >
            <DollarSign className="mr-2" />
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Alpha Wings AI
              </h3>
              <p className="text-gray-400 mb-4">
                AI-powered social media content generation for the modern creator.
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://twitter.com/alphawingsai" 
                  onClick={() => analytics.clickCTA('footer_twitter', 'footer')}
                  className="text-2xl hover:text-blue-400 transition-colors"
                >
                  🐦
                </a>
                <a 
                  href="https://linkedin.com/company/alphawingsai" 
                  onClick={() => analytics.clickCTA('footer_linkedin', 'footer')}
                  className="text-2xl hover:text-blue-400 transition-colors"
                >
                  💼
                </a>
                <a 
                  href="https://facebook.com/alphawingsai" 
                  onClick={() => analytics.clickCTA('footer_facebook', 'footer')}
                  className="text-2xl hover:text-blue-400 transition-colors"
                >
                  📘
                </a>
                <a 
                  href="https://instagram.com/alphawingsai" 
                  onClick={() => analytics.clickCTA('footer_instagram', 'footer')}
                  className="text-2xl hover:text-blue-400 transition-colors"
                >
                  📸
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="/schedule" className="hover:text-white transition-colors">Schedule Posts</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="mailto:hello@alphawingsai.com" className="hover:text-white transition-colors">Email Us</a></li>
                <li><a href="mailto:hello@alphawingsai.com" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="/gdpr" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 Alpha Wings AI. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Built with ❤️ by <a href="https://apexdigitalafrica.com" className="text-blue-400 hover:text-blue-300">Apex Digital Africa</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
