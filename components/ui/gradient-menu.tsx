"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Beer, Flame, Croissant, PieChart, Settings, LifeBuoy } from "lucide-react"

const gradientNavItems = [
  { name: "Start", href: "/dashboard", icon: Home, from: "#14532d", to: "#22c55e", exact: true },
  { name: "S. Brett", href: "/dashboard/schwarzes-brett", icon: MessageSquare, from: "#1e3a8a", to: "#3b82f6" },
  { name: "Getränke", href: "/dashboard/getraenke", icon: Beer, from: "#0891b2", to: "#2dd4bf" },
  { name: "Grill", href: "/dashboard/grillfleisch", icon: Flame, from: "#ea580c", to: "#fbbf24" },
  { name: "Brötchen", href: "/dashboard/broetchen", icon: Croissant, from: "#b45309", to: "#fcd34d" },
  { name: "Hilfe", href: "/dashboard/hilfe", icon: LifeBuoy, from: "#4338ca", to: "#818cf8" },
  { name: "Statistik", href: "/dashboard/statistik", icon: PieChart, from: "#9f1239", to: "#f43f5e" },
]

export function GradientMenu({ isAdmin, variant = "both" }: { isAdmin?: boolean, variant?: "desktop" | "mobile" | "both" }) {
  const pathname = usePathname()
  const items = [...gradientNavItems]
  
  if (isAdmin) {
    items.push({ name: "Admin", href: "/dashboard/admin", icon: Settings, from: "#4c1d95", to: "#a78bfa" })
  }

  return (
    <>
      {/* ── DESKTOP NAVIGATION (ab md Breakpoint) ───────────────────────── */}
      {(variant === "desktop" || variant === "both") && (
        <nav className={`${variant === 'both' ? 'hidden md:block' : ''} w-full py-2`}>
          <ul className="flex items-center justify-center gap-4 px-4">
            {items.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)
              
              return (
                <li key={item.href} className="group relative list-none">
                  <Link 
                    href={item.href} 
                    className={`relative flex items-center justify-center w-[50px] h-[50px] bg-white dark:bg-zinc-800 shadow-md dark:shadow-black/40 rounded-full transition-all duration-500 hover:w-[160px] hover:shadow-none cursor-pointer overflow-hidden z-10 ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                    style={{
                      '--gradient-from': item.from,
                      '--gradient-to': item.to,
                    } as React.CSSProperties}
                  >
                    {/* Glow Effekt hinter dem Element */}
                    <span className="absolute inset-0 blur-[15px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full -z-10" style={{ background: `linear-gradient(to right, var(--gradient-from), var(--gradient-to))` }} />
                    
                    {/* Farb-Gradient innerhalb des Elements */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full -z-10" style={{ background: `linear-gradient(to right, var(--gradient-from), var(--gradient-to))` }} />
                    
                    {/* Icon, verschwindet bei Hover */}
                    <item.icon className="absolute z-10 w-5 h-5 text-slate-700 dark:text-slate-300 transition-all duration-500 group-hover:scale-0 group-hover:opacity-0" />
                    
                    {/* Text, erscheint bei Hover */}
                    <span className="absolute z-10 text-white uppercase text-xs font-bold scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 tracking-wider whitespace-nowrap">
                      {item.name}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {/* ── MOBILE NAVIGATION (Bottom Bar unter md Breakpoint) ───────────── */}
      {(variant === "mobile" || variant === "both") && (
        <nav className={`${variant === 'both' ? 'md:hidden' : ''} fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-black/10 dark:border-slate-800 pb-safe`}>
          <ul className="flex justify-around items-center py-3 px-2">
            {items.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)
              
              return (
                <li key={item.href} className="list-none">
                  <Link 
                    href={item.href}
                    className="flex flex-col items-center justify-center w-12 h-12 relative rounded-full transition-colors"
                  >
                    <item.icon 
                      className={`w-6 h-6 transition-all duration-300 ${
                        isActive ? "scale-110" : "scale-100 opacity-70"
                      }`}
                      style={{ 
                        color: isActive ? item.from : 'currentColor',
                        filter: isActive ? `drop-shadow(0 0 8px ${item.from}80)` : 'none'
                      }}
                    />
                    {/* Kleiner Punkt als Indikator, wenn aktiv */}
                    {isActive && (
                      <span 
                        className="absolute -bottom-1 w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: item.from }}
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </>
  )
}
