"use client"

import { useMemo, useState, useEffect } from "react"
import { Crown, BarChart3, Medal } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Profile = { id: string; full_name: string; avatar_url: string | null }
type Beverage = { id: string; name: string; price: number }
type Consumption = { id: string; user_id: string; beverage_id: string; quantity: number }

type LeaderboardViewProps = {
  profiles: Profile[]
  beverages: Beverage[]
  consumptions: Consumption[]
  initialTab: string
}

export function LeaderboardView({ profiles, beverages, consumptions: initialConsumptions, initialTab }: LeaderboardViewProps) {
  const [consumptions, setConsumptions] = useState<Consumption[]>(initialConsumptions)
  const supabase = createClient()

  // Echtzeit-Updates abonnieren
  useEffect(() => {
    const channel = supabase.channel('realtime_consumptions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'consumptions' }, (payload) => {
        setConsumptions(prev => [...prev, payload.new as Consumption])
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'consumptions' }, (payload) => {
        setConsumptions(prev => prev.filter(c => c.id !== payload.old.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // 1. Leaderboard Aggregation
  const leaderboardStats = useMemo(() => {
    const bierBeverage = beverages.find(b => b.name.toLowerCase().includes('bier'))
    
    const userStats: Record<string, { totalDrinks: number; bierDrinks: number }> = {}
    
    consumptions.forEach(c => {
      if (!userStats[c.user_id]) {
        userStats[c.user_id] = { totalDrinks: 0, bierDrinks: 0 }
      }
      userStats[c.user_id].totalDrinks += c.quantity
      if (bierBeverage && c.beverage_id === bierBeverage.id) {
        userStats[c.user_id].bierDrinks += c.quantity
      }
    })

    // Finde Bierkönig (Max Bier)
    let maxBier = 0
    let bierKoenigId: string | null = null
    Object.entries(userStats).forEach(([userId, stats]) => {
      if (stats.bierDrinks > maxBier) {
        maxBier = stats.bierDrinks
        bierKoenigId = userId
      }
    })

    const rankedUsers = profiles
      .map(p => ({
        ...p,
        totalDrinks: userStats[p.id]?.totalDrinks || 0,
        bierDrinks: userStats[p.id]?.bierDrinks || 0,
        isBierKoenig: p.id === bierKoenigId && maxBier > 0
      }))
      .filter(p => p.totalDrinks > 0)
      .sort((a, b) => b.totalDrinks - a.totalDrinks)

    return rankedUsers
  }, [profiles, beverages, consumptions])

  // 2. Globale Statistik Aggregation
  const globalStats = useMemo(() => {
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

  return (
    <Tabs defaultValue={initialTab === "stats" ? "stats" : "leaderboard"} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="leaderboard"><Medal className="w-4 h-4 mr-2" /> Leaderboard</TabsTrigger>
        <TabsTrigger value="stats"><BarChart3 className="w-4 h-4 mr-2" /> Lager-Statistik</TabsTrigger>
      </TabsList>
      
      {/* LEADERBOARD TAB */}
      <TabsContent value="leaderboard" className="space-y-4">
        {leaderboardStats.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
            Das Lager ist noch komplett nüchtern!
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboardStats.map((user, index) => (
              <Card key={user.id} className={`overflow-hidden border-none shadow-sm ${index === 0 ? 'bg-amber-500/10 ring-1 ring-amber-500/50' : 'bg-card'}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  
                  <div className="flex-shrink-0 w-8 text-center font-black text-2xl text-muted-foreground/50">
                    {index + 1}.
                  </div>
                  
                  <div className="relative">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center font-bold text-lg text-muted-foreground">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {user.isBierKoenig && (
                      <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-950 p-1 rounded-full shadow-lg" title="Bierkönig 👑">
                        <Crown className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-lg leading-tight">
                      {user.full_name}
                    </p>
                    {user.isBierKoenig && <p className="text-xs text-amber-600 font-semibold">Der Bierkönig 👑 ({user.bierDrinks}x Bier)</p>}
                  </div>
                  
                  <div className="text-right">
                    <div className="font-black text-xl">{user.totalDrinks}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Drinks</div>
                  </div>
                  
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* STATISTIK TAB */}
      <TabsContent value="stats">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Gesamt-Konsum</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {globalStats.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Noch keine Daten verfügbar.
              </div>
            ) : (
              <div className="divide-y">
                {globalStats.map((stat, i) => (
                  <div key={i} className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary font-bold w-10 h-10 rounded-full flex items-center justify-center text-lg">
                        {stat.count}
                      </div>
                      <span className="font-semibold text-lg">{stat.name}</span>
                    </div>
                    <span className="font-bold text-muted-foreground">
                      {stat.totalCost.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
