"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

export type GrillItem = {
  id: string
  name: string
  price: number
  image: string
}

export function AdminGrillDashboard() {
  const supabase = createClient()
  const [items, setItems] = useState<GrillItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  const [selectedItem, setSelectedItem] = useState<GrillItem | null>(null)
  
  // Form state
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('grill_items').select('*').order('name')
      if (error) {
        console.error("Error fetching grill items:", error)
      } else if (data) {
        setItems(data as GrillItem[])
      }
      setLoadingItems(false)
    }
    fetchItems()
  }, [supabase])

  const openAddModal = () => {
    setName("")
    setPrice("")
    setIsAddOpen(true)
  }

  const openEditModal = (item: GrillItem) => {
    setSelectedItem(item)
    setName(item.name)
    setPrice(item.price.toString())
    setIsEditOpen(true)
  }

  const openDeleteModal = (item: GrillItem) => {
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

    const { data, error } = await supabase
      .from('grill_items')
      .insert([{ name, price: priceNum, image: "/images/steak.png" }]) // Default Image per User Request
      .select()

    if (error) {
      alert("Fehler beim Speichern: " + error.message)
    } else if (data) {
      setItems((prev) => [...prev, data[0] as GrillItem].sort((a, b) => a.name.localeCompare(b.name)))
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

    const { error } = await supabase
      .from('grill_items')
      .update({ name, price: priceNum })
      .eq('id', selectedItem.id)

    if (error) {
      alert("Fehler beim Aktualisieren: " + error.message)
    } else {
      setItems((prev) => 
        prev.map(i => i.id === selectedItem.id ? { ...i, name, price: priceNum } : i).sort((a, b) => a.name.localeCompare(b.name))
      )
      setIsEditOpen(false)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    setIsSubmitting(true)
    
    const { error } = await supabase.from('grill_items').delete().eq('id', selectedItem.id)
    
    if (error) {
      alert("Fehler beim Löschen: " + error.message)
    } else {
      setItems((prev) => prev.filter(i => i.id !== selectedItem.id))
      setIsDeleteOpen(false)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#4c503d] text-white p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <AdminNav />

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#E5E4DE]">Grillfleisch Verwaltung</h1>
            <p className="text-[#E5E4DE]/70 text-sm mt-1">Verwalte die verfügbaren Fleischsorten für das Lager.</p>
          </div>
          <Button 
            onClick={openAddModal}
            disabled={loadingItems || isSubmitting}
            className="bg-[#D9FF3D] text-[#1a1e12] hover:bg-[#D9FF3D]/80 font-bold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Neues Fleisch hinzufügen
          </Button>
        </div>

        {/* Meat List */}
        <div className="space-y-3">
          {loadingItems ? (
            <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D9FF3D]" />
            </div>
          ) : items.length === 0 ? (
             <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
               <p className="text-[#E5E4DE]/70">Kein Fleisch angelegt. Füge ein neues Produkt hinzu!</p>
             </div>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🥩</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#E5E4DE] truncate">{item.name}</h3>
                      <p className="text-[#D9FF3D] font-serif font-semibold">{item.price.toFixed(2)} €</p>
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

      {/* Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#E5E4DE] border-0 text-[#4c503d]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Neues Fleisch anlegen</DialogTitle>
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

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-[#E5E4DE] border-0 text-[#4c503d]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Fleisch bearbeiten</DialogTitle>
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
              Möchtest du "{selectedItem?.name}" wirklich aus dem System entfernen?
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

