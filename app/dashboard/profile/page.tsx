import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dein Profil</h1>
          <p className="text-muted-foreground mt-2">
            Bitte vervollständige dein Profil, damit die anderen Camper wissen, wer du bist.
          </p>
        </div>

        <ProfileForm 
          userId={user.id} 
          initialProfile={{
            fullName: profile?.full_name || "",
            phone: profile?.phone || "",
            avatarUrl: profile?.avatar_url || "",
            members: profile?.members || ""
          }} 
        />
      </div>
    </div>
  )
}
