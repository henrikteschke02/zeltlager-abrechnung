"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Tent, Menu, LogOut, Beer, Drumstick, Croissant, Settings, Home, MessageSquare, Calculator } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

import { Button, buttonVariants } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Startseite", href: "/dashboard", icon: Home, exact: true },
  { name: "Schwarzes Brett", href: "/dashboard/schwarzes-brett", icon: MessageSquare },
  { name: "Getränke", href: "/dashboard/getraenke", icon: Beer },
  { name: "Grillfleisch", href: "/dashboard/grillfleisch", icon: Drumstick },
  { name: "Brötchen", href: "/dashboard/broetchen", icon: Croissant },
  { name: "Statistik", href: "/dashboard/statistik", icon: Calculator },
]

export function Navigation() {
  const pathname = usePathname()
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
      <div className="container flex h-16 items-center px-4 md:px-8">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-8 flex items-center space-x-2">
            <Tent className="h-5 w-5 text-primary" />
            <span className="hidden font-serif font-bold text-lg tracking-tight sm:inline-block">
              Zeltlager Manager
            </span>
          </Link>
          <nav className="flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-sans font-semibold uppercase tracking-widest transition-colors hover:text-foreground ${
                    isActive ? "text-foreground" : "text-foreground/50"
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className={`flex items-center space-x-1 text-xs font-sans font-semibold uppercase tracking-widest transition-colors hover:text-foreground ${
                  pathname?.startsWith('/dashboard/admin')
                    ? "text-primary font-bold"
                    : "text-foreground/50"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Link>
            )}
          </nav>
        </div>
        <Sheet>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            )}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetHeader>
              <SheetTitle className="text-left">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <Tent className="h-5 w-5 text-primary" />
                  <span className="font-serif font-bold">Zeltlager Manager</span>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => {
                  const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 py-2 text-xs uppercase tracking-widest font-semibold transition-colors hover:text-foreground ${
                        isActive ? "text-foreground" : "text-foreground/50"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
                {isAdmin && (
                  <Link
                    href="/dashboard/admin"
                    className={`flex items-center space-x-2 py-2 text-xs uppercase tracking-widest font-semibold transition-colors hover:text-foreground ${
                      pathname?.startsWith('/dashboard/admin')
                        ? "text-primary"
                        : "text-foreground/50"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin-Bereich</span>
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <nav className="flex items-center space-x-2">
            <ModeToggle />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
