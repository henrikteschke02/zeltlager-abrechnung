"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Beer, Drumstick, Users, Croissant, LifeBuoy } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Getränke",
      href: "/dashboard/admin",
      icon: Beer,
      matchExact: true
    },
    {
      name: "Grillfleisch",
      href: "/dashboard/admin/grillfleisch",
      icon: Drumstick,
      matchExact: false
    },
    {
      name: "Brötchen",
      href: "/dashboard/admin/broetchen",
      icon: Croissant,
      matchExact: false
    },
    {
      name: "Camper",
      href: "/dashboard/admin/camper",
      icon: Users,
      matchExact: false
    },
    {
      name: "Feedback",
      href: "/dashboard/admin/feedback",
      icon: LifeBuoy,
      matchExact: false
    }
  ]

  return (
    <div className="flex items-center space-x-2 mb-8 p-1 bg-black/20 rounded-xl w-full md:w-fit max-w-full overflow-x-auto whitespace-nowrap no-scrollbar">
      {navItems.map((item) => {
        const isActive = item.matchExact ? pathname === item.href : pathname?.startsWith(item.href)
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-sans font-semibold uppercase tracking-widest transition-all",
              isActive 
                ? "bg-[#E5E4DE] text-[#4c503d] shadow-sm" 
                : "text-[#4c503d]/70 dark:text-white/70 hover:text-[#4c503d] dark:hover:text-white hover:bg-white/10"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
