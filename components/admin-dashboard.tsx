"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Edit2, Plus, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AdminNav } from "@/components/admin-nav"

type Beverage = {
  id: string
  name: string
  price: number
  bundle_size: number | null
  created_at: string
}

type Profile = {
  id: string
  role: string
  email: string
  full_name: string | null
  phone?: string | null
  is_approved?: boolean
}

export function AdminDashboard({
  initialBeverages,
}: {
  initialBeverages: Beverage[]
}) {
  const [beverages, setBeverages] = useState<Beverage[]>(initialBeverages)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newBeverage, setNewBeverage] = useState({ name: "", price: "", bundle_size: "" })
  const [editingBeverage, setEditingBeverage] = useState<{ id: string, name: string, price: string, bundle_size: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAddBeverage = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const priceNum = parseFloat(newBeverage.price.replace(',', '.'))
    if (isNaN(priceNum)) {
      alert("Bitte einen gültigen Preis eingeben")
      setLoading(false)
      return
    }

    const bundleNum = newBeverage.bundle_size ? parseInt(newBeverage.bundle_size) : null

    const { data, error } = await supabase
      .from('beverages')
      .insert([{ name: newBeverage.name, price: priceNum, bundle_size: bundleNum }])
      .select()

    if (error) {
      alert("Fehler beim Hinzufügen: " + error.message)
    } else if (data) {
      setBeverages([...beverages, data[0] as Beverage])
      setIsAddModalOpen(false)
      setNewBeverage({ name: "", price: "", bundle_size: "" })
      router.refresh()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Wirklich löschen?")) return
    
    const { error } = await supabase.from('beverages').delete().eq('id', id)
    if (error) {
      alert("Fehler beim Löschen: " + error.message)
    } else {
      setBeverages(beverages.filter(b => b.id !== id))
      router.refresh()
    }
  }

  const handleEditBeverage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBeverage) return
    
    setLoading(true)
    const priceNum = parseFloat(editingBeverage.price.replace(',', '.'))
    if (isNaN(priceNum)) {
      alert("Bitte einen gültigen Preis eingeben")
      setLoading(false)
      return
    }

    const bundleNum = editingBeverage.bundle_size ? parseInt(editingBeverage.bundle_size) : null

    const { error } = await supabase
      .from('beverages')
      .update({ name: editingBeverage.name, price: priceNum, bundle_size: bundleNum })
      .eq('id', editingBeverage.id)

    if (error) {
      alert("Fehler beim Aktualisieren: " + error.message)
    } else {
      setBeverages(beverages.map(b => b.id === editingBeverage.id ? { ...b, name: editingBeverage.name, price: priceNum, bundle_size: bundleNum } : b))
      setIsEditModalOpen(false)
      setEditingBeverage(null)
      router.refresh()
    }
    setLoading(false)
  }



  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mx-auto max-w-7xl">
      
      <AdminNav />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Verwalte Getränke und sehe alle registrierten Camper.
        </p>
      </div>



      <div className="grid gap-6 md:grid-cols-1 max-w-4xl">
        {/* Getränke Karte */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Getränke</CardTitle>
              <CardDescription>Aktuelles Angebot an Getränken</CardDescription>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger className={buttonVariants({ size: "sm" })}>
                <Plus className="mr-2 h-4 w-4" /> Neues Getränk
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Getränk hinzufügen</DialogTitle>
                  <DialogDescription>
                    Lege ein neues Getränk und den Preis fest.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddBeverage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      required 
                      value={newBeverage.name}
                      onChange={(e) => setNewBeverage({...newBeverage, name: e.target.value})}
                      placeholder="z.B. Cola" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preis (€)</Label>
                    <Input 
                      id="price" 
                      required 
                      value={newBeverage.price}
                      onChange={(e) => setNewBeverage({...newBeverage, price: e.target.value})}
                      placeholder="1.50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bundle_size">Kisten-Größe / Bundle (optional)</Label>
                    <Input 
                      id="bundle_size" 
                      type="number"
                      value={newBeverage.bundle_size}
                      onChange={(e) => setNewBeverage({...newBeverage, bundle_size: e.target.value})}
                      placeholder="z.B. 24" 
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Speichern"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead>Kiste</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beverages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                        Keine Getränke vorhanden.
                      </TableCell>
                    </TableRow>
                  ) : (
                    beverages.map((bev) => (
                      <TableRow key={bev.id}>
                        <TableCell className="font-medium">{bev.name}</TableCell>
                        <TableCell>{Number(bev.price).toFixed(2)} €</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{bev.bundle_size ? `${bev.bundle_size}er Kiste` : '-'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingBeverage({ id: bev.id, name: bev.name, price: bev.price.toString(), bundle_size: bev.bundle_size?.toString() || '' })
                            setIsEditModalOpen(true)
                          }}>
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(bev.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Preis bearbeiten: {editingBeverage?.name}</DialogTitle>
                <DialogDescription>
                  Ändere den Preis für dieses Getränk.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditBeverage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Neuer Name</Label>
                  <Input 
                    id="edit-name" 
                    required 
                    value={editingBeverage?.name || ""}
                    onChange={(e) => setEditingBeverage(editingBeverage ? {...editingBeverage, name: e.target.value} : null)}
                    placeholder="z.B. Cola" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Neuer Preis (€)</Label>
                  <Input 
                    id="edit-price" 
                    required 
                    value={editingBeverage?.price || ""}
                    onChange={(e) => setEditingBeverage(editingBeverage ? {...editingBeverage, price: e.target.value} : null)}
                    placeholder="1.50" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bundle_size">Kisten-Größe / Bundle (optional)</Label>
                  <Input 
                    id="edit-bundle_size" 
                    type="number"
                    value={editingBeverage?.bundle_size || ""}
                    onChange={(e) => setEditingBeverage(editingBeverage ? {...editingBeverage, bundle_size: e.target.value} : null)}
                    placeholder="z.B. 24" 
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Aktualisieren"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </Card>


      </div>
    </div>
  )
}
