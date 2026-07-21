import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { CamperBroetchenDashboard } from "@/components/camper-broetchen-dashboard"

export const metadata = {
  title: "Brötchen | Zeltlager Manager",
  description: "Dein persönlicher Brötchen-Deckel – buche Brötchen für das Frühstück.",
}

export default async function BroetchenPage() {
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

  // Daten laden
  const { data: broetchenItems }  = await supabase.from("broetchen_items").select("*").order("name")
  const { data: broetchenOrders } = await supabase.from("broetchen_buchungen").select("*").eq("user_id", user.id).order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <CamperBroetchenDashboard
        userId={user.id}
        items={broetchenItems || []}
        initialOrders={broetchenOrders || []}
      />
    </div>
  )
}
