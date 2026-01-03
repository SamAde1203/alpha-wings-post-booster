import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 401 })
    }

    // Verify token with Supabase
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '')
    const verified = await jwtVerify(token, secret)
    const userId = verified.payload.sub

    return NextResponse.json({ userId })
  } catch (err: any) {
    console.error('Auth error:', err.message)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
