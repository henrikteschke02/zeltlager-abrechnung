"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Edit2, Plus, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Beverage = {
  id: string
  name: string
  price: number
  created_at: string
}

type Profile = {
  id: string
  role: string
  email: string
}

export function AdminDashboard({
  initialBeverages,
  initialProfiles,
}: {
  initialBeverages: Beverage[]
  initialProfiles: Profile[]
}) {
  const [beverages, setBeverages] = useState<Beverage[]>(initialBeverages)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newBeverage, setNewBeverage] = useState({ name: "", price: "" })
  const [editingBeverage, setEditingBeverage] = useState<{ id: string, name: string, price: string } | null>(null)
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

    const { data, error } = await supabase
      .from('beverages')
      .insert([{ name: newBeverage.name, price: priceNum }])
      .select()

    if (error) {
      alert("Fehler beim Hinzufügen: " + error.message)
    } else if (data) {
      setBeverages([...beverages, data[0] as Beverage])
      setIsAddModalOpen(false)
      setNewBeverage({ name: "", price: "" })
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

    const { error } = await supabase
      .from('beverages')
      .update({ price: priceNum })
      .eq('id', editingBeverage.id)

    if (error) {
      alert("Fehler beim Aktualisieren: " + error.message)
    } else {
      setBeverages(beverages.map(b => b.id === editingBeverage.id ? { ...b, price: priceNum } : b))
      setIsEditModalOpen(false)
      setEditingBeverage(null)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Verwalte Getränke und sehe alle registrierten Camper.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Getränke Karte */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Getränke</CardTitle>
              <CardDescription>Aktuelles Angebot an Getränken</CardDescription>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Neues Getränk</Button>
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
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingBeverage({ id: bev.id, name: bev.name, price: bev.price.toString() })
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
                  <Label htmlFor="edit-price">Neuer Preis (€)</Label>
                  <Input 
                    id="edit-price" 
                    required 
                    value={editingBeverage?.price || ""}
                    onChange={(e) => setEditingBeverage(editingBeverage ? {...editingBeverage, price: e.target.value} : null)}
                    placeholder="1.50" 
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

        {/* User Karte */}
        <Card>
          <CardHeader>
            <CardTitle>Camper (Profile)</CardTitle>
            <CardDescription>Liste aller registrierten Nutzer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rolle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                        Keine User gefunden.
                      </TableCell>
                    </TableRow>
                  ) : (
                    initialProfiles.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {user.role}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
