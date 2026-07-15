'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-destructive/10 p-4 rounded-full mb-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Hoppla! Es gab ein Problem</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Es gab ein Problem bei der Verbindung zum Kühlwagen. Bitte überprüfe deine Internetverbindung und lade die Seite neu.
      </p>
      <Button onClick={() => reset()} size="lg" className="gap-2">
        <RefreshCcw className="w-4 h-4" />
        Seite neuladen
      </Button>
    </div>
  )
}
