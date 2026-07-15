import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Handles the redirect from a Supabase confirmation email.
// Supabase appends `?code=...` to this URL after the user clicks the link.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // next param can be set to redirect somewhere specific after login
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If no code or exchange fails, redirect to login with error indicator
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
