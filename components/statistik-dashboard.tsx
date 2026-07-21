"use client"

import { useState } from "react"
import { Calculator, Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
}

export function StatistikDashboard({ data }: StatistikDashboardProps) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4c503d]/50" />
          <Input 
            type="search" 
            placeholder="Camper suchen..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/50 border-[#4c503d]/20 text-[#4c503d] placeholder:text-[#4c503d]/40 focus-visible:ring-[#4c503d]"
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
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      {row.fullName}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-800">
                      {row.getraenkeSum.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 text-right text-slate-800">
                      {row.grillSum.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
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
