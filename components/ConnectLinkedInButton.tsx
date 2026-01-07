'use client'

export default function ConnectLinkedInButton() {
  
  async function handleConnect() {
    try {
      // Get current user ID from Supabase
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Please log in first')
        return
      }

      const userId = session.user.id

      // Call our API to get the LinkedIn auth URL
      const response = await fetch('/api/auth/linkedin/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        alert('Failed to connect LinkedIn. Please try again.')
      }
    } catch (error) {
      console.error('Error connecting LinkedIn:', error)
      alert('Failed to connect LinkedIn. Please try again.')
    }
  }

  return (
    <button
      onClick={handleConnect}
      className="w-full px-3 py-2 bg-[#0A66C2] text-white rounded-lg text-xs font-semibold hover:bg-[#004182] transition-colors"
    >
      Connect LinkedIn
    </button>
  )
}
