"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tent, LogOut } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { GradientMenu } from "@/components/ui/gradient-menu"

export function Navigation() {
  const router = useRouter()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = React.useState(false)

  React.useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (data?.role === 'admin') setIsAdmin(true)
      }
    }
    checkAdmin()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[72px] items-center px-4 md:px-8 justify-between gap-4">
        
        {/* LOGO (Hidden on very small screens, visible on md+) */}
        <div className="hidden md:flex items-center min-w-max">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Tent className="h-5 w-5 text-primary" />
            <span className="font-serif font-bold text-lg tracking-tight">
              Zeltlager Manager
            </span>
          </Link>
        </div>

        {/* GRADIENT MENU (Zentriert, scrollbar auf Mobile) */}
        <div className="flex-1 overflow-hidden flex justify-center">
          <GradientMenu isAdmin={isAdmin} />
        </div>

        {/* RECHTS (ModeToggle & Logout) */}
        <div className="flex items-center space-x-2 min-w-max">
          <ModeToggle />
          <Button variant="outline" size="icon" onClick={handleLogout} className="md:hidden">
            <LogOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleLogout} className="hidden md:flex">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>

      </div>
    </header>
  )
}
