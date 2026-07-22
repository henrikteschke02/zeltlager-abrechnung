"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2, MessageSquareOff } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AdminNav } from "@/components/admin-nav"

type FeedbackItem = {
  id: string
  message: string
  created_at: string
  profiles: {
    full_name: string | null
  } | null
}

export function AdminFeedbackDashboard({
  initialFeedback,
}: {
  initialFeedback: FeedbackItem[]
}) {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(initialFeedback)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm("Feedback wirklich löschen/archivieren?")) return
    
    setDeletingId(id)
    const { error } = await supabase.from("feedback").delete().eq("id", id)
    
    if (error) {
      alert("Fehler beim Löschen: " + error.message)
    } else {
      setFeedbackList((prev) => prev.filter((f) => f.id !== id))
      router.refresh()
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mx-auto max-w-7xl">
      
      <AdminNav />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback & Support</h1>
        <p className="text-muted-foreground mt-2">
          Hier findest du alle Nachrichten, die von Campern über die Hilfe-Seite gesendet wurden.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Posteingang</CardTitle>
            <CardDescription>Neue Nachrichten von den Campern</CardDescription>
          </CardHeader>
          <CardContent>
            {feedbackList.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                <MessageSquareOff className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-semibold text-lg">Kein Feedback vorhanden</p>
                <p className="text-sm mt-1">Die Camper scheinen wunschlos glücklich zu sein!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbackList.map((item) => (
                  <div key={item.id} className="relative group bg-white/5 dark:bg-black/20 border rounded-2xl p-5 hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold font-sans">
                            {item.profiles?.full_name || "Unbekannter Camper"}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                            {new Date(item.created_at).toLocaleString("de-DE", { 
                              day: "2-digit", month: "2-digit", year: "numeric", 
                              hour: "2-digit", minute: "2-digit" 
                            })}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap opacity-90">
                          {item.message}
                        </p>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
