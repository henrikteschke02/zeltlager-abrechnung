"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Camera, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

type ProfileFormProps = {
  userId: string
  initialProfile: {
    fullName: string
    phone: string
    avatarUrl: string
  }
}

export function ProfileForm({ userId, initialProfile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialProfile.fullName)
  const [phone, setPhone] = useState(initialProfile.phone)
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true)
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setAvatarUrl(data.publicUrl)
    } catch (error: any) {
      alert("Fehler beim Upload: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
      })
      .eq('id', userId)

    setIsSaving(false)

    if (error) {
      alert("Fehler beim Speichern: " + error.message)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-accent border-4 border-background shadow-lg flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <label className="absolute inset-0 w-full h-full rounded-full cursor-pointer bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <span className="text-xs text-white font-medium">Ändern</span>}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  disabled={isUploading}
                  className="hidden" 
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Profilbild (optional)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Vollständiger Name <span className="text-destructive">*</span></Label>
            <Input 
              id="fullName" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Max Mustermann"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Handynummer (optional)</Label>
            <Input 
              id="phone" 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 151 12345678"
            />
            <p className="text-xs text-muted-foreground">Hilft der Lagerleitung im Notfall</p>
          </div>

          <Button type="submit" className="w-full" disabled={isSaving || !fullName.trim()}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Profil speichern
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
