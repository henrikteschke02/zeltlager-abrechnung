"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { Croissant, Plus, Minus, ChevronDown, Loader2, Undo2 } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

export type BroetchenItem = {
  id: string
  name: string
  preis: number
  image_name?: string | null
}

type BroetchenOrder = {
  id: string
  user_id: string
  item_id: string
  menge: number
  created_at: string
}

// ─── Dummy data (entfernt) ───────────────────────────────────
// Die Daten kommen nun ausschließlich aus der DB (broetchen_items).

// ─── Component ────────────────────────────────────────────────────────────────

export function CamperBroetchenDashboard({
  userId,
  items = [],
  initialOrders = [],
}: {
  userId: string
  items?: BroetchenItem[]
  initialOrders?: BroetchenOrder[]
}) {
  const supabase = createClient()

  const [orders, setOrders] = useState<BroetchenOrder[]>(initialOrders)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())

  // Deckel toggle (Gesamt vs. Tagesdeckel)
  const [showDaily, setShowDaily] = useState(false)

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const isVibe = mounted && theme === 'vibe'

  // Booking modal
  const [selectedItem, setSelectedItem] = useState<BroetchenItem | null>(null)
  const [selectedQty, setSelectedQty] = useState(1)

  // Camp day reset at 07:00
  const startOfCampDay = useMemo(() => {
    const d = new Date()
    if (d.getHours() < 7) d.setDate(d.getDate() - 1)
    d.setHours(7, 0, 0, 0)
    return d
  }, [])

  // Countdown timer for undo
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // ── Derived values ──────────────────────────────────────────────────────────

  const todaysOrders = orders.filter(
    (o) => new Date(o.created_at) >= startOfCampDay
  )

  const totalCost = orders.reduce((sum, order) => {
    const item = items.find((i) => i.id === order.item_id)
    return sum + (item?.preis || 0) * order.menge
  }, 0)

  const todaysDebt = todaysOrders.reduce((sum, o) => {
    const item = items.find((i) => i.id === o.item_id)
    return sum + (item ? item.preis * o.menge : 0)
  }, 0)

  const totalCount = orders.reduce((s, o) => s + o.menge, 0)
  const todaysCount = todaysOrders.reduce((s, o) => s + o.menge, 0)

  // Storno window: 3 min
  const stornoEntries = orders.filter(
    (o) => now.getTime() - new Date(o.created_at).getTime() <= 3 * 60 * 1000
  )

  // Meine persönlichen Statistiken (aggregiert)
  const personalStats = useMemo(() => {
    const stats: Record<string, { count: number; totalCost: number; name: string }> = {}
    orders.forEach(o => {
      const item = items.find(i => i.id === o.item_id)
      if (!item) return
      if (!stats[item.id]) {
        stats[item.id] = { count: 0, totalCost: 0, name: item.name }
      }
      stats[item.id].count += o.menge
      stats[item.id].totalCost += o.menge * Number(item.preis)
    })
    return Object.values(stats).sort((a, b) => b.count - a.count)
  }, [orders, items])

  // ── Actions ─────────────────────────────────────────────────────────────────

  const openModal = (item: BroetchenItem) => {
    setSelectedItem(item)
    setSelectedQty(1)
  }

  const executeBooking = async (item: BroetchenItem, qty: number) => {
    if (loadingId) return
    setLoadingId(item.id)
    setSelectedItem(null)

    // Optimistic insert
    const temp: BroetchenOrder = {
      id: crypto.randomUUID(),
      user_id: userId,
      item_id: item.id,
      menge: qty,
      created_at: new Date().toISOString(),
    }
    setOrders((prev) => [temp, ...prev])

    const { data, error } = await supabase
       .from("broetchen_buchungen")
       .insert([{ user_id: userId, item_id: item.id, menge: qty }])
       .select()
       .single()

    if (error) {
      console.error("Booking error details:", error)
      // Revert optimistic
      setOrders((prev) => prev.filter(o => o.id !== temp.id))
      alert(`Buchung fehlgeschlagen: ${error.message || "Unbekannter Fehler"}\nDetails in der Konsole.`)
    } else if (data) {
      // Replace optimistic temp with real DB record
      setOrders((prev) => prev.map(o => o.id === temp.id ? data as BroetchenOrder : o))
    }

    setLoadingId(null)
  }

  const handleStorno = async (id: string) => {
    const original = orders.find((o) => o.id === id)
    if (!original) return
    setOrders((prev) => prev.filter((o) => o.id !== id))
    
    const { error } = await supabase.from("broetchen_buchungen").delete().eq("id", id)
    if (error) {
      console.error("Storno error", error)
      // Revert storno
      setOrders((prev) => [original, ...prev])
      alert("Storno fehlgeschlagen!")
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── MEIN GRILL-DECKEL (Sticky Banner) ─────────────────────────────── */}
      <div className="sticky top-16 z-40 mb-4 max-w-2xl mx-auto">
        <Card
          className={
            isVibe
              ? "bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden relative rounded-2xl cursor-pointer group select-none transition-all duration-300 hover:bg-black/50 hover:border-white/20 active:scale-[0.98] text-white"
              : "bg-card text-card-foreground shadow-2xl shadow-black/30 overflow-hidden relative border-0 rounded-3xl cursor-pointer group select-none transition-all active:scale-[0.98]"
          }
          onClick={() => setShowDaily(!showDaily)}
        >
          {/* Background flame icon decoration */}
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Croissant className="w-24 h-24" />
          </div>

          <CardHeader className="relative z-10 pb-2">
            <div className="flex justify-between items-end">
              <div>
                <CardTitle className="text-[10px] font-sans font-semibold uppercase tracking-widest opacity-60 flex items-center gap-1">
                  {showDaily ? "Tages-Brötchen-Deckel" : "Gesamt-Brötchen-Deckel"}
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${showDaily ? "rotate-180" : ""}`}
                  />
                </CardTitle>
                <div
                  className="text-4xl font-serif font-bold tracking-tight leading-none mt-1 animate-in fade-in slide-in-from-bottom-1 duration-300"
                  key={showDaily ? "daily" : "total"}
                >
                  {(showDaily ? todaysDebt : totalCost).toFixed(2)} €
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-sans font-semibold uppercase tracking-widest opacity-60">
                  {showDaily ? "Heute" : "Gesamt"}
                </div>
                <div
                  className="text-2xl font-serif font-bold animate-in fade-in slide-in-from-bottom-1 duration-300"
                  key={showDaily ? "dailyC" : "totalC"}
                >
                  {showDaily ? todaysCount : totalCount}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 pb-4 pt-0">
            <div className={`flex items-center gap-3 rounded-2xl p-2.5 mt-2 border ${isVibe ? 'bg-white/10 border-white/10' : 'bg-black/5 border-black/5'}`}>
              <Croissant className={`w-8 h-8 ${isVibe ? 'text-white' : 'text-amber-500'}`} />
              <p className="text-xs font-sans font-semibold uppercase tracking-widest opacity-70">
                Mein Brötchen-Deckel — unabhängig vom Getränke-Deckel
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Storno Strip ──────────────────────────────────────────────────────── */}
      {stornoEntries.length > 0 && (
        <div className="mb-6 max-w-2xl mx-auto">
          <h2 className="text-sm font-bold tracking-tight mb-2 px-1 text-muted-foreground flex items-center">
            <Undo2 className="w-4 h-4 mr-2" /> Kürzliche Buchungen (Storno)
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
            {stornoEntries.map((o) => {
              const item = items.find((i) => i.id === o.item_id)
              const timeLeft = Math.max(
                0,
                Math.floor(
                  (3 * 60 * 1000 - (now.getTime() - new Date(o.created_at).getTime())) / 1000
                )
              )
              const mins = Math.floor(timeLeft / 60)
              const secs = timeLeft % 60
              return (
                <Card
                  key={o.id}
                  className="bg-destructive/10 border-destructive/20 shadow-sm flex-shrink-0 w-[240px] snap-start"
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-sm truncate">
                          {o.menge}× {item?.name ?? "Unbekannt"}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {mins}:{secs.toString().padStart(2, "0")} min stornierbar
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={() => handleStorno(o.id)}
                    >
                      Rückgängig
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Section heading ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-3">
          Welche Brötchen möchtest du?
        </h2>

        {/* ── Meat Grid ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => openModal(item)}
            disabled={loadingId === item.id}
            className={
              isVibe
                ? "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl text-left transition-all duration-300 hover:bg-black/50 hover:border-white/20 hover:scale-[1.03] active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-white select-none"
                : "group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white/5 backdrop-blur-md text-left transition-all duration-200 hover:scale-[1.03] hover:border-[#D9FF3D]/40 hover:shadow-lg hover:shadow-[#D9FF3D]/10 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[#D9FF3D] select-none"
            }
            style={isVibe ? {} : { backgroundColor: "rgba(76,80,61,0.55)" }}
          >
            {/* Square image area */}
            <div className={`relative w-full aspect-square overflow-hidden ${isVibe ? 'bg-transparent' : 'bg-[#4c503d]'}`}>
              {loadingId === item.id ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
                  <Loader2 className={`w-10 h-10 animate-spin ${isVibe ? 'text-white' : 'text-[#D9FF3D]'}`} />
                </div>
              ) : (
                <Image
                  src={item.image_name ? `/images/broetchen/${item.image_name}` : "/images/broetchen/default.png"}
                  alt={item.name}
                  fill
                  className="object-cover scale-[1.2] transition-transform duration-500 group-hover:scale-[1.3]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
              {/* Gradient overlay at bottom of image for text readability */}
              <div className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t ${isVibe ? 'from-black/80' : 'from-[#4c503d]/80'} to-transparent pointer-events-none z-10`} />
            </div>

            {/* Card body */}
            <div className="flex items-center justify-between p-3 gap-2">
              <div className="min-w-0">
                <h3 className={`font-sans font-bold text-sm leading-tight truncate ${isVibe ? 'text-white' : 'text-[#4c503d] dark:text-white'}`}>
                  {item.name}
                </h3>
                <p className={`text-xs font-sans font-semibold uppercase tracking-wider mt-0.5 ${isVibe ? 'text-slate-400' : 'text-[#4c503d]/50 dark:text-white/50'}`}>
                  {Number(item.preis || 0).toFixed(2)} €
                </p>
              </div>

              {/* Neon +1 button */}
              <div
                className={
                  isVibe
                    ? "flex-shrink-0 flex items-center justify-center w-9 h-9 font-medium text-sm transition-all duration-150 group-hover:scale-110 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full backdrop-blur-md"
                    : "flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl font-black text-sm transition-all duration-150 group-hover:scale-110"
                }
                style={isVibe ? {} : { backgroundColor: "#D9FF3D", color: "#1a1e12" }}
              >
                +1
              </div>
            </div>
          </button>
        ))}
      </div>
      </div>

      {/* Meine Statistiken – Beige Karte, rounded-3xl, Uppercase Labels */}
      <div className="max-w-2xl mx-auto">
        <h2 className={`text-xs font-sans font-semibold uppercase tracking-widest mb-3 px-1 ${isVibe ? 'text-slate-400' : 'text-muted-foreground'}`}>Meine Statistiken</h2>
        <Card className={isVibe ? 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden text-white hover:bg-black/50 hover:border-white/20 transition-all duration-300' : 'bg-card border-0 rounded-3xl shadow-sm overflow-hidden'}>
          <CardContent className="p-0">
            {personalStats.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground animate-in fade-in duration-500">
                <Croissant className={`w-12 h-12 mb-3 ${isVibe ? 'text-white opacity-80' : 'opacity-50'}`} />
                <p className={`font-semibold mb-1 ${isVibe ? 'text-white' : 'text-foreground/80'}`}>Noch sieht es hier leer aus!</p>
                <p className={`text-sm ${isVibe ? 'text-slate-400' : ''}`}>Bestell dir dein erstes Brötchen.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {personalStats.map((stat, i) => (
                  <div key={i} className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-3">
                      <div className={`font-bold w-8 h-8 rounded-full flex items-center justify-center ${isVibe ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary'}`}>
                        {stat.count}x
                      </div>
                      <span className="font-medium">{stat.name}</span>
                    </div>
                    <span className={`font-semibold ${isVibe ? 'text-slate-400' : 'text-muted-foreground'}`}>
                      {stat.totalCost.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Booking Modal ─────────────────────────────────────────────────────── */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              {selectedItem && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedItem.image_name ? `/images/broetchen/${selectedItem.image_name}` : "/images/broetchen/default.png"}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {selectedItem?.name} buchen
            </DialogTitle>
            <DialogDescription>Wähle die Menge für deine Buchung.</DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full border-2"
                onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                disabled={selectedQty <= 1}
              >
                <Minus className="h-5 w-5" />
              </Button>

              <div className="w-20 text-center">
                <span className="text-5xl font-black">{selectedQty}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full border-2"
                onClick={() => setSelectedQty(selectedQty + 1)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <div className="text-center font-bold text-xl text-primary">
              Gesamt: {(selectedQty * (selectedItem?.preis ?? 0)).toFixed(2)} €
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              className="w-full h-14 text-lg font-bold"
              onClick={() => selectedItem && executeBooking(selectedItem, selectedQty)}
            >
              Kostenpflichtig buchen
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setSelectedItem(null)}>
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
