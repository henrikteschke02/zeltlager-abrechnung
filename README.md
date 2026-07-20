# zeltlager-abrechnung

Digitale Strichliste für Getränke, Grillfleisch und Brötchen — gebaut für den Einsatz am Kühlwagen, nicht am Schreibtisch.

Erster MVP entstand mit Lovable. Diese Version ist der Rewrite mit Next.js + Supabase und einer vernünftigen Architektur.

**Tech-Stack:** Next.js 15 (App Router), React, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL + RLS), Vercel.

Live auf Vercel, CI/CD läuft automatisch bei jedem Push auf `main`.

---

## Quickstart

```bash
npm run dev
```

Läuft auf [http://localhost:3000](http://localhost:3000).

---

## Module

**Getränke-Deckel** — Camper buchen Getränke per Touch, der persönliche Schuldenstand wird live aktualisiert. Reset um 7:00 Uhr morgens. Gamification über den „Zeltlager-Elch" (21 Stufen).

**Grillfleisch** — Buchung pro Person, Grill-Deckel läuft unabhängig vom Getränke-Deckel.

**Brötchen** — Vorbestellung für den nächsten Morgen, noch in Arbeit.

---

## Changelog

### Phase 1 — Foundation & Auth
Next.js 15 + Tailwind + shadcn/ui aufgesetzt. Supabase Auth (E-Mail/Passwort) mit serverseitigen Sessions. Seiten: `/login`, `/register`, `/dashboard` (Middleware-geschützt).

### Phase 2 — Rollen & Admin-Panel
`profiles`-Tabelle, Postgres-Trigger legt bei Registrierung automatisch ein Profil mit Rolle `camper` an. RLS-Problem mit infinite recursion gelöst durch eine `is_admin()`-Funktion mit `SECURITY DEFINER`. Admin-Dashboard unter `/dashboard/admin`: Getränke verwalten (hinzufügen, löschen, umbenennen, Preise ändern), Nutzerübersicht.

### Phase 3 & 4 — Camper-Frontend, Storno, Profile
Getränke-Dashboard mit Optimistic UI — Buchungen erscheinen sofort, ohne auf die DB zu warten. 3-Minuten-Storno mit Live-Countdown; RLS verhindert `DELETE` nach Ablauf serverseitig. Profil-Pflicht beim ersten Login (Name), optionale Telefonnummer, Avatar-Upload in Supabase Storage (`avatars`-Bucket).

### Phase 5 & 6 — Gamification, Realtime, Admin-Features
Leaderboard unter `/dashboard/leaderboard` mit Live-Rangliste und Bierkönig-Badge. Supabase Realtime hält Deckel, Leaderboard und Schwarzes Brett auf allen Geräten synchron. Elch-Gamification: Punkte pro Getränk (+1.0 Bier, -1.0 Wasser usw.), 21 Stufen. Sicheres Buchen per Modal statt Direktklick. CSV-Export der Endabrechnung für den Kassenwart. Schwarzes Brett mit Echtzeit-Posts und Löschanfrage-Workflow.

### Phase 7 — Deployment
Vercel-Deployment, automatische CI/CD-Pipeline. Supabase-Keys über Vercel Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Vercel erzwingt strikte TypeScript/ESLint-Regeln — nur getrackte Dateien werden gebaut.

### Phase 8 — Approval-Workflow
Neue Nutzer landen nach der Profil-Vervollständigung im Warteraum. Admins sehen offene Freigaben und können per Klick freischalten oder ablehnen. Auf DB-Ebene blockiert RESTRICTIVE RLS alle Zugriffe solange `is_approved = false`.

### Phase 9 — Security Audit
Codebase auf Hardcoded Secrets geprüft (`SUPABASE_SERVICE_ROLE_KEY`, DB-Strings, JWTs, `.env`-Leaks in der Git-Historie). Alle Verbindungen laufen über `NEXT_PUBLIC` Environment Variables.

### Phase 10 — Editorial Design
Neues Design-System: Olivgrün `#4c503d` als Hintergrund, Beige `#E5E4DE` für Karten (`rounded-3xl`, `shadow-2xl`), Neon-Limette `#D9FF3D` als Akzent. Serif (Playfair Display) für Logos und Preiszahlen, Sans-Serif (Manrope) für alles andere. shadcn/ui und Anime.js integriert, globale Toasts via `sonner`. Camping-Loader (animierte Zeltlager-Szene von Uiverse) ersetzt den alten Liquid-Loader, als CSS Module implementiert wegen generischer Klassennamen wie `.time`, `.door`, `.fire`.

### Phase 11 — Grillfleisch-Modul
`/dashboard/grillfleisch` mit eigenem `CamperGrillDashboard` — komplett unabhängiger State vom Getränke-Deckel. Gleicher Sticky-Banner-Look (`#E5E4DE`, Serif-Preis, Toggle Gesamt/Tag), gleiches Glassmorphism-Grid (`bg-white/5`, `backdrop-blur-md`, `border-white/10`). Karten zeigen Food-Fotos, Name, Preis und `+1`-Badge. 3-Minuten-Storno. Dummy-Daten für vier Fleischsorten; DB-Calls als `TODO:` vorbereitet. Admin-Placeholder unter `/dashboard/admin/grillfleisch`.

### Phase 12 — Getränke-UI-Sync & Drink-Fotografie
Getränke-Karten auf denselben Stand wie Grillfleisch gebracht: Glassmorphism-Grid, quadratische Fotos, `+1`-Badge. Deckel-Banner nutzt jetzt hart-kodierte Farbwerte statt theme-abhängiger Tokens. Zehn Markenflaschen-Shots für `public/images/drinks/` (Veltins, Bitburger 0,0, Bitburger Radler, Krombacher Radler, Fassbrause, Emsland Wasser, Coca-Cola, Fanta, Sprite, Schöfferhofer Grapefruit) — auf olivem Studiohintergrund, nahtlos im UI. `getBeverageImage()` matcht per Keyword-Suche auf den DB-Namen, SVG-Icons als Fallback. `ai-anweisungen.md` neu angelegt als Steuerdatei für KI-Sessions.

---

## Offene Punkte
- Supabase-Tabellen `grill_items` & `grill_orders` anlegen, RLS setzen, `TODO:`-Kommentare aktivieren
- Admin-CRUD für Grillfleisch (`/dashboard/admin/grillfleisch`)
- Brötchen-Modul (`/dashboard/broetchen`)
