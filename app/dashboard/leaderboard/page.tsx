import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { LeaderboardView } from "@/components/leaderboard-view"

export default async function LeaderboardPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Profil check (Pflicht)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.full_name) {
    return redirect("/dashboard/profile")
  }

  // Lade alle benötigten Daten für die Aggregation
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url')
  const { data: beverages } = await supabase.from('beverages').select('*')
  const { data: consumptions } = await supabase.from('consumptions').select('id, user_id, beverage_id, quantity')

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard & Statistik</h1>
        <p className="text-muted-foreground mt-2">
          Wer ist der Bierkönig und was wurde insgesamt getrunken?
        </p>
      </div>

      <LeaderboardView 
        profiles={profiles || []} 
        beverages={beverages || []} 
        consumptions={consumptions || []} 
        initialTab={searchParams?.tab || "leaderboard"}
      />
    </div>
  )
}
