"use client"

import { useState } from "react"
import { Calculator, Download, Search, Receipt } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect } from "react"
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

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const isVibe = mounted && theme === 'vibe'

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
      <div className="max-w-md mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className={isVibe ? 'bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden rounded-2xl relative text-white' : 'bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 shadow-2xl overflow-hidden rounded-2xl relative'}>
          {/* Dekorative Kassenbon-Zackenkante oben */}
          <div className="absolute top-0 left-0 right-0 h-3" style={{ backgroundImage: 'linear-gradient(-45deg, transparent 33.33%, rgba(255,255,255,0.1) 33.33%, rgba(255,255,255,0.1) 66.66%, transparent 66.66%), linear-gradient(45deg, transparent 33.33%, rgba(255,255,255,0.1) 33.33%, rgba(255,255,255,0.1) 66.66%, transparent 66.66%)', backgroundSize: '12px 24px' }}></div>
          
          <CardHeader className="pt-8 pb-4 text-center">
            <div className={`mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-inner`}>
              <Receipt className={`w-6 h-6 ${isVibe ? 'text-white' : 'text-[#4c503d] dark:text-white'}`} />
            </div>
            <CardTitle className={`font-black text-2xl tracking-tight ${isVibe ? 'text-white' : 'text-[#4c503d] dark:text-white'}`}>
              Abrechnung
            </CardTitle>
            <p className={`font-medium mt-1 ${isVibe ? 'text-slate-300' : 'text-[#4c503d]/80 dark:text-white/80'}`}>{myData.fullName}</p>
          </CardHeader>

          <CardContent className="px-6 pb-8 space-y-5">
            <div className="space-y-4">
              <div className={`flex justify-between items-center ${isVibe ? 'text-slate-300' : 'text-[#4c503d]/90 dark:text-white/90'}`}>
                <span className="font-medium tracking-wide">Getränke</span>
                <span className={`font-semibold ${isVibe ? 'text-white' : ''}`}>{myData.getraenkeSum.toFixed(2)} €</span>
              </div>
              <div className={`flex justify-between items-center ${isVibe ? 'text-slate-300' : 'text-[#4c503d]/90 dark:text-white/90'}`}>
                <span className="font-medium tracking-wide">Grillfleisch</span>
                <span className={`font-semibold ${isVibe ? 'text-white' : ''}`}>{myData.grillSum.toFixed(2)} €</span>
              </div>
              <div className={`flex justify-between items-center ${isVibe ? 'text-slate-300' : 'text-[#4c503d]/70 dark:text-white/70'}`}>
                <span className="font-medium tracking-wide">Brötchen</span>
                <span className={`font-semibold ${isVibe ? 'text-white' : ''}`}>{myData.broetchenSum.toFixed(2)} €</span>
              </div>
            </div>
            
            <div className={`pt-5 mt-2 border-t-2 border-dashed ${isVibe ? 'border-white/20' : 'border-black/10 dark:border-white/20'}`}>
              <div className={`flex justify-between items-center text-2xl font-black ${isVibe ? 'text-cyan-400' : 'text-[#D9FF3D]'}`}>
                <span className="tracking-tight">Gesamtsumme</span>
                <span>{myData.totalSum.toFixed(2)} €</span>
              </div>
            </div>
          </CardContent>
          
          {/* Dekorative Kassenbon-Zackenkante unten */}
          <div className="absolute bottom-0 left-0 right-0 h-3" style={{ backgroundImage: 'linear-gradient(-45deg, transparent 33.33%, rgba(255,255,255,0.1) 33.33%, rgba(255,255,255,0.1) 66.66%, transparent 66.66%), linear-gradient(45deg, transparent 33.33%, rgba(255,255,255,0.1) 33.33%, rgba(255,255,255,0.1) 66.66%, transparent 66.66%)', backgroundSize: '12px 24px', backgroundPosition: 'bottom' }}></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-900" />
          <Input 
            type="search" 
            autoComplete="off"
            placeholder="Camper suchen..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/50 dark:bg-white/90 border-black/20 text-slate-900 placeholder:text-slate-700 focus-visible:ring-slate-900/50 font-medium"
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

      <Card className={isVibe ? 'bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden' : 'bg-white/40 backdrop-blur-md border border-black/10 dark:border-white/20 overflow-hidden shadow-sm'}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className={`text-xs uppercase border-b ${isVibe ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-black/10 border-black/20 text-slate-900'}`}>
              <tr>
                <th className="px-6 py-4 font-bold">Camper Name</th>
                <th className="px-6 py-4 font-bold text-right">Getränke</th>
                <th className="px-6 py-4 font-bold text-right">Grillfleisch</th>
                <th className="px-6 py-4 font-bold text-right">Brötchen</th>
                <th className={`px-6 py-4 font-bold text-right ${isVibe ? 'text-white' : 'text-slate-900'}`}>Gesamtsumme</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.userId} className={`border-b transition-colors ${isVibe ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-white/40'}`}>
                    <td className={`px-6 py-4 font-semibold whitespace-nowrap ${isVibe ? 'text-white' : 'text-slate-900'}`}>
                      {row.fullName}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${isVibe ? 'text-white' : 'text-slate-900'}`}>
                      {row.getraenkeSum.toFixed(2)} €
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${isVibe ? 'text-white' : 'text-slate-900'}`}>
                      {row.grillSum.toFixed(2)} €
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${isVibe ? 'text-white' : 'text-slate-900'}`}>
                      {row.broetchenSum.toFixed(2)} €
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${isVibe ? 'text-cyan-400 bg-white/5' : 'text-slate-900 bg-black/[0.03]'}`}>
                      {row.totalSum.toFixed(2)} €
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={`px-6 py-8 text-center font-medium ${isVibe ? 'text-slate-400' : 'text-slate-600'}`}>
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
