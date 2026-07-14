# 🏕️ Zeltlager-Abrechnung (Manager)

Eine moderne, digitale Zeltlager-App zur Getränke- und Snack-Abrechnung für alle Camper. Schluss mit aufgeweichten Papier-Strichlisten am Kühlwagen – hier kommt der digitale Deckel! 🍻

## 🚀 Live-Status
Die App wird erfolgreich über **Vercel** gehostet und ist für alle Camper rund um die Uhr online verfügbar. Dank der Cloud-Architektur sind alle Daten sicher und in Echtzeit synchronisiert.

## 💻 Tech-Stack
Dieses Projekt wurde mit modernsten Web-Technologien gebaut:
- **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **Backend & Auth:** Supabase (PostgreSQL, Authentifizierung)
- **Sicherheit & Daten:** Supabase Row Level Security (RLS) & Realtime-Subscriptions
- **Hosting:** Vercel

## ✨ Aktuelle Features

- **⚡ Echtzeit-Synchronisation (Realtime):** 
  Konsum-Einträge, Deckel-Werte und Durchsagen auf dem Schwarzen Brett (News) aktualisieren sich auf allen Geräten sofort, ohne dass die Seite neu geladen werden muss.
- **📱 Responsive Design:** 
  Extrem kompakter Einhand-Modus für Smartphones (perfekt für die schnelle Bedienung direkt am Kühlwagen) sowie ein großzügiges, übersichtliches Dashboard für Laptops und Tablets.
- **🛒 Intuitives Getränke-Buchungssystem:** 
  Cleveres Mengen-Popup verhindert versehentliche Fehlklicks. Für den Großeinkauf gibt es eine direkte "Kisten-Buchung" (z. B. 24 Flaschen Veltins auf einmal).
- **↩️ Sichere Storno-Funktion:** 
  Fehlkürzungen? Kein Problem! Stornierungen sind innerhalb einer 3-Minuten-Frist möglich und direkt im Buchungs-Kontext (ohne lästiges Scrollen) greifbar.
- **🔐 Rollenbasiertes System:** 
  Strenge Trennung zwischen Campern und Admins. Gesichert durch robuste Row Level Security (RLS) direkt in der Supabase-Datenbank. Camper sehen nur ihren eigenen Deckel, Admins behalten den vollen Überblick.

---

## 🛠️ Lokales Setup (Für Entwickler)

Möchtest du lokal an der App weiterarbeiten oder neue Module (wie Grillfleisch oder Brötchen) entwickeln? So startest du das Projekt auf deinem PC:

1. **Repository klonen & Abhängigkeiten installieren:**
   ```bash
   git clone https://github.com/henrikteschke02/zeltlager-abrechnung.git
   cd zeltlager-abrechnung
   npm install
   ```

2. **Umgebungsvariablen konfigurieren:**
   Erstelle im Hauptverzeichnis eine Datei namens `.env.local` und füge deine Supabase-Zugangsdaten ein:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_supabase_anon_key
   ```

3. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```
   Öffne anschließend [http://localhost:3000](http://localhost:3000) in deinem Browser, um das Ergebnis zu sehen.

---
*Gebaut mit 💛 für Zeltlager und reibungslose Abläufe!*
