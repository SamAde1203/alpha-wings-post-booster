'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>

            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl">
                <p className="text-green-700 font-semibold">✅ Message sent successfully!</p>
                <p className="text-green-600 text-sm mt-1">We'll get back to you soon.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl">
                <p className="text-red-700 font-semibold">❌ Failed to send message</p>
                <p className="text-red-600 text-sm mt-1">Please try again or email us directly.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-medium mb-2 text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="What's this about?"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {status === 'sending' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Sending...
                  </span>
                ) : (
                  '📧 Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Email */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📧</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
                  <p className="text-gray-700 mb-2">For general inquiries and support</p>
                  <a 
                    href="mailto:hello@alphawingsai.com"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    hello@alphawingsai.com
                  </a>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💬</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Support</h3>
                  <p className="text-gray-700 mb-2">Need help with your account?</p>
                  <a 
                    href="mailto:support@alphawingsai.com"
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    support@alphawingsai.com
                  </a>
                </div>
              </div>
            </div>

            {/* Business */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💼</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Business Inquiries</h3>
                  <p className="text-gray-700 mb-2">Partnerships and enterprise plans</p>
                  <a 
                    href="mailto:business@alphawingsai.com"
                    className="text-green-600 hover:text-green-700 font-semibold"
                  >
                    business@alphawingsai.com
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Follow Us</h3>
              <div className="grid grid-cols-2 gap-3">
                <a 
                  href="https://twitter.com/alphawingsai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <span className="text-2xl">🐦</span>
                  <span className="font-medium">Twitter</span>
                </a>
                <a 
                  href="https://linkedin.com/company/alphawingsai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <span className="text-2xl">💼</span>
                  <span className="font-medium">LinkedIn</span>
                </a>
                <a 
                  href="https://facebook.com/alphawingsai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <span className="text-2xl">📘</span>
                  <span className="font-medium">Facebook</span>
                </a>
                <a 
                  href="https://instagram.com/alphawingsai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <span className="text-2xl">📸</span>
                  <span className="font-medium">Instagram</span>
                </a>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚡</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Response Time</h3>
                  <p className="text-gray-700">
                    We typically respond within <strong>24 hours</strong> during business days.
                    For urgent matters, please mark your subject as "URGENT".
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Looking for quick answers? Check out our FAQ page!
          </p>
          <a 
            href="/faq"
            className="inline-block px-8 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all shadow-md hover:shadow-lg"
          >
            📚 View FAQ
          </a>
        </div>
      </main>
    </div>
  )
}
