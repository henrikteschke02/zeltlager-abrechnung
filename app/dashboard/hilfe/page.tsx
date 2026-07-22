import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { HilfeFeedback } from "@/components/hilfe-feedback"

export const metadata = {
  title: "Hilfe & Feedback | Zeltlager Manager",
  description: "Häufige Fragen und Kontakt zum Orga-Team",
}

export default async function HilfePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return redirect("/login")

  // Profil-Check
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_approved")
    .eq("id", user.id)
    .single()

  if (!profile?.full_name) return redirect("/dashboard/profile")

  if (profile?.role !== "admin" && profile?.is_approved === false) {
    const { Warteraum } = await import("@/components/warteraum")
    return <Warteraum />
  }

  return (
    <div className="container mx-auto px-4 max-w-3xl py-8">
      <HilfeFeedback userId={user.id} />
    </div>
  )
}
