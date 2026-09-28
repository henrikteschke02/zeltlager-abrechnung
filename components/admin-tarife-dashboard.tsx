"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, Info } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { AdminNav } from "@/components/admin-nav"

type GlobalSettings = {
  id: number
  preis_person_nacht: number
  preis_zelt_nacht: number
  preis_auto_nacht: number
  preis_pavillon_nacht: number
  preis_strom_person_tag: number
  kuehlwagen_gesamtkosten: number
  abrechnung_freigegeben: boolean
}

export function AdminTarifeDashboard({
  initialSettings,
}: {
  initialSettings: GlobalSettings
}) {
  const router = useRouter()
  const supabase = createClient()
  const [settings, setSettings] = useState<GlobalSettings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const { error } = await supabase
        .from("global_settings")
        .upsert(settings)

      if (error) throw error
      
      toast.success("Tarife erfolgreich gespeichert", {
        description: "Die globalen Einstellungen wurden aktualisiert.",
      })
      router.refresh()
    } catch (err: any) {
      toast.error("Fehler beim Speichern", {
        description: err.message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof GlobalSettings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mx-auto max-w-4xl">
      <AdminNav />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platzkosten & Tarife</h1>
        <p className="text-muted-foreground mt-2">
          Verwalte hier die Basispreise und globale Einstellungen für die Endabrechnung.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basispreise pro Nacht</CardTitle>
            <CardDescription>Diese Tarife gelten pro anwesender Nacht im Zeltlager.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preis_person_nacht">Person (€ / Nacht)</Label>
              <Input 
                id="preis_person_nacht" 
                type="number" 
                step="0.01" 
                value={settings.preis_person_nacht} 
                onChange={(e) => handleChange("preis_person_nacht", parseFloat(e.target.value) || 0)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preis_zelt_nacht">Zelt (€ / Nacht)</Label>
              <Input 
                id="preis_zelt_nacht" 
                type="number" 
                step="0.01" 
                value={settings.preis_zelt_nacht} 
                onChange={(e) => handleChange("preis_zelt_nacht", parseFloat(e.target.value) || 0)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preis_auto_nacht">Auto (€ / Nacht)</Label>
              <Input 
                id="preis_auto_nacht" 
                type="number" 
                step="0.01" 
                value={settings.preis_auto_nacht} 
                onChange={(e) => handleChange("preis_auto_nacht", parseFloat(e.target.value) || 0)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preis_pavillon_nacht">Pavillon (€ / Nacht)</Label>
              <Input 
                id="preis_pavillon_nacht" 
                type="number" 
                step="0.01" 
                value={settings.preis_pavillon_nacht} 
                onChange={(e) => handleChange("preis_pavillon_nacht", parseFloat(e.target.value) || 0)} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zusatzkosten & Umlagen</CardTitle>
            <CardDescription>Pauschalen, die auf die Haushalte umgelegt werden.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preis_strom_person_tag">Strom (€ pro Person / Tag)</Label>
              <Input 
                id="preis_strom_person_tag" 
                type="number" 
                step="0.01" 
                value={settings.preis_strom_person_tag} 
                onChange={(e) => handleChange("preis_strom_person_tag", parseFloat(e.target.value) || 0)} 
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Info size={14} /> Gilt nur, wenn der Haushalt Strom nutzt.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kuehlwagen_gesamtkosten">Kühlwagen Gesamtkosten (€)</Label>
              <Input 
                id="kuehlwagen_gesamtkosten" 
                type="number" 
                step="0.01" 
                value={settings.kuehlwagen_gesamtkosten} 
                onChange={(e) => handleChange("kuehlwagen_gesamtkosten", parseFloat(e.target.value) || 0)} 
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Info size={14} /> Wird als Kopfpauschale aufgeteilt.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Abrechnung & Status</CardTitle>
            <CardDescription>Globale Steuerung für das gesamte Zeltlager.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-background rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-base">Abrechnung Freigeben</Label>
                <p className="text-sm text-muted-foreground">
                  Wenn aktiv, sehen Camper ihre finale Platz- und Umlagenrechnung in ihrem Dashboard.
                </p>
              </div>
              <Switch 
                checked={settings.abrechnung_freigegeben} 
                onCheckedChange={(checked) => handleChange("abrechnung_freigegeben", checked)} 
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichere...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Einstellungen Speichern
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
