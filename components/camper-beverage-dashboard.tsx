"use client"

import { useState, useMemo, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Plus, Beer, Trophy, Loader2, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Beverage = {
  id: string
  name: string
  price: number
}

type Consumption = {
  id: string
  user_id: string
  beverage_id: string
  quantity: number
  created_at: string
}

export function CamperBeverageDashboard({
  userId,
  beverages,
  initialConsumptions,
}: {
  userId: string
  beverages: Beverage[]
  initialConsumptions: Consumption[]
}) {
  const [consumptions, setConsumptions] = useState<Consumption[]>(initialConsumptions)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())
  const supabase = createClient()

  // Zeltlager-Tag Berechnung (Reset um 6:00 Uhr morgens)
  const startOfCampDay = useMemo(() => {
    const d = new Date()
    if (d.getHours() < 6) {
      d.setDate(d.getDate() - 1)
    }
    d.setHours(6, 0, 0, 0)
    return d
  }, [])

  // Timer für Storno-Buttons (Aktualisiert die Zeit jede Sekunde)
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Berechnungen
  const todaysConsumptions = consumptions.filter(c => new Date(c.created_at) >= startOfCampDay)
  const todaysDrinksCount = todaysConsumptions.reduce((sum, c) => sum + c.quantity, 0)
  
  const totalDebt = consumptions.reduce((total, c) => {
    const bev = beverages.find(b => b.id === c.beverage_id)
    return total + (bev ? Number(bev.price) * c.quantity : 0)
  }, 0)

  // Max Pegel (für die Progress Bar, z.B. 15 Getränke als voller Balken)
  const maxPegel = 15
  const pegelPercentage = Math.min((todaysDrinksCount / maxPegel) * 100, 100)

  const handleDrink = async (beverage: Beverage) => {
    if (loadingId) return
    setLoadingId(beverage.id)

    // Optimistic UI Update (temporäre ID für sofortiges Feedback)
    const tempConsumption: Consumption = {
      id: crypto.randomUUID(),
      user_id: userId,
      beverage_id: beverage.id,
      quantity: 1,
      created_at: new Date().toISOString()
    }
    
    setConsumptions([tempConsumption, ...consumptions])

    const { data, error } = await supabase
      .from('consumptions')
      .insert([{ user_id: userId, beverage_id: beverage.id, quantity: 1 }])
      .select()
      .single()

    if (error) {
      alert("Fehler beim Buchen! Bitte Seite neu laden.")
      // Rollback
      setConsumptions(consumptions.filter(c => c.id !== tempConsumption.id))
    } else if (data) {
      // Ersetze Temp-ID durch echte DB-ID
      setConsumptions(prev => prev.map(c => c.id === tempConsumption.id ? (data as Consumption) : c))
    }
    
    setLoadingId(null)
  }

  const handleStorno = async (id: string) => {
    // Optimistic Delete
    const original = consumptions.find(c => c.id === id)
    if (!original) return
    
    setConsumptions(consumptions.filter(c => c.id !== id))

    const { error } = await supabase.from('consumptions').delete().eq('id', id)
    
    if (error) {
      alert("Fehler beim Stornieren: " + error.message)
      // Rollback
      setConsumptions(prev => [original, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    }
  }

  // Ermittle stornierbare Einträge (< 3 Minuten alt)
  const stornoEintraege = consumptions.filter(c => now.getTime() - new Date(c.created_at).getTime() <= 3 * 60 * 1000)

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header / Stats Card */}
      <Card className="bg-primary text-primary-foreground shadow-lg overflow-hidden relative border-none">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Beer className="w-32 h-32" />
        </div>
        <CardHeader className="relative z-10 pb-2">
          <CardTitle className="text-sm font-medium opacity-90 uppercase tracking-wider">Mein Deckel</CardTitle>
          <div className="text-5xl font-black tracking-tighter">
            {totalDebt.toFixed(2)} €
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Tages-Pegel
              </span>
              <span>{todaysDrinksCount} Getränke</span>
            </div>
            <Progress value={pegelPercentage} className="h-3 bg-primary-foreground/20 [&>div]:bg-primary-foreground" />
            <p className="text-xs opacity-75">
              {todaysDrinksCount === 0 
                ? "Der Elch ist noch durstig!" 
                : todaysDrinksCount >= 10 
                  ? "Hydration Hero! 🏆" 
                  : "Der Pegel-Elch füllt sich..."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Beverage Grid */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4 px-1">Was trinkst du?</h2>
        <div className="grid grid-cols-2 gap-4">
          {beverages.map(bev => (
            <button
              key={bev.id}
              onClick={() => handleDrink(bev)}
              disabled={loadingId === bev.id}
              className="relative overflow-hidden group flex flex-col items-center justify-center p-6 text-center bg-card text-card-foreground rounded-2xl border-2 border-border shadow-sm hover:border-primary/50 hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring select-none"
            >
              {loadingId === bev.id ? (
                <Loader2 className="w-12 h-12 mb-3 text-primary animate-spin" />
              ) : (
                <Plus className="w-12 h-12 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
              <h3 className="font-bold text-lg leading-none mb-1">{bev.name}</h3>
              <p className="text-sm font-semibold text-primary">{Number(bev.price).toFixed(2)} €</p>
            </button>
          ))}
          {beverages.length === 0 && (
            <div className="col-span-2 text-center p-8 border-2 border-dashed rounded-2xl text-muted-foreground">
              Keine Getränke im System. Der Admin muss den Kühlschrank auffüllen!
            </div>
          )}
        </div>
      </div>

      {/* Storno Bereich */}
      {stornoEintraege.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold tracking-tight mb-4 px-1 text-muted-foreground">Kürzliche Buchungen (Storno)</h2>
          <div className="space-y-2">
            {stornoEintraege.map(c => {
              const bev = beverages.find(b => b.id === c.beverage_id)
              const timeLeft = Math.max(0, Math.floor((3 * 60 * 1000 - (now.getTime() - new Date(c.created_at).getTime())) / 1000))
              const mins = Math.floor(timeLeft / 60)
              const secs = timeLeft % 60
              return (
                <Card key={c.id} className="bg-destructive/10 border-none">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{bev?.name || "Unbekannt"} gebucht</p>
                      <p className="text-xs text-muted-foreground">Noch {mins}:{secs.toString().padStart(2, '0')} min stornierbar</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleStorno(c.id)}>
                      <Undo2 className="h-4 w-4 mr-2" /> Storno
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
