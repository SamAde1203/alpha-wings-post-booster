'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'

interface FAQItem {
  question: string
  answer: string
  category: string
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const faqs: FAQItem[] = [
    // General Questions
    {
      category: 'general',
      question: 'What is Alpha Wings AI?',
      answer: 'Alpha Wings AI is an AI-powered social media content generator that helps you create engaging posts for LinkedIn, Twitter, Facebook, and Instagram. Our platform uses advanced AI to generate high-quality, platform-optimized content in seconds.'
    },
    {
      category: 'general',
      question: 'How does the AI content generation work?',
      answer: 'Our AI analyzes your topic, platform, and tone preferences to generate customized content. It considers platform-specific best practices, character limits, and engagement patterns to create posts that resonate with your audience.'
    },
    {
      category: 'general',
      question: 'Which social media platforms do you support?',
      answer: 'We currently support LinkedIn, Twitter (X), Facebook, and Instagram. Each platform has optimized content generation that considers character limits, hashtag usage, and platform-specific best practices.'
    },

    // Pricing & Plans
    {
      category: 'pricing',
      question: 'What plans do you offer?',
      answer: 'We offer 4 plans: Free (5 posts/month), Starter (50 posts/month at £9.99), Pro (200 posts/month at £29.99), and Enterprise (unlimited posts at £99.99). All paid plans include advanced features like scheduling and analytics.'
    },
    {
      category: 'pricing',
      question: 'Can I change my plan later?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time from your account settings. Upgrades take effect immediately, while downgrades take effect at the start of your next billing cycle.'
    },
    {
      category: 'pricing',
      question: 'Do unused posts roll over to the next month?',
      answer: 'No, unused posts do not roll over. Your post limit resets at the beginning of each billing cycle. However, you can always upgrade to a higher plan if you need more posts.'
    },
    {
      category: 'pricing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure payment processor, Stripe. All transactions are encrypted and secure.'
    },
    {
      category: 'pricing',
      question: 'Is there a refund policy?',
      answer: 'We offer a 7-day money-back guarantee for all paid plans. If you\'re not satisfied within the first 7 days, contact us for a full refund. No questions asked!'
    },

    // Features
    {
      category: 'features',
      question: 'Can I schedule posts in advance?',
      answer: 'Yes! Pro and Enterprise plans include our advanced scheduling feature. You can schedule posts weeks or months in advance, and they\'ll be automatically published at your chosen time.'
    },
    {
      category: 'features',
      question: 'Can I edit AI-generated content?',
      answer: 'Absolutely! All generated content is fully editable. You can modify, add, or remove any part of the content before copying or scheduling it. Think of AI as your writing assistant, not a replacement.'
    },
    {
      category: 'features',
      question: 'Do you provide analytics?',
      answer: 'Yes! Pro and Enterprise plans include detailed analytics showing your post performance, engagement rates, and content insights to help you optimize your social media strategy.'
    },
    {
      category: 'features',
      question: 'Can I generate multiple variations?',
      answer: 'Yes! Each generation creates 3 unique variations of your content, allowing you to choose the one that best fits your needs or A/B test different approaches.'
    },

    // Account & Security
    {
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click "Get Started" on our homepage, choose your plan, and complete the signup process. You can start using the platform immediately after creating your account.'
    },
    {
      category: 'account',
      question: 'Is my data secure?',
      answer: 'Yes! We use industry-standard encryption for all data transmission and storage. Your content and personal information are stored securely and never shared with third parties without your consent.'
    },
    {
      category: 'account',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period, and you won\'t be charged again.'
    },
    {
      category: 'account',
      question: 'What happens to my data if I cancel?',
      answer: 'Your generated posts and account data remain accessible for 30 days after cancellation. After 30 days, your data is permanently deleted from our servers (as required by GDPR).'
    },

    // Technical
    {
      category: 'technical',
      question: 'Do I need any technical skills?',
      answer: 'Not at all! Our platform is designed to be user-friendly and intuitive. If you can type a topic and click a button, you can use Alpha Wings AI. No coding or technical knowledge required.'
    },
    {
      category: 'technical',
      question: 'Can I use Alpha Wings AI on mobile?',
      answer: 'Yes! Our platform is fully responsive and works on all devices - desktop, tablet, and mobile. You can generate and manage content from anywhere.'
    },
    {
      category: 'technical',
      question: 'Do you have an API?',
      answer: 'API access is available for Enterprise customers. Contact us at business@alphawingsai.com to discuss API integration for your workflow.'
    },
    {
      category: 'technical',
      question: 'What browsers do you support?',
      answer: 'We support all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of your browser.'
    },

    // Support
    {
      category: 'support',
      question: 'How can I get help?',
      answer: 'You can reach us through our contact form, email us at support@alphawingsai.com, or check this FAQ page. We typically respond within 24 hours during business days.'
    },
    {
      category: 'support',
      question: 'Do you offer training or tutorials?',
      answer: 'Yes! We provide video tutorials, documentation, and best practices guides to help you get the most out of Alpha Wings AI. Check our Help Center for resources.'
    },
    {
      category: 'support',
      question: 'Can I suggest new features?',
      answer: 'We love feedback! Email your suggestions to hello@alphawingsai.com. We actively consider user feedback when planning new features and improvements.'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Questions', icon: '📚' },
    { id: 'general', name: 'General', icon: '💡' },
    { id: 'pricing', name: 'Pricing & Plans', icon: '💳' },
    { id: 'features', name: 'Features', icon: '✨' },
    { id: 'account', name: 'Account & Security', icon: '🔒' },
    { id: 'technical', name: 'Technical', icon: '⚙️' },
    { id: 'support', name: 'Support', icon: '💬' }
  ]

  const filteredFAQs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about Alpha Wings AI
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-blue-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <span className="text-2xl text-blue-600 flex-shrink-0">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5 pt-2">
                  <div className="border-t-2 border-gray-200 pt-4">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Can't find what you're looking for? We're here to help!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/contact"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              📧 Contact Support
            </a>
            <a
              href="mailto:hello@alphawingsai.com"
              className="px-8 py-4 bg-blue-800 text-white rounded-xl font-bold hover:bg-blue-900 transition-all"
            >
              ✉️ Email Us
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-gray-200">
            <div className="text-4xl mb-3">⚡</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">24hrs</div>
            <div className="text-gray-600">Average Response Time</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-gray-200">
            <div className="text-4xl mb-3">🎯</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
            <div className="text-gray-600">Customer Satisfaction</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-gray-200">
            <div className="text-4xl mb-3">💬</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">1000+</div>
            <div className="text-gray-600">Questions Answered</div>
          </div>
        </div>
      </main>
    </div>
  )
}
