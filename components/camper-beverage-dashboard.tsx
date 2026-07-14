"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Plus, Beer, Trophy, Loader2, Undo2, BarChart3, Medal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Beverage = {
  id: string
  name: string
  price: number
  emoji: string | null
  bundle_size: number | null
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
  const getBeverageIcon = (name: string) => {
    const n = name.toLowerCase()
    
    // Spezielle Biere & Mixgetränke
    if (n.includes("schöfferhofer") || n.includes("grapefruit")) return "🍊🍺"
    if ((n.includes("radler") || n.includes("alster")) && (n.includes("0,0") || n.includes("alkoholfrei"))) return "🍋🧊🍺"
    if (n.includes("radler") || n.includes("alster") || n.includes("naturradler")) return "🍋🍺"
    if ((n.includes("bier") || n.includes("pils") || n.includes("bitburger") || n.includes("weizen")) && (n.includes("0,0") || n.includes("alkoholfrei"))) return "🧊🍺" // Alkoholfrei
    
    // Klassisches Bier
    if (n.includes("bier") || n.includes("pils") || n.includes("weizen") || n.includes("export") || n.includes("helles") || n.includes("bitburger") || n.includes("veltins")) return "🍺"
    
    // Wasser
    if (n.includes("wasser") || n.includes("water") || n.includes("sprudel")) return "💧"
    
    // Spezielle Softdrinks
    if (n.includes("fanta")) return "🍊🥤"
    if (n.includes("sprite") || n.includes("7up")) return "🍋🥤"
    if (n.includes("cola") || n.includes("spezi") || n.includes("mezzo")) return "🥤"
    if (n.includes("mate")) return "🧉"
    
    // Kaffee
    if (n.includes("kaffee") || n.includes("coffee") || n.includes("espresso") || n.includes("cappuccino")) return "☕"
    
    // Wein / Sekt
    if (n.includes("wein") || n.includes("wine") || n.includes("sekt") || n.includes("schorle")) return "🍷"
    
    // Saft
    if (n.includes("saft") || n.includes("apfel") || n.includes("orange")) return "🧃"
    
    // Milch / Kakao
    if (n.includes("milch") || n.includes("kakao")) return "🥛"
    
    // Harter Alkohol / Cocktails
    if (n.includes("cocktail") || n.includes("gin") || n.includes("vodka") || n.includes("mische") || n.includes("schnaps")) return "🍸"
    
    // Default
    return "🥤"
  }

  const [consumptions, setConsumptions] = useState<Consumption[]>(initialConsumptions)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())
  
  // Booking Modal State
  const [selectedBev, setSelectedBev] = useState<Beverage | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  
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

  // Echtzeit-Updates für eigene Konsumeinträge abonnieren
  useEffect(() => {
    const channel = supabase.channel('realtime_dashboard_consumptions')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'consumptions',
        filter: `user_id=eq.${userId}` 
      }, (payload) => {
        setConsumptions(prev => {
          // Vermeide Duplikate, falls Optimistic Update schon drin ist
          if (prev.some(c => c.id === payload.new.id)) return prev
          return [payload.new as Consumption, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        })
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'consumptions' 
      }, (payload) => {
        // Bei DELETE haben wir in payload.old nur die id
        setConsumptions(prev => prev.filter(c => c.id !== payload.old.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

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

  // Meine persönlichen Statistiken (aggregiert)
  const personalStats = useMemo(() => {
    const stats: Record<string, { count: number; totalCost: number; name: string }> = {}
    consumptions.forEach(c => {
      const bev = beverages.find(b => b.id === c.beverage_id)
      if (!bev) return
      if (!stats[bev.id]) {
        stats[bev.id] = { count: 0, totalCost: 0, name: bev.name }
      }
      stats[bev.id].count += c.quantity
      stats[bev.id].totalCost += c.quantity * Number(bev.price)
    })
    return Object.values(stats).sort((a, b) => b.count - a.count)
  }, [consumptions, beverages])

  const handleOpenModal = (bev: Beverage) => {
    setSelectedBev(bev)
    setSelectedQuantity(1)
  }

  const executeBooking = async (beverage: Beverage, qty: number) => {
    if (loadingId) return
    setLoadingId(beverage.id)
    setSelectedBev(null) // Close modal immediately

    // Optimistic UI Update (temporäre ID für sofortiges Feedback)
    const tempConsumption: Consumption = {
      id: crypto.randomUUID(),
      user_id: userId,
      beverage_id: beverage.id,
      quantity: qty,
      created_at: new Date().toISOString()
    }
    
    setConsumptions([tempConsumption, ...consumptions])

    const { data, error } = await supabase
      .from('consumptions')
      .insert([{ user_id: userId, beverage_id: beverage.id, quantity: qty }])
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
      
      {/* Sticky Header / Stats Card */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 shadow-sm mb-4">
        <Card className="bg-primary text-primary-foreground shadow-md overflow-hidden relative border-none">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Beer className="w-24 h-24" />
          </div>
          <CardHeader className="relative z-10 pb-2">
            <div className="flex justify-between items-end">
              <div>
                <CardTitle className="text-xs font-medium opacity-90 uppercase tracking-wider">Mein Deckel</CardTitle>
                <div className="text-4xl font-black tracking-tighter leading-none mt-1">
                  {totalDebt.toFixed(2)} €
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium opacity-90 uppercase tracking-wider">Tages-Pegel</div>
                <div className="text-2xl font-black">{todaysDrinksCount}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pb-4 pt-0">
            <Progress value={pegelPercentage} className="h-2 bg-primary-foreground/20 [&>div]:bg-primary-foreground mb-1" />
            <p className="text-[10px] opacity-75">
              {todaysDrinksCount === 0 ? "Der Elch ist noch durstig!" : todaysDrinksCount >= 10 ? "Hydration Hero! 🏆" : "Der Pegel-Elch füllt sich..."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storno Bereich direkt unter dem Deckel */}
      {stornoEintraege.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold tracking-tight mb-2 px-1 text-muted-foreground flex items-center">
            <Undo2 className="w-4 h-4 mr-2" /> Kürzliche Buchungen (Storno)
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
            {stornoEintraege.map(c => {
              const bev = beverages.find(b => b.id === c.beverage_id)
              const timeLeft = Math.max(0, Math.floor((3 * 60 * 1000 - (now.getTime() - new Date(c.created_at).getTime())) / 1000))
              const mins = Math.floor(timeLeft / 60)
              const secs = timeLeft % 60
              return (
                <Card key={c.id} className="bg-destructive/10 border-destructive/20 shadow-sm flex-shrink-0 w-[240px] snap-start">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-sm truncate">{c.quantity}x {bev?.name || "Unbekannt"}</p>
                        <p className="text-xs text-muted-foreground font-medium">{mins}:{secs.toString().padStart(2, '0')} min stornierbar</p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" className="w-full h-7 text-xs" onClick={() => handleStorno(c.id)}>
                      Rückgängig
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Navigation zu Leaderboard & Statistik */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/dashboard/leaderboard" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none hover:opacity-90 transition-opacity">
            <CardContent className="p-3 flex items-center justify-center gap-3">
              <Medal className="w-6 h-6 flex-shrink-0" />
              <div className="text-sm font-bold leading-tight">Leaderboard</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/leaderboard?tab=stats" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none hover:opacity-90 transition-opacity">
            <CardContent className="p-3 flex items-center justify-center gap-3">
              <BarChart3 className="w-6 h-6 flex-shrink-0" />
              <div className="text-sm font-bold leading-tight">Statistik</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Beverage Grid */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4 px-1">Was trinkst du?</h2>
        <div className="grid grid-cols-2 gap-4">
          {beverages.map(bev => (
            <button
              key={bev.id}
              onClick={() => handleOpenModal(bev)}
              disabled={loadingId === bev.id}
              className="relative overflow-hidden group flex flex-col items-center justify-center p-6 text-center bg-card text-card-foreground rounded-2xl border-2 border-border shadow-sm hover:border-primary/50 hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring select-none"
            >
              {loadingId === bev.id ? (
                <Loader2 className="w-12 h-12 mb-3 text-primary animate-spin" />
              ) : (
              <div className="text-5xl mb-3 drop-shadow-sm group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                {getBeverageIcon(bev.name)}
              </div>
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

      {/* Meine Statistiken (Persönliche Übersicht) */}
      <div className="mt-8">
        <h2 className="text-lg font-bold tracking-tight mb-4 px-1">Meine Statistiken</h2>
        <Card>
          <CardContent className="p-0">
            {personalStats.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Noch keine Getränke gebucht.
              </div>
            ) : (
              <div className="divide-y">
                {personalStats.map((stat, i) => (
                  <div key={i} className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary font-bold w-8 h-8 rounded-full flex items-center justify-center">
                        {stat.count}x
                      </div>
                      <span className="font-medium">{stat.name}</span>
                    </div>
                    <span className="font-semibold text-muted-foreground">
                      {stat.totalCost.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Modal */}
      <Dialog open={!!selectedBev} onOpenChange={(open) => !open && setSelectedBev(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <span className="text-3xl drop-shadow-sm">{selectedBev && getBeverageIcon(selectedBev.name)}</span>
              {selectedBev?.name} buchen
            </DialogTitle>
            <DialogDescription>
              Wähle die gewünschte Menge für deine Buchung.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="flex items-center justify-center gap-6">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-14 w-14 rounded-full border-2"
                onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                disabled={selectedQuantity <= 1}
              >
                <span className="text-3xl font-light">-</span>
              </Button>
              
              <div className="w-20 text-center">
                <span className="text-5xl font-black">{selectedQuantity}</span>
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="h-14 w-14 rounded-full border-2"
                onClick={() => setSelectedQuantity(selectedQuantity + 1)}
              >
                <Plus className="h-8 w-8" />
              </Button>
            </div>
            
            <div className="text-center font-bold text-xl text-primary">
              Gesamt: {(selectedQuantity * Number(selectedBev?.price || 0)).toFixed(2)} €
            </div>

            {selectedBev?.bundle_size && (
              <div className="pt-4 border-t border-border">
                <Button 
                  variant="secondary" 
                  className="w-full h-14 text-lg border-2 border-primary/20 hover:border-primary/50"
                  onClick={() => selectedBev && executeBooking(selectedBev, selectedBev.bundle_size!)}
                >
                  🍺 Ganze Kiste ({selectedBev.bundle_size}x) buchen
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button 
              className="w-full h-14 text-lg font-bold" 
              onClick={() => selectedBev && executeBooking(selectedBev, selectedQuantity)}
            >
              Kostenpflichtig buchen
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setSelectedBev(null)}>
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
