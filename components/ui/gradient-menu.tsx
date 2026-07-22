"use client"

import * as React from "react"
import Link from "next/link"
import { Home, MessageSquare, Beer, Flame, Croissant, PieChart, Settings, LifeBuoy } from "lucide-react"

const gradientNavItems = [
  { name: "Start", href: "/dashboard", icon: Home, from: "#a955ff", to: "#ea51ff" },
  { name: "S. Brett", href: "/dashboard/schwarzes-brett", icon: MessageSquare, from: "#56CCF2", to: "#2F80ED" },
  { name: "Getränke", href: "/dashboard/getraenke", icon: Beer, from: "#FF9966", to: "#FF5E62" },
  { name: "Grill", href: "/dashboard/grillfleisch", icon: Flame, from: "#80FF72", to: "#7EE8FA" },
  { name: "Brötchen", href: "/dashboard/broetchen", icon: Croissant, from: "#ffa9c6", to: "#f434e2" },
  { name: "Hilfe", href: "/dashboard/hilfe", icon: LifeBuoy, from: "#4facfe", to: "#00f2fe" },
  { name: "Statistik", href: "/dashboard/statistik", icon: PieChart, from: "#F5D020", to: "#F53803" },
]

export function GradientMenu({ isAdmin }: { isAdmin?: boolean }) {
  const items = [...gradientNavItems]
  
  if (isAdmin) {
    items.push({ name: "Admin", href: "/dashboard/admin", icon: Settings, from: "#9333ea", to: "#db2777" })
  }

  return (
    <nav className="w-full overflow-x-auto overflow-y-visible no-scrollbar py-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <ul className="flex items-center justify-center gap-4 min-w-max px-4">
        {items.map((item) => (
          <li key={item.href} className="group relative list-none flex-shrink-0">
            <Link 
              href={item.href} 
              className="relative flex items-center justify-center w-[50px] h-[50px] bg-white dark:bg-zinc-800 shadow-md dark:shadow-black/40 rounded-full transition-all duration-500 hover:w-[160px] hover:shadow-none cursor-pointer overflow-hidden z-10"
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
        ))}
      </ul>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  )
}
