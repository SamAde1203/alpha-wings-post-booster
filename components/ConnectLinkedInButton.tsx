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

      // LinkedIn OAuth URL
      const linkedInAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
      linkedInAuthUrl.searchParams.append('response_type', 'code')
      linkedInAuthUrl.searchParams.append('client_id', process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!)
      linkedInAuthUrl.searchParams.append('redirect_uri', process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI!)
      linkedInAuthUrl.searchParams.append('state', userId)
      linkedInAuthUrl.searchParams.append('scope', 'openid profile email w_member_social')

      // Redirect to LinkedIn
      window.location.href = linkedInAuthUrl.toString()
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
