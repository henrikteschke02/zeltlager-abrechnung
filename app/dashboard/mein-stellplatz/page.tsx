import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { CamperStellplatzDashboard } from "@/components/camper-stellplatz-dashboard"

export const metadata = {
  title: "Mein Stellplatz | Zeltlager Manager",
  description: "Verwalte deine Haushaltsdaten für das Zeltlager",
}

export default async function MeinStellplatzPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect("/login")
  }

  // Fetch current user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return redirect("/login")
  }

  // Fetch global settings to check if billing is released
  const { data: settings } = await supabase
    .from('global_settings')
    .select('abrechnung_freigegeben')
    .eq('id', 1)
    .single()

  const isLocked = settings?.abrechnung_freigegeben ?? false

  return (
    <div className="container mx-auto p-4 md:p-8">
      <CamperStellplatzDashboard initialProfile={profile} isLocked={isLocked} />
    </div>
  )
}
