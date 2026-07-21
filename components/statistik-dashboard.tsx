"use client"

import { useState } from "react"
import { Calculator, Download, Search, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export type StatistikRow = {
  userId: string
  fullName: string
  getraenkeSum: number
  grillSum: number
  broetchenSum: number
  totalSum: number
}

interface StatistikDashboardProps {
  data: StatistikRow[]
  isAdmin: boolean
}

export function StatistikDashboard({ data, isAdmin }: StatistikDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = data.filter(row => 
    row.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleExportCSV = () => {
    // CSV Header (semicolon separated)
    const header = ["Camper Name", "Ausgaben Getränke (€)", "Ausgaben Grillfleisch (€)", "Ausgaben Brötchen (€)", "Gesamtsumme (€)"]
    
    // Rows
    const rows = filteredData.map(row => [
      row.fullName,
      row.getraenkeSum.toFixed(2).replace('.', ','),
      row.grillSum.toFixed(2).replace('.', ','),
      row.broetchenSum.toFixed(2).replace('.', ','),
      row.totalSum.toFixed(2).replace('.', ',')
    ])

    const csvContent = [
      header.join(";"),
      ...rows.map(r => r.join(";"))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Zeltlager_Abrechnung_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isAdmin) {
    const myData = data[0] || { getraenkeSum: 0, grillSum: 0, broetchenSum: 0, totalSum: 0 }
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card className="bg-white border-0 shadow-lg overflow-hidden rounded-xl">
          <CardHeader className="bg-black/5 border-b border-black/10 pb-4">
            <CardTitle className="text-center font-bold text-[#4c503d] flex items-center justify-center gap-2">
              <Receipt className="w-5 h-5" />
              Mein Kassenbon
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center text-[#4c503d]">
              <span className="font-medium">Getränke</span>
              <span>{myData.getraenkeSum.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center text-[#4c503d]">
              <span className="font-medium">Grillfleisch</span>
              <span>{myData.grillSum.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground/80">
              <span className="font-medium">Brötchen</span>
              <span>{myData.broetchenSum.toFixed(2)} €</span>
            </div>
            
            <div className="pt-4 mt-2 border-t border-dashed border-[#4c503d]/30">
              <div className="flex justify-between items-center text-xl font-bold text-[#4c503d]">
                <span>Gesamtsumme</span>
                <span>{myData.totalSum.toFixed(2)} €</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
          <Input 
            type="search" 
            autoComplete="off"
            placeholder="Camper suchen..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus-visible:ring-white/50"
          />
        </div>
        <Button 
          onClick={handleExportCSV}
          className="w-full sm:w-auto bg-[#4c503d] text-[#E5E4DE] hover:bg-[#4c503d]/90 gap-2 font-semibold"
        >
          <Download className="h-4 w-4" />
          Gesamtabrechnung als CSV exportieren
        </Button>
      </div>

      <Card className="bg-white/40 backdrop-blur-md border-white/20 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-900 uppercase bg-black/10 border-b border-black/20">
              <tr>
                <th className="px-6 py-4 font-bold">Camper Name</th>
                <th className="px-6 py-4 font-bold text-right">Getränke</th>
                <th className="px-6 py-4 font-bold text-right">Grillfleisch</th>
                <th className="px-6 py-4 font-bold text-right">Brötchen</th>
                <th className="px-6 py-4 font-bold text-right text-slate-900">Gesamtsumme</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.userId} className="border-b border-black/10 hover:bg-white/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {row.fullName}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {row.getraenkeSum.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {row.grillSum.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {row.broetchenSum.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 bg-black/[0.03]">
                      {row.totalSum.toFixed(2)} €
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-600 font-medium">
                    Keine Camper gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
