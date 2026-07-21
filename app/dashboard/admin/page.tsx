import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
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


  return (
    <div className="container mx-auto p-4 md:p-8">
      <AdminDashboard 
        initialBeverages={beverages || []} 
      />
    </div>
  )
}
