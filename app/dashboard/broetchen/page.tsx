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

  // Aktive Session holen oder erstellen
  let { data: session } = await supabase
    .from("broetchen_sessions")
    .select("id")
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (!session) {
    const { data: newSession, error } = await supabase
      .from("broetchen_sessions")
      .insert([{ status: "active" }])
      .select("id")
      .limit(1)
      .maybeSingle()
    
    if (error) {
      const { data: retry } = await supabase.from("broetchen_sessions").select("id").eq("status", "active").limit(1).maybeSingle()
      session = retry
    } else {
      session = newSession
    }
  }

  const { data: broetchenOrders } = await supabase
    .from("broetchen_orders")
    .select("*")
    .eq("session_id", session?.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <CamperBroetchenDashboard
        userId={user.id}
        sessionId={session?.id as string}
        items={broetchenItems || []}
        initialOrders={broetchenOrders || []}
      />
    </div>
  )
}
