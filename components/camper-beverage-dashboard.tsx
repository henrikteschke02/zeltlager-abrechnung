"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Info, Plus, Minus, Check, ChevronDown, Beer, Loader2, Undo2, BarChart3, Medal } from "lucide-react"
import { DRINK_ICONS, Cola } from "@/components/icons/DrinkIcons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  const getBeverageIcon = (name: string, className?: string) => {
    const Icon = DRINK_ICONS[name] || Cola;
    return <Icon className={className || "w-14 h-14"} />;
  }

  // ── Photo mapping: keyword → public image path ────────────────────────────
  // More-specific patterns first so "Bitburger Radler" doesn't match "pils" first.
  const getBeverageImage = (name: string): string | null => {
    const n = name.toLowerCase()
    if (n.includes("schöfferhofer") || n.includes("schofferhofer") || n.includes("grapefruit")) return "/images/drinks/schofferhofer.png"
    if (n.includes("krombacher") && n.includes("radler")) return "/images/drinks/krombacher_radler.png"
    if (n.includes("bitburger") && n.includes("radler"))  return "/images/drinks/bitburger_radler.png"
    if (n.includes("radler"))                             return "/images/drinks/bitburger_radler.png"
    if (n.includes("bitburger") || n.includes("0,0") || n.includes("0.0")) return "/images/drinks/pils.png"
    if (n.includes("veltins"))                            return "/images/drinks/veltins.png"
    if (n.includes("fassbrause"))                         return "/images/drinks/fassbrause.png"
    if (n.includes("wasser") || n.includes("emsland"))   return "/images/drinks/wasser.png"
    if (n.includes("cola"))                               return "/images/drinks/cola.png"
    if (n.includes("fanta"))                              return "/images/drinks/fanta.png"
    if (n.includes("sprite"))                             return "/images/drinks/sprite.png"
    if (n.includes("mate") || n.includes("mio"))         return "/images/drinks/miomate.png"
    return null
  }

  const [consumptions, setConsumptions] = useState<Consumption[]>(initialConsumptions)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())
  
  // Booking Modal State
  const [selectedBev, setSelectedBev] = useState<Beverage | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  
  // Toggle State für Deckel (Gesamt vs Tagesdeckel)
  const [showDaily, setShowDaily] = useState(false)
  
  const supabase = createClient()

  // Zeltlager-Tag Berechnung (Reset um 7:00 Uhr morgens)
  const startOfCampDay = useMemo(() => {
    const d = new Date()
    if (d.getHours() < 7) {
      d.setDate(d.getDate() - 1)
    }
    d.setHours(7, 0, 0, 0)
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
  
  const todaysDebt = todaysConsumptions.reduce((total, c) => {
    const bev = beverages.find(b => b.id === c.beverage_id)
    return total + (bev ? Number(bev.price) * c.quantity : 0)
  }, 0)
  
  const totalDebt = consumptions.reduce((total, c) => {
    const bev = beverages.find(b => b.id === c.beverage_id)
    return total + (bev ? Number(bev.price) * c.quantity : 0)
  }, 0)

  // Elch Gamification Logik
  const getPointsForBeverage = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes("alkoholfrei") || n.includes("0,0") || n.includes("wasser") || n.includes("cola") || n.includes("fanta") || n.includes("sprite") || n.includes("brause") || n.includes("saft")) return -1.0
    if (n.includes("radler") || n.includes("alster") || n.includes("schöfferhofer")) return 0.5
    if (n.includes("schnaps") || n.includes("shot") || n.includes("vodka") || n.includes("gin") || n.includes("cocktail")) return 2.0
    return 1.0 // Normales Bier
  }

  const elchScore = useMemo(() => {
    const score = todaysConsumptions.reduce((sum, c) => {
      const bev = beverages.find(b => b.id === c.beverage_id)
      return sum + (bev ? getPointsForBeverage(bev.name) * c.quantity : 0)
    }, 0)
    return Math.max(0, score) // Elch-Level fällt nicht unter 0
  }, [todaysConsumptions, beverages])

  const elchLevels = [
    { min: 0, emoji: "🦌", text: "Nüchterner Elch" },
    { min: 1, emoji: "🙂", text: "Entspannter Elch" },
    { min: 2, emoji: "😌", text: "Lockerer Elch" },
    { min: 3, emoji: "😉", text: "Beschwipster Elch" },
    { min: 4, emoji: "😋", text: "Angedudelter Elch" },
    { min: 5, emoji: "🤪", text: "Spaß-Elch" },
    { min: 6, emoji: "😜", text: "Alberner Elch" },
    { min: 7, emoji: "🥳", text: "Party-Elch" },
    { min: 8, emoji: "🥴", text: "Schwankender Elch" },
    { min: 9, emoji: "🤠", text: "Wilder Elch" },
    { min: 10, emoji: "🍻", text: "Geselliger Elch" },
    { min: 11, emoji: "🎶", text: "Singender Elch" },
    { min: 12, emoji: "🕺", text: "Tanz-Elch" },
    { min: 13, emoji: "🔥", text: "Röhrender Elch" },
    { min: 14, emoji: "🚀", text: "Abgehobener Elch" },
    { min: 15, emoji: "😵‍💫", text: "Verirrter Elch" },
    { min: 16, emoji: "🤤", text: "Lallender Elch" },
    { min: 17, emoji: "🫠", text: "Geschmolzener Elch" },
    { min: 18, emoji: "🛌", text: "Müder Elch" },
    { min: 19, emoji: "💤", text: "Schlafender Elch" },
    { min: 20, emoji: "☠️", text: "Legenden-Elch" },
  ]
  const currentElchLevel = [...elchLevels].reverse().find(l => elchScore >= l.min) || elchLevels[0]


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
      
      {/* Sticky Header / Mein Deckel – Beige Karte mit olivem Text, rounded-3xl, Serif Preis */}
      <div className="sticky top-16 z-40 mb-4">
        <Card 
          className="shadow-2xl shadow-black/30 overflow-hidden relative border-0 rounded-3xl cursor-pointer group select-none transition-all active:scale-[0.98]"
          style={{ backgroundColor: "#E5E4DE", color: "#4c503d" }}
          onClick={() => setShowDaily(!showDaily)}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Beer className="w-24 h-24" />
          </div>
          <CardHeader className="relative z-10 pb-2">
            <div className="flex justify-between items-end">
              <div>
                <CardTitle className="text-[10px] font-sans font-semibold uppercase tracking-widest opacity-60 flex items-center gap-1">
                  {showDaily ? "Tagesdeckel" : "Gesamtdeckel"}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showDaily ? "rotate-180" : ""}`} />
                </CardTitle>
                {/* Serif-Schrift NUR für die große Preiszahl */}
                <div className="text-4xl font-serif font-bold tracking-tight leading-none mt-1 animate-in fade-in slide-in-from-bottom-1 duration-300" key={showDaily ? "daily" : "total"}>
                  {showDaily ? todaysDebt.toFixed(2) : totalDebt.toFixed(2)} €
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-sans font-semibold uppercase tracking-widest opacity-60">
                  {showDaily ? "Heute" : "Gesamt"}
                </div>
                <div className="text-2xl font-serif font-bold animate-in fade-in slide-in-from-bottom-1 duration-300" key={showDaily ? "dailyC" : "totalC"}>
                  {showDaily ? todaysDrinksCount : consumptions.reduce((sum, c) => sum + c.quantity, 0)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pb-4 pt-0">
            <div className="flex items-center justify-between bg-black/5 rounded-2xl p-2.5 mt-2 border border-black/5">
              <div className="flex items-center gap-3">
                <span className="text-3xl filter drop-shadow-sm transition-transform group-hover:scale-110 duration-300">
                  {currentElchLevel.emoji}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-sans font-bold leading-tight">{currentElchLevel.text}</span>
                  <span className="text-[10px] font-sans uppercase tracking-widest opacity-50 leading-tight">Level {elchScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
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

      {/* Navigation zu Leaderboard & Statistik – Punkt 2: elegante neutrale Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/leaderboard" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-foreground hover:bg-white/20 transition-all duration-200 hover:scale-105 active:scale-95">
            <CardContent className="p-3 flex items-center justify-center gap-2">
              <Medal className="w-5 h-5 flex-shrink-0 text-primary" />
              <div className="text-sm font-sans font-bold leading-tight">Leaderboard</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/leaderboard?tab=stats" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-foreground hover:bg-white/20 transition-all duration-200 hover:scale-105 active:scale-95">
            <CardContent className="p-3 flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5 flex-shrink-0 text-primary" />
              <div className="text-sm font-sans font-bold leading-tight">Statistik</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Beverage Grid – Beige Glasskarten, Neon-Hover, Uppercase Label */}
      <div>
        <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">Was trinkst du?</h2>
        <div className="grid grid-cols-2 gap-3">
          {beverages.map(bev => (
            <button
              key={bev.id}
              onClick={() => handleOpenModal(bev)}
              disabled={loadingId === bev.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-left transition-all duration-200 hover:scale-[1.03] hover:border-[#D9FF3D]/40 hover:shadow-lg hover:shadow-[#D9FF3D]/10 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[#D9FF3D] select-none"
              style={{ backgroundColor: "rgba(76,80,61,0.55)" }}
            >
              {/* Square image / icon area */}
              <div className="relative w-full aspect-square overflow-hidden flex items-center justify-center bg-white/5">
                {loadingId === bev.id ? (
                  <Loader2 className="w-10 h-10 text-[#D9FF3D] animate-spin" />
                ) : getBeverageImage(bev.name) ? (
                  <Image
                    src={getBeverageImage(bev.name)!}
                    alt={bev.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="text-6xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                    {getBeverageIcon(bev.name, "w-16 h-16")}
                  </div>
                )}
              </div>

              {/* Name + price row with neon +1 badge */}
              <div className="flex items-center justify-between p-3 gap-2">
                <div className="min-w-0">
                  <h3 className="font-sans font-bold text-sm leading-tight truncate text-white">{bev.name}</h3>
                  <p className="text-xs font-sans font-semibold uppercase tracking-wider text-white/50 mt-0.5">{Number(bev.price).toFixed(2)} €</p>
                </div>
                <div
                  className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl font-black text-sm transition-all duration-150 group-hover:scale-110"
                  style={{ backgroundColor: "#D9FF3D", color: "#1a1e12" }}
                >
                  +1
                </div>
              </div>
            </button>
          ))}
          {beverages.length === 0 && (
            <div className="col-span-2 text-center p-8 border border-dashed border-muted-foreground/30 rounded-2xl text-muted-foreground">
              Keine Getränke im System. Der Admin muss den Kühlschrank auffüllen!
            </div>
          )}
        </div>
      </div>

      {/* Meine Statistiken – Beige Karte, rounded-3xl, Uppercase Labels */}
      <div className="mt-8">
        <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">Meine Statistiken</h2>
        <Card className="bg-card border-0 rounded-3xl shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {personalStats.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground animate-in fade-in duration-500">
                <Beer className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-semibold text-foreground/80 mb-1">Noch sieht es hier leer aus!</p>
                <p className="text-sm">Schnapp dir dein erstes Getränk.</p>
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
              <span className="text-3xl drop-shadow-sm flex items-center justify-center">{selectedBev && getBeverageIcon(selectedBev.name, "w-8 h-8")}</span>
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
