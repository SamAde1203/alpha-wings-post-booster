'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { analytics } from '@/lib/analytics'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.session.user.id)
        .single()
      
      setUser(userData)
    }
  }

  async function handleLogout() {
    analytics.trackEvent('logout_clicked', { page: 'navigation' })
    await supabase.auth.signOut()
    router.push('/login')
  }

  function getTierBadge() {
    const tier = user?.subscription_tier?.toLowerCase() || 'free'
    
    const badges: Record<string, { icon: string; color: string; label: string }> = {
      free: { icon: '🎁', color: 'bg-gray-100 text-gray-700', label: 'FREE' },
      starter: { icon: '⭐', color: 'bg-blue-100 text-blue-700', label: 'STARTER' },
      pro: { icon: '🚀', color: 'bg-purple-100 text-purple-700', label: 'PRO' },
      agency: { icon: '👑', color: 'bg-yellow-100 text-yellow-700', label: 'AGENCY' },
    }

    return badges[tier] || badges.free
  }

  const badge = getTierBadge()

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/posts', label: 'My Posts', icon: '📚' },
    { href: '/schedule', label: 'Schedule', icon: '📅' },
    { href: '/connect', label: 'Connect', icon: '🔗' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/pricing', label: 'Upgrade', icon: '💎' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
	
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo - Always visible */}
          <a href="/dashboard" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src="/alpha-wings-ai-logo.png"
              alt="Alpha Wings"
              width={140}
              height={40}
              priority
              className="h-9 w-auto"
            />
            <span className="hidden sm:inline text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Alpha Wings
            </span>
          </a>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  pathname === link.href
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.icon} {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Plan Badge & Logout */}
          <div className="hidden lg:flex items-center gap-3">
            {user && (
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                {badge.icon} {badge.label}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
            >
              🚪 Logout
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => {
              setIsMenuOpen(!isMenuOpen)
              analytics.trackEvent('mobile_menu_toggle', { open: !isMenuOpen })
            }}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              // Close icon
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2 border-t border-gray-200">
            {/* Plan Badge */}
            {user && (
              <div className="px-4 py-2">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                  {badge.icon} {badge.label}
                </div>
              </div>
            )}

            {/* Navigation Links */}
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => {
                  setIsMenuOpen(false)
                  analytics.trackEvent('nav_click_mobile', { destination: link.href })
                }}
                className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white mx-2'
                    : 'text-gray-700 hover:bg-gray-100 mx-2'
                }`}
              >
                {link.icon} {link.label}
              </a>
            ))}

            {/* Logout Button */}
            <button
              onClick={() => {
                setIsMenuOpen(false)
                handleLogout()
              }}
              className="w-full text-left px-4 py-3 mx-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
