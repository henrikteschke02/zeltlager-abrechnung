import { Navigation } from "@/components/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20 w-full overflow-x-hidden">
      <Navigation />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
    </div>
  )
}
