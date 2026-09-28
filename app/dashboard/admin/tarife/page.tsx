import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AdminTarifeDashboard } from "@/components/admin-tarife-dashboard"

export const metadata = {
  title: "Admin | Tarife | Zeltlager Manager",
  description: "Tarife und Einstellungen für Admins verwalten",
}

export default async function AdminTarifePage() {
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

  // Fetch settings, initialize with default values if not exists
  let { data: settings } = await supabase
    .from('global_settings')
    .select('*')
    .eq('id', 1)
    .single()
    
  if (!settings) {
    settings = {
      id: 1,
      preis_person_nacht: 0,
      preis_zelt_nacht: 0,
      preis_auto_nacht: 0,
      preis_pavillon_nacht: 0,
      preis_strom_person_tag: 0.60,
      kuehlwagen_gesamtkosten: 0,
      abrechnung_freigegeben: false
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <AdminTarifeDashboard initialSettings={settings} />
    </div>
  )
}
