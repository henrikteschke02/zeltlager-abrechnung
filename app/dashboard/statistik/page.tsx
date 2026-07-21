import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { StatistikDashboard, StatistikRow } from "@/components/statistik-dashboard"

export const metadata = {
  title: "Statistik & Abrechnung | Zeltlager Manager",
  description: "Kassenabrechnung und Gesamtsummen aller Camper.",
}

export default async function StatistikPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_approved')
    .eq('id', user.id)
    .single()

  if (!profile?.full_name) {
    return redirect("/dashboard/profile")
  }

  if (profile?.role !== 'admin' && profile?.is_approved === false) {
    const { Warteraum } = await import("@/components/warteraum")
    return <Warteraum />
  }

  // Daten abrufen
  const { data: profiles } = await supabase.from('profiles').select('id, full_name').eq('is_approved', true)
  const { data: beverages } = await supabase.from('beverages').select('id, price')
  const { data: consumptions } = await supabase.from('consumptions').select('user_id, beverage_id, quantity')
  const { data: grillItems } = await supabase.from('grill_items').select('id, preis')
  const { data: grillOrders } = await supabase.from('grill_orders').select('user_id, item_id, quantity')

  // Maps für schnelle Preis-Lookups
  const beveragePrices = new Map((beverages || []).map(b => [b.id, b.price || 0]))
  const grillPrices = new Map((grillItems || []).map(g => [g.id, g.preis || 0]))

  // Maps für Summen pro User
  const getraenkeSums = new Map<string, number>()
  const grillSums = new Map<string, number>()

  if (consumptions) {
    consumptions.forEach(c => {
      const price = beveragePrices.get(c.beverage_id) || 0
      const currentSum = getraenkeSums.get(c.user_id) || 0
      getraenkeSums.set(c.user_id, currentSum + (price * c.quantity))
    })
  }

  if (grillOrders) {
    grillOrders.forEach(o => {
      const price = grillPrices.get(o.item_id) || 0
      const currentSum = grillSums.get(o.user_id) || 0
      grillSums.set(o.user_id, currentSum + (price * o.quantity))
    })
  }

  // Row-Daten für die UI aggregieren
  const rows: StatistikRow[] = (profiles || []).map(p => {
    const getraenkeSum = getraenkeSums.get(p.id) || 0
    const grillSum = grillSums.get(p.id) || 0
    const broetchenSum = 0 // Platzhalter, da Tabelle noch fehlt

    return {
      userId: p.id,
      fullName: p.full_name || "Unbekannt",
      getraenkeSum,
      grillSum,
      broetchenSum,
      totalSum: getraenkeSum + grillSum + broetchenSum
    }
  }).sort((a, b) => a.fullName.localeCompare(b.fullName)) // Alphabetisch sortieren

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistik & Abrechnung</h1>
          <p className="text-muted-foreground mt-2">
            Gesamtausgaben aller Camper für das Kassenwart-Dashboard.
          </p>
        </div>

        <StatistikDashboard data={rows} />
      </div>
    </div>
  )
}
