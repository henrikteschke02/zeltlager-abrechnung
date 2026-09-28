"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2, CheckCircle2, AlertCircle, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminNav } from "@/components/admin-nav"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export type BroetchenItem = {
  id: string
  name: string
  preis: number
  image_name?: string | null
}

const AVAILABLE_IMAGES = [
  "kaese.png",
  "mehrkorn.png",
  "normales.png",
  "roggen.png"
]

export function AdminBroetchenDashboard() {
  const supabase = createClient()
  const [items, setItems] = useState<BroetchenItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  const [selectedItem, setSelectedItem] = useState<BroetchenItem | null>(null)
  
  // Form state
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [imageName, setImageName] = useState("")

  // Bäcker Ansicht
  const [activeSession, setActiveSession] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [actuals, setActuals] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchAll = async () => {
      const { data: itemsData } = await supabase.from('broetchen_items').select('*').order('name')
      if (itemsData) setItems(itemsData as BroetchenItem[])

      let { data: sessionData, error: sessionError } = await supabase.from('broetchen_sessions').select('*').eq('status', 'active').single()
      
      if (!sessionData) {
        const { data: newSession, error: insertError } = await supabase.from('broetchen_sessions').insert([{ status: 'active' }]).select().single()
        if (insertError) {
          console.error("Failed to create active session:", insertError)
          toast.error("Fehler beim Erstellen der Session")
        }
        sessionData = newSession
      }

      if (sessionData) {
        setActiveSession(sessionData)
        const { data: ordersData } = await supabase.from('broetchen_orders').select('*').eq('session_id', sessionData.id)
        if (ordersData) setOrders(ordersData)
      }
      setLoadingItems(false)
    }
    fetchAll()
  }, [supabase])

  const openAddModal = () => {
    setName("")
    setPrice("")
    setImageName("")
    setIsAddOpen(true)
  }

  const openEditModal = (item: BroetchenItem) => {
    setSelectedItem(item)
    setName(item.name)
    setPrice(item.preis?.toString() || "0")
    setImageName(item.image_name || "")
    setIsEditOpen(true)
  }

  const openDeleteModal = (item: BroetchenItem) => {
    setSelectedItem(item)
    setIsDeleteOpen(true)
  }

  const handleAdd = async () => {
    if (!name || !price) return
    setIsSubmitting(true)
    
    const priceNum = parseFloat(price.replace(',', '.'))
    if (isNaN(priceNum)) {
      alert("Bitte einen gültigen Preis eingeben")
      setIsSubmitting(false)
      return
    }

    const finalImageName = imageName.trim() === "" ? null : imageName.trim()

    const { data, error } = await supabase
      .from('broetchen_items')
      .insert([{ name, preis: priceNum, image_name: finalImageName }])
      .select()

    if (error) {
      alert("Fehler beim Speichern: " + error.message)
    } else if (data) {
      setItems((prev) => [...prev, data[0] as BroetchenItem].sort((a, b) => a.name.localeCompare(b.name)))
      setIsAddOpen(false)
    }
    setIsSubmitting(false)
  }

  const handleEdit = async () => {
    if (!selectedItem || !name || !price) return
    setIsSubmitting(true)

    const priceNum = parseFloat(price.replace(',', '.'))
    if (isNaN(priceNum)) {
      alert("Bitte einen gültigen Preis eingeben")
      setIsSubmitting(false)
      return
    }

    const finalImageName = imageName.trim() === "" ? null : imageName.trim()

    const { error } = await supabase
      .from('broetchen_items')
      .update({ name, preis: priceNum, image_name: finalImageName })
      .eq('id', selectedItem.id)

    if (error) {
      alert("Fehler beim Aktualisieren: " + error.message)
    } else {
      setItems((prev) => 
        prev.map(i => i.id === selectedItem.id ? { ...i, name, preis: priceNum, image_name: finalImageName } : i).sort((a, b) => a.name.localeCompare(b.name))
      )
      setIsEditOpen(false)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    setIsSubmitting(true)
    
    const { error } = await supabase.from('broetchen_items').delete().eq('id', selectedItem.id)
    
    if (error) {
      alert("Fehler beim Löschen: " + error.message)
    } else {
      setItems((prev) => prev.filter(i => i.id !== selectedItem.id))
      setIsDeleteOpen(false)
    }
    setIsSubmitting(false)
  }

  const aggregates = items.map(item => {
    const total = orders.filter(o => o.product_id === item.id).reduce((sum, o) => sum + o.menge, 0)
    return { ...item, total }
  }).filter(a => a.total > 0)

  const openCheckout = () => {
    const defaultActuals: Record<string, number> = {}
    aggregates.forEach(a => {
      defaultActuals[a.id] = a.total
    })
    setActuals(defaultActuals)
    setIsCheckoutOpen(true)
  }

  const handleCheckout = async () => {
    setIsSubmitting(true)
    try {
      // 1. Proportional adjustment if needed
      for (const a of aggregates) {
        const actual = actuals[a.id] || 0
        if (actual < a.total) {
          // Need to reduce orders
          let toRemove = a.total - actual
          let productOrders = orders.filter(o => o.product_id === a.id && o.menge > 0).map(o => ({...o}))
          
          while(toRemove > 0) {
            let eligible = productOrders.filter(o => o.menge > 0)
            if (eligible.length === 0) break
            eligible.sort((x, y) => y.menge - x.menge)
            eligible[0].menge -= 1
            toRemove -= 1
          }
          
          // Update db with adjusted quantities
          for (const adjustedOrder of productOrders) {
            const originalOrder = orders.find(o => o.id === adjustedOrder.id)
            if (originalOrder && originalOrder.menge !== adjustedOrder.menge) {
              if (adjustedOrder.menge === 0) {
                await supabase.from('broetchen_orders').delete().eq('id', adjustedOrder.id)
              } else {
                await supabase.from('broetchen_orders').update({ menge: adjustedOrder.menge }).eq('id', adjustedOrder.id)
              }
            }
          }
        }
      }

      // 2. Complete session
      await supabase.from('broetchen_sessions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', activeSession.id)

      // 3. Create new session
      await supabase.from('broetchen_sessions').insert([{ status: 'active' }])

      toast.success("Einkauf verbucht!", { description: "Die neue Vorbestellungs-Session wurde gestartet." })
      setIsCheckoutOpen(false)
      window.location.reload()
    } catch (e: any) {
      toast.error("Fehler", { description: e.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <AdminNav />

        {/* Bäcker-Ansicht */}
        <Card className="bg-[#D9FF3D] border-0 text-[#1a1e12]">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" /> Bäcker-Ansicht
              </CardTitle>
              <CardDescription className="text-[#1a1e12]/70 mt-1">
                Zusammenfassung der aktuellen Bestellung.
              </CardDescription>
            </div>
            <Button onClick={openCheckout} disabled={!activeSession} className="bg-[#1a1e12] text-white hover:bg-[#1a1e12]/80 font-bold">
              Einkauf abschließen & verbuchen
            </Button>
          </CardHeader>
          <CardContent>
            {!activeSession ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : aggregates.length === 0 ? (
              <p className="font-medium text-sm">Noch keine Bestellungen für morgen.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {aggregates.map(a => (
                  <div key={a.id} className="bg-white/40 p-3 rounded-lg flex items-center justify-between">
                    <span className="font-semibold truncate pr-2">{a.name}</span>
                    <span className="font-bold text-xl">{a.total}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#E5E4DE]">Brötchen Verwaltung</h1>
            <p className="text-[#4c503d]/70 dark:text-muted-foreground text-sm mt-1">Verwalte die verfügbaren Brötchensorten für das Lager.</p>
          </div>
          <Button 
            onClick={openAddModal}
            disabled={loadingItems || isSubmitting}
            className="bg-white/10 text-[#E5E4DE] hover:bg-white/20 font-bold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Neues Brötchen
          </Button>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {loadingItems ? (
            <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-2xl flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D9FF3D]" />
            </div>
          ) : items.length === 0 ? (
             <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-2xl">
               <p className="text-[#4c503d]/70 dark:text-muted-foreground">Kein Brötchen angelegt. Füge ein neues Produkt hinzu!</p>
             </div>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="bg-white/5 backdrop-blur-sm border-black/10 dark:border-white/10 overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {item.image_name ? (
                      <img 
                        src={`/images/broetchen/${item.image_name}`} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-md object-cover flex-shrink-0" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-black/20 flex items-center justify-center flex-shrink-0 opacity-50">
                        <span className="text-2xl">🥯</span>
                      </div>
                    )}
                    <div className="min-w-0 flex flex-col justify-center">
                      <h3 className="font-bold text-[#E5E4DE] truncate leading-tight">{item.name}</h3>
                      <p className="text-[#D9FF3D] font-serif font-semibold text-sm leading-tight">{Number(item.preis || 0).toFixed(2)} €</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditModal(item)}
                      className="text-[#E5E4DE] hover:text-[#D9FF3D] hover:bg-white/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openDeleteModal(item)}
                      className="text-red-400 hover:text-red-300 hover:bg-white/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Einkauf abschließen</DialogTitle>
            <DialogDescription>
              Trage hier die TATSÄCHLICH gekauften Mengen ein. Bei Fehlmengen wird das System die User-Bestellungen automatisch anteilig nach unten korrigieren.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto pr-2">
            {aggregates.map(a => (
              <div key={a.id} className="flex items-center justify-between gap-4">
                <Label className="flex-1 font-semibold">{a.name} (Bestellt: {a.total})</Label>
                <Input 
                  type="number" 
                  min="0"
                  max={a.total}
                  value={actuals[a.id] ?? a.total} 
                  onChange={(e) => setActuals(prev => ({...prev, [a.id]: parseInt(e.target.value) || 0}))} 
                  className="w-24 font-bold text-center"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCheckoutOpen(false)} disabled={isSubmitting}>Abbrechen</Button>
            <Button onClick={handleCheckout} disabled={isSubmitting} className="font-bold">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Bestätigen & Buchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#E5E4DE] border-0 text-[#4c503d]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Neues Brötchen anlegen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name" className="text-[#4c503d] font-bold">Name</Label>
              <Input 
                id="add-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="z.B. Nackensteak"
                className="bg-white/50 border-[#4c503d]/20 text-[#4c503d] placeholder:text-[#4c503d]/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-price" className="text-[#4c503d] font-bold">Preis (€)</Label>
              <Input 
                id="add-price" 
                type="number" 
                step="0.10"
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder="2.50"
                className="bg-white/50 border-[#4c503d]/20 text-[#4c503d] placeholder:text-[#4c503d]/40"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="text-[#4c503d]">Abbrechen</Button>
            <Button onClick={handleAdd} className="bg-[#4c503d] text-[#E5E4DE] hover:bg-[#4c503d]/90">Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Delete modale übersprungen der Kürze halber in diesem Snippet, 
          in real müssten sie da bleiben. Ich füge sie ein, damit nichts fehlt. */}
      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-[#E5E4DE] border-0 text-[#4c503d]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Brötchen bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-[#4c503d] font-bold">Name</Label>
              <Input 
                id="edit-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="bg-white/50 border-[#4c503d]/20 text-[#4c503d] placeholder:text-[#4c503d]/40" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price" className="text-[#4c503d] font-bold">Preis (€)</Label>
              <Input 
                id="edit-price" 
                type="number" 
                step="0.10"
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                className="bg-white/50 border-[#4c503d]/20 text-[#4c503d] placeholder:text-[#4c503d]/40"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="text-[#4c503d]">Abbrechen</Button>
            <Button onClick={handleEdit} className="bg-[#4c503d] text-[#E5E4DE] hover:bg-[#4c503d]/90">Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-[#E5E4DE] border-0 text-[#4c503d]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Sicher?</DialogTitle>
            <DialogDescription className="text-[#4c503d]/70">
              Möchtest du "{selectedItem?.name}" wirklich entfernen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="text-[#4c503d] hover:bg-[#4c503d]/5">Abbrechen</Button>
            <Button onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">Löschen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
