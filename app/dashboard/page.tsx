import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Beer, Drumstick, Croissant } from "lucide-react"
import { NewsBoard } from "@/components/news-board"

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

  const { data: news } = await supabase
    .from('news')
    .select('id, title, content, created_at, author_id, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: requests } = await supabase
    .from('news_delete_requests')
    .select('id, news_id, requester_id, profiles(full_name)')

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hallo, {profile.full_name?.split(' ')[0] || 'Camper'}! ⛺</h1>
        <p className="text-muted-foreground mt-2">
          Willkommen im Zeltlager. Was möchtest du tun?
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Link href="/dashboard/getraenke" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Getränke
              </CardTitle>
              <Beer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Strichliste</div>
              <p className="text-xs text-muted-foreground">
                Dein heutiger Konsum & Deckel
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/grillfleisch" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full opacity-60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Grillfleisch
              </CardTitle>
              <Drumstick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Bald verfügbar</div>
              <p className="text-xs text-muted-foreground">
                Fleischliste Modul
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/broetchen" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <Card className="border-primary/10 hover:border-primary/30 transition-colors h-full opacity-60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Brötchen
              </CardTitle>
              <Croissant className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Bald verfügbar</div>
              <p className="text-xs text-muted-foreground">
                Brötchen Bestellsystem
              </p>
            </CardContent>
          </Card>
        </Link>
        </div>

        <div className="space-y-6">
          <NewsBoard 
            initialNews={(news as any) || []} 
            initialRequests={(requests as any) || []}
            isAdmin={profile.role === 'admin'} 
            userId={user.id} 
          />
        </div>
      </div>
    </div>
  )
}
