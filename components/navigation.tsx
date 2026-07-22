"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Tent, LogOut, Home, MessageSquare, Beer, Flame, Croissant, PieChart, Settings, LifeBuoy, Menu } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

import { Button, buttonVariants } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { name: "Startseite", href: "/dashboard", icon: Home, exact: true },
  { name: "Schwarzes Brett", href: "/dashboard/schwarzes-brett", icon: MessageSquare },
  { name: "Getränke", href: "/dashboard/getraenke", icon: Beer },
  { name: "Grillfleisch", href: "/dashboard/grillfleisch", icon: Flame },
  { name: "Brötchen", href: "/dashboard/broetchen", icon: Croissant },
  { name: "Hilfe", href: "/dashboard/hilfe", icon: LifeBuoy },
  { name: "Statistik", href: "/dashboard/statistik", icon: PieChart },
]

export function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

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

  const items = [...navItems]
  // In mobile menu, admin is added to the list.
  const mobileItems = [...items]
  if (isAdmin) {
    mobileItems.push({ name: "Admin", href: "/dashboard/admin", icon: Settings })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[72px] items-center px-4 lg:px-8 justify-between">
        
        {/* LOGO & MOBILE MENU TRIGGER */}
        <div className="flex items-center space-x-2">
          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="mr-2" />}>
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Tent className="h-5 w-5 text-primary" />
                    <span>Zeltlager Manager</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-8">
                  {mobileItems.map((item) => {
                    const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)
                    return (
                      <Link 
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                      >
                        <item.icon size={20} />
                        {item.name}
                      </Link>
                    )
                  })}
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/dashboard" className="flex items-center space-x-2">
            <Tent className="h-5 w-5 text-primary" />
            <span className="font-serif font-bold text-lg tracking-tight hidden sm:inline-block">
              Zeltlager Manager
            </span>
          </Link>
        </div>

        {/* DESKTOP NAVIGATION (Pill-Tab-Bar) */}
        <div className="hidden md:flex flex-1 justify-center min-w-0 px-4">
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1.5 bg-black/10 dark:bg-black/40 rounded-full w-max max-w-full">
            {items.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? "bg-[#e6e2d6] text-slate-900 rounded-full px-4 py-2 flex items-center gap-2 whitespace-nowrap font-bold text-xs uppercase shadow-sm shrink-0 transition-colors"
                      : "text-foreground/80 hover:text-foreground hover:bg-foreground/10 rounded-full px-4 py-2 flex items-center gap-2 whitespace-nowrap font-medium text-xs uppercase transition-colors shrink-0"
                  }
                >
                  <item.icon size={16} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* RECHTS (ModeToggle & Logout) */}
        <div className="flex items-center space-x-2 shrink-0">
          {isAdmin && (
            <Link 
              href="/dashboard/admin"
              className={buttonVariants({ variant: "default", className: "hidden md:flex bg-primary text-primary-foreground border-primary hover:bg-primary/90 font-bold" })}
            >
              <Settings className="mr-2 h-4 w-4" />
              ADMIN
            </Link>
          )}

          <ModeToggle />
          
          <Button 
            variant="outline"
            size="icon"
            onClick={handleLogout} 
            className="md:hidden"
          >
            <LogOut className="h-4 w-4" />
          </Button>

          <Button 
            variant="outline"
            onClick={handleLogout} 
            className="hidden md:flex"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>

      </div>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  )
}
