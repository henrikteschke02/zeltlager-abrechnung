"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Tent, LogOut, Home, MessageSquare, Beer, Flame, Croissant, PieChart, Settings, LifeBuoy } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { GradientMenu } from "@/components/ui/gradient-menu"

const simpleNavItems = [
  { name: "Start", href: "/dashboard", icon: Home, exact: true },
  { name: "S. Brett", href: "/dashboard/schwarzes-brett", icon: MessageSquare },
  { name: "Getränke", href: "/dashboard/getraenke", icon: Beer },
  { name: "Grill", href: "/dashboard/grillfleisch", icon: Flame },
  { name: "Brötchen", href: "/dashboard/broetchen", icon: Croissant },
  { name: "Hilfe", href: "/dashboard/hilfe", icon: LifeBuoy },
  { name: "Statistik", href: "/dashboard/statistik", icon: PieChart },
]

function SimpleNav({ isAdmin, pathname }: { isAdmin: boolean, pathname: string | null }) {
  const items = [...simpleNavItems]
  if (isAdmin) {
    items.push({ name: "Admin", href: "/dashboard/admin", icon: Settings })
  }
  return (
    <nav className="w-full overflow-x-auto no-scrollbar py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <ul className="flex items-center justify-center gap-4 min-w-max px-4">
        {items.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)
          return (
            <li key={item.href} className="list-none flex-shrink-0">
              <Link 
                href={item.href}
                className={`flex items-center justify-center w-[50px] h-[50px] bg-slate-900 shadow-md rounded-full transition-all duration-300 ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:bg-slate-800'}`}
                title={item.name}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              </Link>
            </li>
          )
        })}
      </ul>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  )
}

export function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = React.useState(false)
  
  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

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

  // Fallback: URSPRÜNGLICHES Menü wenn nicht gemounted oder theme nicht "vibe" ist
  const renderNav = () => {
    if (!mounted) return <SimpleNav isAdmin={isAdmin} pathname={pathname} />
    if (theme === 'vibe') return <GradientMenu />
    return <SimpleNav isAdmin={isAdmin} pathname={pathname} />
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[72px] items-center px-4 md:px-8 justify-between gap-4">
        
        {/* LOGO */}
        <div className="hidden md:flex items-center min-w-max">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Tent className="h-5 w-5 text-primary" />
            <span className="font-serif font-bold text-lg tracking-tight">
              Zeltlager Manager
            </span>
          </Link>
        </div>

        {/* NAVIGATION (Zentriert) */}
        <div className="flex-1 overflow-hidden flex justify-center">
          {renderNav()}
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
