import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { CamperGrillDashboard } from "@/components/camper-grill-dashboard"

export const metadata = {
  title: "Grillfleisch | Zeltlager Manager",
  description: "Dein persönlicher Grill-Deckel – buche Fleisch direkt am Grill.",
}

export default async function GrillfleischPage() {
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
  const { data: grillItems }  = await supabase.from("grill_items").select("*").order("name")
  const { data: grillOrders } = await supabase.from("grill_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false })

  return (
    <div className="max-w-md mx-auto">
      <CamperGrillDashboard
        userId={user.id}
        items={grillItems || []}
        initialOrders={grillOrders || []}
      />
    </div>
  )
}
