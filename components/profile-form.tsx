"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Camera, Loader2 } from "lucide-react"
import Image from "next/image"

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
    members?: string | null
  }
}

export function ProfileForm({ userId, initialProfile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialProfile.fullName)
  const [phone, setPhone] = useState(initialProfile.phone)
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl)
  const [members, setMembers] = useState(initialProfile.members || "")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const PREDEFINED_AVATARS = [
    { id: "tent", emoji: "🏕️", bg: "bg-emerald-100 dark:bg-emerald-900" },
    { id: "fire", emoji: "🔥", bg: "bg-orange-100 dark:bg-orange-900" },
    { id: "hotdog", emoji: "🌭", bg: "bg-red-100 dark:bg-red-900" },
    { id: "owl", emoji: "🦉", bg: "bg-amber-100 dark:bg-amber-900" },
    { id: "backpack", emoji: "🎒", bg: "bg-blue-100 dark:bg-blue-900" },
    { id: "canoe", emoji: "🛶", bg: "bg-cyan-100 dark:bg-cyan-900" },
    { id: "bear", emoji: "🐻", bg: "bg-stone-100 dark:bg-stone-800" },
    { id: "guitar", emoji: "🎸", bg: "bg-purple-100 dark:bg-purple-900" },
  ]
  
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        members: members,
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
          
          {/* Avatar Auswahl */}
          <div className="space-y-4 mb-8">
            <Label>Profilbild (optional)</Label>
            
            <div className="flex flex-col items-center gap-6">
              {/* Current Avatar Preview */}
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-accent border-4 border-background shadow-lg flex items-center justify-center text-4xl">
                  {avatarUrl ? (
                    avatarUrl.startsWith('http') || avatarUrl.startsWith('/') || avatarUrl.startsWith('blob:') ? (
                      <Image src={avatarUrl} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <span>{avatarUrl}</span>
                    )
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <label className="absolute inset-0 w-full h-full rounded-full cursor-pointer bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                  {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <span className="text-xs text-white font-medium text-center">Eigenes<br/>Uploaden</span>}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                    disabled={isUploading}
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Predefined Avatars */}
              <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground text-center">Oder wähle einen Zeltlager-Avatar:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {PREDEFINED_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setAvatarUrl(avatar.emoji)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${avatar.bg} ${
                        avatarUrl === avatar.emoji ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''
                      }`}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
            <Label htmlFor="members">Mitglieder (optional)</Label>
            <Input 
              id="members" 
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="z.B. Anna, Tom, Lisa"
            />
            <p className="text-xs text-muted-foreground">Falls ihr als Familie einen gemeinsamen Deckel nutzt, tragt hier die Namen ein.</p>
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
