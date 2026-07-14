import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Beer, Drumstick, Croissant } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Willkommen zurück, {user?.email}! Hier ist deine aktuelle Übersicht.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/10 hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Getränke
            </CardTitle>
            <Beer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 Deckel</div>
            <p className="text-xs text-muted-foreground">
              Dein heutiger Konsum
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/10 hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Grillfleisch
            </CardTitle>
            <Drumstick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 Portionen</div>
            <p className="text-xs text-muted-foreground">
              Für heute eingetragen
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Brötchen
            </CardTitle>
            <Croissant className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 Bestellt</div>
            <p className="text-xs text-muted-foreground">
              Für das nächste Frühstück
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
