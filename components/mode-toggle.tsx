"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isVibe = mounted && theme === 'vibe'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={isVibe ? "inline-flex items-center justify-center rounded-md h-10 w-10 bg-black/40 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all" : buttonVariants({ variant: "outline", size: "icon" })}>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light (Hell)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("standard")}>
          Standard (Olivgrün)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark (Schwarz)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("vibe")}>
          Vibe Mode (Experimentell)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
