import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AdminCamperDashboard } from "@/components/admin-camper-dashboard"

export const metadata = {
  title: "Admin | Camper | Zeltlager Manager",
  description: "Camper und Profilverwaltung für Admins",
}

export default async function AdminCamperPage() {
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

  const { data: beverages } = await supabase
    .from('beverages')
    .select('*')
    .order('name')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('email')

  return (
    <div className="container mx-auto p-4 md:p-8">
      <AdminCamperDashboard 
        initialBeverages={beverages || []} 
        initialProfiles={profiles || []} 
      />
    </div>
  )
}
