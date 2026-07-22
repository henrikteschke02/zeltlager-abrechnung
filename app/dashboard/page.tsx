import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Beer, Drumstick, Croissant, MessageSquare, Calculator, LifeBuoy, Tent } from "lucide-react"

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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">Hallo, {profile.full_name?.split(' ')[0] || 'Camper'}! <Tent className="w-8 h-8 text-primary" /></h1>
          <p className="text-muted-foreground mt-2">
            Willkommen im Zeltlager. Was möchtest du tun?
          </p>
        </div>

        <div className="space-y-8">
          {/* Sektion 1: Verpflegung */}
          <section>
            <h2 className="text-xl font-bold mb-4">Verpflegung</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/dashboard/getraenke" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Getränke-Strichliste</CardTitle>
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
                    <CardTitle className="text-sm font-medium">Grillfleisch-Strichliste</CardTitle>
                    <Drumstick className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Grill-Deckel</div>
                    <p className="text-xs text-muted-foreground">Dein aktueller Fleischkonsum</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/broetchen" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Brötchen-Bestellung</CardTitle>
                    <Croissant className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Brötchen-Deckel</div>
                    <p className="text-xs text-muted-foreground">Dein aktueller Brötchenkonsum</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          {/* Sektion 2: Infos & Verwaltung */}
          <section>
            <h2 className="text-xl font-bold mb-4 mt-8">Infos & Verwaltung</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/dashboard/schwarzes-brett" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Schwarzes Brett</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Schwarzes Brett</div>
                    <p className="text-xs text-muted-foreground">News & Ankündigungen</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/dashboard/statistik" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gesamt-Statistik</CardTitle>
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Statistik</div>
                    <p className="text-xs text-muted-foreground">Kassenabrechnung & Summen</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/hilfe" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hilfe & Feedback</CardTitle>
                    <LifeBuoy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Support</div>
                    <p className="text-xs text-muted-foreground">FAQ & Kontakt zum Team</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/profile" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mein Profil</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Profil</div>
                    <p className="text-xs text-muted-foreground">Daten & Mitglieder verwalten</p>
                  </CardContent>
                </Card>
              </Link>
              
              {profile.role === 'admin' && (
                <Link href="/dashboard/admin" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                  <Card className="border-primary border hover:border-primary/80 transition-colors h-full bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-bold text-primary">Verwaltung & Admin</CardTitle>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">Admin-Panel</div>
                      <p className="text-xs text-muted-foreground">Lager, User & Einstellungen</p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
