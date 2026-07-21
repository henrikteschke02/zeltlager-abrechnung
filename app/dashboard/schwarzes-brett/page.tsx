import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { NewsBoard } from "@/components/news-board"

export const metadata = {
  title: "Schwarzes Brett | Zeltlager Manager",
  description: "News und Ankündigungen für das Zeltlager.",
}

export default async function SchwarzesBrettPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_approved')
    .eq('id', user.id)
    .single()

  if (!profile?.full_name) {
    return redirect("/dashboard/profile")
  }

  if (profile?.role !== 'admin' && profile?.is_approved === false) {
    const { Warteraum } = await import("@/components/warteraum")
    return <Warteraum />
  }

  const { data: news } = await supabase
    .from('news')
    .select('id, title, content, created_at, author_id, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: requests } = await supabase
    .from('news_delete_requests')
    .select('id, news_id, requester_id, profiles(full_name)')

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schwarzes Brett</h1>
          <p className="text-muted-foreground mt-2">
            Alle Neuigkeiten und Ankündigungen auf einen Blick.
          </p>
        </div>
        
        <NewsBoard 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialNews={(news as any) || []} 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialRequests={(requests as any) || []}
          isAdmin={profile.role === 'admin'} 
          userId={user.id} 
        />
      </div>
    </div>
  )
}
