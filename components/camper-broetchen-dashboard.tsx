"use client"

import { useState } from "react"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { Plus, Minus, Loader2, Croissant } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export type BroetchenItem = {
  id: string
  name: string
  preis: number
  image_name?: string | null
}

export type BroetchenOrder = {
  id: string
  session_id: string
  user_id: string
  product_id: string
  menge: number
  created_at: string
}

export function CamperBroetchenDashboard({
  userId,
  sessionId,
  items = [],
  initialOrders = [],
}: {
  userId: string
  sessionId: string
  items?: BroetchenItem[]
  initialOrders?: BroetchenOrder[]
}) {
  const supabase = createClient()
  const [orders, setOrders] = useState<BroetchenOrder[]>(initialOrders)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const updateQuantity = async (item: BroetchenItem, delta: number) => {
    if (loadingId) return
    setLoadingId(item.id)
    
    // Find existing order for this item in this session
    const existingOrder = orders.find(o => o.product_id === item.id)
    const currentQty = existingOrder ? existingOrder.menge : 0
    const newQty = currentQty + delta

    if (newQty < 0) {
      setLoadingId(null)
      return
    }

    try {
      if (newQty === 0 && existingOrder) {
        // Delete order
        const { error } = await supabase
          .from("broetchen_orders")
          .delete()
          .eq("id", existingOrder.id)
        if (error) throw error
        setOrders(prev => prev.filter(o => o.id !== existingOrder.id))
      } else if (newQty > 0 && !existingOrder) {
        // Insert order
        const { data, error } = await supabase
          .from("broetchen_orders")
          .insert({
            session_id: sessionId,
            user_id: userId,
            product_id: item.id,
            menge: newQty
          })
          .select()
          .single()
        if (error) throw error
        setOrders(prev => [...prev, data])
      } else if (newQty > 0 && existingOrder) {
        // Update order
        const { data, error } = await supabase
          .from("broetchen_orders")
          .update({ menge: newQty })
          .eq("id", existingOrder.id)
          .select()
          .single()
        if (error) throw error
        setOrders(prev => prev.map(o => o.id === existingOrder.id ? data : o))
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Brötchen:", error)
    } finally {
      setLoadingId(null)
    }
  }

  const totalCost = orders.reduce((sum, order) => {
    const item = items.find((i) => i.id === order.product_id)
    return sum + (item?.preis || 0) * order.menge
  }, 0)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mx-auto max-w-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brötchen Vorbestellung</h1>
          <p className="text-muted-foreground mt-2">
            Wähle deine Brötchen für das nächste Frühstück aus.
          </p>
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="font-semibold text-lg flex items-center gap-2">
            <Croissant className="w-5 h-5 text-primary" />
            Meine Vorbestellung
          </div>
          <div className="text-2xl font-bold text-primary">
            {totalCost.toFixed(2).replace(".", ",")} €
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(item => {
          const qty = orders.find(o => o.product_id === item.id)?.menge || 0
          return (
            <Card key={item.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md">
              <div className="h-32 bg-secondary/30 relative flex items-center justify-center p-4">
                {item.image_name ? (
                  <Image
                    src={`/images/${item.image_name}`}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <Croissant className="w-12 h-12 text-primary/20" />
                )}
              </div>
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="font-semibold text-lg">{item.name}</div>
                  <div className="font-mono bg-secondary px-2 py-1 rounded text-sm">
                    {Number(item.preis).toFixed(2).replace(".", ",")} €
                  </div>
                </div>
                
                <div className="mt-auto flex items-center justify-between bg-secondary/20 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item, -1)}
                    disabled={qty === 0 || loadingId === item.id}
                    className="hover:bg-background rounded-md h-10 w-10 shrink-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <div className="font-bold text-lg w-12 text-center select-none flex items-center justify-center">
                    {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : qty}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item, 1)}
                    disabled={loadingId === item.id}
                    className="hover:bg-background rounded-md h-10 w-10 shrink-0 text-primary"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
