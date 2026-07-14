"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Megaphone, Trash2, Send, Loader2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type NewsItem = {
  id: string
  title: string
  content: string
  created_at: string
  profiles: {
    full_name: string | null
  }
}

type NewsBoardProps = {
  initialNews: NewsItem[]
  isAdmin: boolean
  userId: string
}

export function NewsBoard({ initialNews, isAdmin, userId }: NewsBoardProps) {
  const [news, setNews] = useState<NewsItem[]>(initialNews)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    const { data, error } = await supabase
      .from('news')
      .insert([{ title, content, author_id: userId }])
      .select('*, profiles(full_name)')
      .single()

    if (error) {
      alert("Fehler beim Posten: " + error.message)
    } else if (data) {
      setNews([data as unknown as NewsItem, ...news])
      setTitle("")
      setContent("")
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("News wirklich löschen?")) return
    const { error } = await supabase.from('news').delete().eq('id', id)
    if (!error) {
      setNews(news.filter(n => n.id !== id))
    }
  }

  return (
    <Card className="border-primary/20 shadow-sm bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          Schwarzes Brett
        </CardTitle>
        <CardDescription>Aktuelle Infos der Lagerleitung</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {isAdmin && (
          <form onSubmit={handlePost} className="space-y-3 bg-background p-4 rounded-xl border">
            <h4 className="text-sm font-bold">Neue Durchsage erstellen</h4>
            <Input 
              placeholder="Titel..." 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
            <Textarea 
              placeholder="Inhalt der Nachricht..." 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              required 
              rows={3}
            />
            <Button type="submit" disabled={loading} size="sm" className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Veröffentlichen
            </Button>
          </form>
        )}

        <div className="space-y-3">
          {news.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              Keine Neuigkeiten. Alles läuft nach Plan!
            </p>
          ) : (
            news.map(item => (
              <div key={item.id} className="bg-background p-4 rounded-xl border relative group">
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive h-8 w-8"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <h3 className="font-bold text-lg mb-1 pr-8">{item.title}</h3>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-2">{item.content}</p>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Von {item.profiles?.full_name || 'Lagerleitung'} • {new Date(item.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} Uhr
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
