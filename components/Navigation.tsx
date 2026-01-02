'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
  { href: '/dashboard', label: '🏠 Dashboard', icon: '🏠' },
  { href: '/posts', label: '📚 My Posts', icon: '📚' },
  { href: '/schedule', label: '📅 Schedule', icon: '📅' },
  { href: '/connect', label: '🔗 Connect', icon: '🔗' },
  { href: '/analytics', label: '📊 Analytics', icon: '📊' },
  { href: '/pricing', label: '💎 Upgrade', icon: '💎' },
  { href: '/settings', label: '⚙️ Settings', icon: '⚙️' },
]


  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Alpha Wings
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
