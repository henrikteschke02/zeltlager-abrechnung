import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Beer, Drumstick, Croissant, MessageSquare } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_approved')
    .eq('id', user.id)
    .single()

  if (!profile?.full_name) {
    return redirect("/dashboard/profile")
  }

  if (profile?.role !== 'admin' && profile?.is_approved === false) {
    const { Warteraum } = await import("@/components/warteraum")
    return <Warteraum />
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hallo, {profile.full_name?.split(' ')[0] || 'Camper'}! ⛺</h1>
          <p className="text-muted-foreground mt-2">
            Willkommen im Zeltlager. Was möchtest du tun?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/getraenke" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
            <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Getränke</CardTitle>
                <Beer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Strichliste</div>
                <p className="text-xs text-muted-foreground">Dein heutiger Konsum & Deckel</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/dashboard/grillfleisch" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
            <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Grillfleisch</CardTitle>
                <Drumstick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Grill-Deckel</div>
                <p className="text-xs text-muted-foreground">Dein aktueller Fleischkonsum</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/schwarzes-brett" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
            <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Community</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Schwarzes Brett</div>
                <p className="text-xs text-muted-foreground">News & Ankündigungen</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/broetchen" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
            <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full opacity-60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Brötchen</CardTitle>
                <Croissant className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Bald verfügbar</div>
                <p className="text-xs text-muted-foreground">Brötchen Bestellsystem</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
