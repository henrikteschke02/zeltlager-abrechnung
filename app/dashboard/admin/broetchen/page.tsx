import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AdminBroetchenDashboard } from "@/components/admin-broetchen-dashboard"

export const metadata = {
  title: "Admin | Brötchen | Zeltlager Manager",
  description: "Brötchen Verwaltung fÃ¼r Admins",
}

export default async function AdminBroetchenPage() {
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

  return <AdminBroetchenDashboard />
}
