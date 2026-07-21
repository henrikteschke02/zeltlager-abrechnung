"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Download, Search, Info } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

export function AdminCamperDashboard({
  initialBeverages,
  initialProfiles,
}: {
  initialBeverages: Beverage[]
  initialProfiles: Profile[]
}) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleApprove = async (id: string) => {
    const { data, error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', id).select()
    if (error || !data || data.length === 0) {
      alert("Fehler beim Freischalten (fehlende Berechtigung?): " + (error?.message || "Keine Änderungen vorgenommen."))
    } else {
      setProfiles(profiles.map(p => p.id === id ? { ...p, is_approved: true } : p))
      router.refresh()
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm("Profil wirklich ablehnen und löschen?")) return
    const { data, error } = await supabase.from('profiles').delete().eq('id', id).select()
    if (error || !data || data.length === 0) {
      alert("Fehler beim Löschen (fehlende Berechtigung?): " + (error?.message || "Keine Änderungen vorgenommen."))
    } else {
      setProfiles(profiles.filter(p => p.id !== id))
      router.refresh()
    }
  }

  const handleExportCsv = async () => {
    setIsExporting(true)
    const { data: consumptions, error } = await supabase.from('consumptions').select('user_id, beverage_id, quantity')
    if (error) {
      alert("Fehler beim Laden der Daten: " + error.message)
      setIsExporting(false)
      return
    }

    const rows = [["Name", "Email", "Telefon", "Gesamtkosten", "Getränke (Anzahl)"]]
    
    const approvedProfiles = profiles.filter(p => p.is_approved !== false)
    approvedProfiles.forEach(profile => {
      const userConsumptions = consumptions.filter(c => c.user_id === profile.id)
      let totalCost = 0
      let totalDrinks = 0
      userConsumptions.forEach(c => {
        const bev = initialBeverages.find(b => b.id === c.beverage_id)
        if (bev) {
          totalCost += Number(bev.price) * c.quantity
          totalDrinks += c.quantity
        }
      })
      if (totalDrinks > 0) {
        rows.push([
          profile.full_name || "Unbekannt",
          profile.email,
          profile.phone || "",
          totalCost.toFixed(2).replace('.', ','),
          totalDrinks.toString()
        ])
      }
    })

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(";")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `zeltlager_abrechnung_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsExporting(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mx-auto max-w-7xl">
      
      <AdminNav />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Camper Verwaltung</h1>
        <p className="text-muted-foreground mt-2">
          Verwalte Profile, Freigaben und exportiere Daten.
        </p>
      </div>

      {profiles.filter(p => p.is_approved === false && p.role !== 'admin').length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Offene Freigaben</CardTitle>
            <CardDescription>Diese Nutzer warten im Warteraum auf deine Bestätigung.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-background overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead className="text-right">Aktion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.filter(p => p.is_approved === false && p.role !== 'admin').map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || "Nicht angegeben"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" onClick={() => handleApprove(user.id)} className="bg-green-600 hover:bg-green-700">
                          Annehmen
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(user.id)}>
                          Ablehnen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Camper (Profile)</CardTitle>
            <CardDescription>Liste aller registrierten Nutzer</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={handleExportCsv} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            CSV Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                      Keine User gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((user) => (
                    <TableRow key={user.id} className="group">
                      <TableCell className="font-medium">{user.full_name || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        {user.is_approved ? (
                          <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full font-medium">Freigeschaltet</span>
                        ) : (
                          <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded-full font-medium">Wartet</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger render={<Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" />}>
                            <Info className="h-4 w-4" />
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Camper Details</DialogTitle>
                              <DialogDescription>
                                Vollständige Informationen zu {user.full_name || "Unbekannt"}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-sm text-muted-foreground">Name</span>
                                <span className="col-span-2">{user.full_name || "-"}</span>
                              </div>
                              <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-sm text-muted-foreground">Email</span>
                                <span className="col-span-2">{user.email}</span>
                              </div>
                              <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-sm text-muted-foreground">Telefon</span>
                                <span className="col-span-2">{user.phone || "-"}</span>
                              </div>
                              <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-sm text-muted-foreground">Rolle</span>
                                <span className="col-span-2">{user.role}</span>
                              </div>
                              <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-sm text-muted-foreground">Status</span>
                                <span className="col-span-2">
                                  {user.is_approved ? "Freigeschaltet" : "Wartet auf Freigabe"}
                                </span>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
  )
}
