"use client"

import React, { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { useTheme } from "next-themes"
import { SilkAurora } from "@/components/ui/silk-aurora"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const content = (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden">
      <Navigation />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
    </div>
  )

  if (!mounted) {
    return <div className="bg-muted/20 min-h-screen">{content}</div>
  }

  if (theme === 'vibe') {
    return (
      <SilkAurora interactive={true} speed={0.5}>
        <div className="relative z-20 min-h-screen w-full">
          {content}
        </div>
      </SilkAurora>
    )
  }

  return (
    <div className="bg-muted/20 min-h-screen">
      {content}
    </div>
  )
}
