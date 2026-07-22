"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Megaphone, Trash2, Send, Loader2, UserMinus, Check, X } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type NewsItem = {
  id: string
  title: string
  content: string
  created_at: string
  author_id: string
  profiles: {
    full_name: string | null
  }
}

type DeleteRequest = {
  id: string
  news_id: string
  requester_id: string
  profiles: {
    full_name: string | null
  }
}

type NewsBoardProps = {
  initialNews: NewsItem[]
  initialRequests: DeleteRequest[]
  isAdmin: boolean
  userId: string
}

export function NewsBoard({ initialNews, initialRequests, isAdmin, userId }: NewsBoardProps) {
  const [news, setNews] = useState<NewsItem[]>(initialNews)
  const [requests, setRequests] = useState<DeleteRequest[]>(initialRequests)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Echtzeit-Updates für News und Löschanfragen abonnieren
  useEffect(() => {
    const channel = supabase.channel('realtime_news_board')
      // --- NEWS ---
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news' }, async (payload) => {
        // Da im Realtime-Payload die Relation (profiles) fehlt, laden wir den kompletten Datensatz nach
        const { data } = await supabase.from('news').select('id, title, content, created_at, author_id, profiles(full_name)').eq('id', payload.new.id).single()
        if (data) {
          setNews(prev => {
            if (prev.some(n => n.id === data.id)) return prev // Duplikate durch Optimistic Update vermeiden
            return [data as unknown as NewsItem, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          })
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'news' }, (payload) => {
        setNews(prev => prev.filter(n => n.id !== payload.old.id))
        setRequests(prev => prev.filter(r => r.news_id !== payload.old.id))
      })
      // --- NEWS DELETE REQUESTS ---
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news_delete_requests' }, async (payload) => {
        const { data } = await supabase.from('news_delete_requests').select('id, news_id, requester_id, profiles(full_name)').eq('id', payload.new.id).single()
        if (data) {
          setRequests(prev => {
            if (prev.some(r => r.id === data.id)) return prev
            return [...prev, data as unknown as DeleteRequest]
          })
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'news_delete_requests' }, (payload) => {
        setRequests(prev => prev.filter(r => r.id !== payload.old.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

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
      setRequests(requests.filter(r => r.news_id !== id))
    }
  }

  const handleRequestDelete = async (newsId: string) => {
    const { data, error } = await supabase
      .from('news_delete_requests')
      .insert([{ news_id: newsId, requester_id: userId }])
      .select('*, profiles(full_name)')
      .single()

    if (error) {
      alert("Fehler beim Anfragen: " + error.message)
    } else if (data) {
      setRequests([...requests, data as unknown as DeleteRequest])
    }
  }

  const handleApproveRequest = async (newsId: string) => {
    // Wenn genehmigt, löschen wir die News (und die DB löscht die Anfragen automatisch via CASCADE)
    const { error } = await supabase.from('news').delete().eq('id', newsId)
    if (error) {
      alert("Fehler beim Löschen: " + error.message)
    } else {
      setNews(news.filter(n => n.id !== newsId))
      setRequests(requests.filter(r => r.news_id !== newsId))
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    const { error } = await supabase.from('news_delete_requests').delete().eq('id', requestId)
    if (error) {
      alert("Fehler beim Ablehnen: " + error.message)
    } else {
      setRequests(requests.filter(r => r.id !== requestId))
    }
  }

  const myPendingRequests = requests.filter(r => news.some(n => n.id === r.news_id && n.author_id === userId))

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
        
        {myPendingRequests.length > 0 && (
          <div className="bg-destructive/10 border-destructive/20 border p-4 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-destructive flex items-center gap-2">
              <UserMinus className="w-4 h-4" />
              Löschanfragen für deine Posts
            </h4>
            {myPendingRequests.map(req => {
              const newsItem = news.find(n => n.id === req.news_id)
              return (
                <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-background p-3 rounded-lg border text-sm gap-2">
                  <div>
                    <span className="font-semibold">{req.profiles.full_name}</span> möchte deinen Post &quot;{newsItem?.title}&quot; löschen.
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveRequest(req.news_id)}>
                      <Check className="w-4 h-4 mr-1" /> Erlauben (Löschen)
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRejectRequest(req.id)}>
                      <X className="w-4 h-4 mr-1" /> Ablehnen
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

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

        <div className="space-y-3">
          {news.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              Keine Neuigkeiten. Alles läuft nach Plan!
            </p>
          ) : (
            news.map(item => {
              const canDeleteDirectly = isAdmin || item.author_id === userId
              const hasRequested = requests.some(r => r.news_id === item.id && r.requester_id === userId)
              
              return (
                <div key={item.id} className="bg-background p-4 rounded-xl border relative group">
                  <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {canDeleteDirectly ? (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive h-8 w-8"
                        onClick={() => handleDelete(item.id)}
                        title="Direkt löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    ) : hasRequested ? (
                      <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded">
                        Löschen angefragt
                      </span>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-muted-foreground h-8 text-xs"
                        onClick={() => handleRequestDelete(item.id)}
                      >
                        <UserMinus className="w-3 h-3 mr-1" /> Löschen anfragen
                      </Button>
                    )}
                  </div>
                <h3 className="font-bold text-lg mb-1 pr-8">{item.title}</h3>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-2">{item.content}</p>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Von {item.profiles?.full_name || 'Unbekannt'} • {new Date(item.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} Uhr
                </div>
              </div>
            )
          })
        )}
        </div>
      </CardContent>
    </Card>
  )
}
