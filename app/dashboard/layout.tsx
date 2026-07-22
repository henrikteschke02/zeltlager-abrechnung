import React from "react"
import { Navigation } from "@/components/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-muted/20 min-h-screen">
      <div className="flex min-h-screen flex-col w-full overflow-x-clip">
        <Navigation />
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
      </div>
    </div>
  )
}
