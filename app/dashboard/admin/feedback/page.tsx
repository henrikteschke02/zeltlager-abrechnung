import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AdminFeedbackDashboard } from "@/components/admin-feedback-dashboard"

export default async function AdminFeedbackPage() {
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

  const { data: feedbackList } = await supabase
    .from('feedback')
    .select(`
      id,
      message,
      created_at,
      profiles (
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto p-4 md:p-8">
      <AdminFeedbackDashboard 
        initialFeedback={(feedbackList as any) || []} 
      />
    </div>
  )
}
