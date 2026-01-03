'use client'

import { useState } from 'react'

export default function TestEmail() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  async function sendTest() {
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          to: email,
          data: {
            userName: email.split('@')[0],
            dashboardUrl: 'https://alphawingsai.com/dashboard'
          }
        })
      })

      const data = await res.json()

      if (res.ok) {
        setResult('✅ Email sent successfully! Check your inbox.')
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Test Welcome Email</h1>
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl mb-4"
        />

        <button
          onClick={sendTest}
          disabled={loading || !email}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-xl">
            {result}
          </div>
        )}
      </div>
    </div>
  )
}
