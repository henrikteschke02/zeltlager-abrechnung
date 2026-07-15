import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { CamperBeverageDashboard } from "@/components/camper-beverage-dashboard"

export default async function GetraenkePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Profil check
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

  // Lade alle verfügbaren Getränke
  const { data: beverages } = await supabase
    .from('beverages')
    .select('*')
    .order('name')

  // Lade alle eigenen Konsumeinträge
  const { data: consumptions } = await supabase
    .from('consumptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-md mx-auto">
      <CamperBeverageDashboard 
        userId={user.id} 
        beverages={beverages || []} 
        initialConsumptions={consumptions || []} 
      />
    </div>
  )
}
