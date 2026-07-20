import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AdminGrillDashboard } from "@/components/admin-grill-dashboard"

export const metadata = {
  title: "Admin | Grillfleisch | Zeltlager Manager",
  description: "Grillfleisch Verwaltung für Admins",
}

export default async function AdminGrillfleischPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return redirect("/dashboard")
  }

  return <AdminGrillDashboard />
}
