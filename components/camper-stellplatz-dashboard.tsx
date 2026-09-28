"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tent, Users, Car, Home as HomeIcon, Zap, Save, Loader2, AlertTriangle, AlertCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type ProfileData = {
  id: string
  anzahl_personen: number
  anwesenheit_tage: number
  anzahl_zelte: number
  zelt_naechte: number
  anzahl_autos: number
  auto_naechte: number
  anzahl_pavillons: number
  pavillon_naechte: number
  strom_genutzt: boolean
}

export function CamperStellplatzDashboard({
  initialProfile,
  isLocked
}: {
  initialProfile: any
  isLocked: boolean
}) {
  const router = useRouter()
  const supabase = createClient()
  
  const [data, setData] = useState<ProfileData>({
    id: initialProfile.id,
    anzahl_personen: initialProfile.anzahl_personen || 0,
    anwesenheit_tage: initialProfile.anwesenheit_tage || 0,
    anzahl_zelte: initialProfile.anzahl_zelte || 0,
    zelt_naechte: initialProfile.zelt_naechte || 0,
    anzahl_autos: initialProfile.anzahl_autos || 0,
    auto_naechte: initialProfile.auto_naechte || 0,
    anzahl_pavillons: initialProfile.anzahl_pavillons || 0,
    pavillon_naechte: initialProfile.pavillon_naechte || 0,
    strom_genutzt: initialProfile.strom_genutzt || false,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (data.anzahl_personen > 0 && data.anwesenheit_tage <= 0) {
      newErrors.personen = "Wenn Personen anwesend sind, müssen die Nächte > 0 sein."
    }
    if (data.anwesenheit_tage > 0 && data.anzahl_personen <= 0) {
      newErrors.personen = "Wenn Nächte angegeben sind, muss die Anzahl Personen > 0 sein."
    }

    if (data.anzahl_zelte > 0 && data.zelt_naechte <= 0) {
      newErrors.zelte = "Wenn Zelte angegeben sind, müssen die Nächte > 0 sein."
    }
    if (data.zelt_naechte > 0 && data.anzahl_zelte <= 0) {
      newErrors.zelte = "Wenn Nächte angegeben sind, muss die Anzahl Zelte > 0 sein."
    }

    if (data.anzahl_autos > 0 && data.auto_naechte <= 0) {
      newErrors.autos = "Wenn Autos angegeben sind, müssen die Nächte > 0 sein."
    }
    if (data.auto_naechte > 0 && data.anzahl_autos <= 0) {
      newErrors.autos = "Wenn Nächte angegeben sind, muss die Anzahl Autos > 0 sein."
    }

    if (data.anzahl_pavillons > 0 && data.pavillon_naechte <= 0) {
      newErrors.pavillons = "Wenn Pavillons angegeben sind, müssen die Nächte > 0 sein."
    }
    if (data.pavillon_naechte > 0 && data.anzahl_pavillons <= 0) {
      newErrors.pavillons = "Wenn Nächte angegeben sind, muss die Anzahl Pavillons > 0 sein."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof ProfileData, value: number | boolean) => {
    if (isLocked) return
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (isLocked) return
    if (!validate()) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          anzahl_personen: data.anzahl_personen,
          anwesenheit_tage: data.anwesenheit_tage,
          anzahl_zelte: data.anzahl_zelte,
          zelt_naechte: data.zelt_naechte,
          anzahl_autos: data.anzahl_autos,
          auto_naechte: data.auto_naechte,
          anzahl_pavillons: data.anzahl_pavillons,
          pavillon_naechte: data.pavillon_naechte,
          strom_genutzt: data.strom_genutzt
        })
        .eq('id', data.id)

      if (error) throw error

      toast.success("Erfolgreich gespeichert", {
        description: "Deine Stellplatz-Daten wurden aktualisiert.",
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

  const FieldRow = ({ 
    title, icon: Icon, amountKey, nightsKey, errorKey 
  }: { 
    title: string, icon: any, amountKey: keyof ProfileData, nightsKey: keyof ProfileData, errorKey: string 
  }) => (
    <div className="flex flex-col gap-2 p-4 border rounded-xl bg-card">
      <div className="flex items-center gap-2 font-semibold text-lg mb-2">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Anzahl</Label>
          <Input 
            type="number" 
            min="0"
            disabled={isLocked}
            value={data[amountKey] as number}
            onChange={e => handleChange(amountKey, parseInt(e.target.value) || 0)}
            className={errors[errorKey] ? "border-destructive focus-visible:ring-destructive" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label>Nächte</Label>
          <Input 
            type="number" 
            min="0"
            disabled={isLocked}
            value={data[nightsKey] as number}
            onChange={e => handleChange(nightsKey, parseInt(e.target.value) || 0)}
            className={errors[errorKey] ? "border-destructive focus-visible:ring-destructive" : ""}
          />
        </div>
      </div>
      {errors[errorKey] && (
        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {errors[errorKey]}
        </p>
      )}
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mein Stellplatz</h1>
        <p className="text-muted-foreground mt-2">
          Trage hier die Daten für deinen Haushalt ein.
        </p>
      </div>

      {isLocked && (
        <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Abrechnung abgeschlossen</AlertTitle>
          <AlertDescription>
            Die Abrechnung wurde vom Admin freigegeben. Änderungen sind nicht mehr möglich.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Haushaltsdaten</CardTitle>
          <CardDescription>
            Bitte gib an, wie viele Personen, Zelte, Autos und Pavillons ihr für wie viele Nächte hattet.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <FieldRow title="Personen" icon={Users} amountKey="anzahl_personen" nightsKey="anwesenheit_tage" errorKey="personen" />
          <FieldRow title="Zelte" icon={Tent} amountKey="anzahl_zelte" nightsKey="zelt_naechte" errorKey="zelte" />
          <FieldRow title="Autos" icon={Car} amountKey="anzahl_autos" nightsKey="auto_naechte" errorKey="autos" />
          <FieldRow title="Pavillons" icon={HomeIcon} amountKey="anzahl_pavillons" nightsKey="pavillon_naechte" errorKey="pavillons" />

          <div className="flex flex-row items-center justify-between p-4 border rounded-xl bg-primary/5">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2 font-semibold">
                <Zap className="w-5 h-5 text-primary" />
                Stromanschluss
              </Label>
              <p className="text-sm text-muted-foreground">
                Hattet ihr eigenen Strom am Platz?
              </p>
            </div>
            <Switch 
              checked={data.strom_genutzt} 
              disabled={isLocked}
              onCheckedChange={(checked) => handleChange("strom_genutzt", checked)} 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isLocked} 
            className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
