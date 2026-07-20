# Entwickler-Tagebuch

Dieses Dokument ist kein Schaufenster — es erklärt chronologisch, wie und warum Dinge gebaut wurden. Für das Was gibt es die readme.md.

---

## 2026-07-16 — CampingLoader & Grillfleisch-Grundgerüst

### Warum ein neuer Loader?

Der alte Liquid-Loader war eine generische SVG-Animation ohne Bezug zum Zeltlager-Thema. Als Uiverse-Replacement wurde eine vollständige Zeltlager-Szene (Zelt, Lagerfeuer, Bäume, Tag-Nacht-Zyklus) gewählt.

Das eigentliche Problem beim Einbauen: Der Uiverse-Code nutzt Klassennamen wie `.time`, `.door`, `.fire`, `.smoke` — alles globale Kollisionskandidaten. Lösung: CSS Modules. Die Datei `CampingLoader.module.css` kapselt alles, der Compiler generiert zur Buildzeit einzigartige Hashes. Im JSX kommt durchgängig `className={styles.xxx}` zum Einsatz, camelCase statt kebab-case.

**Angefasste Dateien:**
- `components/ui-verse/CampingLoader.module.css` (neu)
- `components/ui-verse/CampingLoader.tsx` (neu)
- `app/dashboard/loading.tsx` — Import von LiquidLoader auf CampingLoader umgehängt

### Grillfleisch-Seite

Die Seite war bisher ein Platzhalter. Der Aufbau folgt exakt dem Muster der Getränke-Seite — gleiches Auth-Guard-Pattern in der Page, separate Client-Komponente für den interaktiven Teil.

Wichtigste Designentscheidung: `CamperGrillDashboard` hat seinen eigenen State für Bestellungen und Deckel. Kein geteilter Context mit Getränken — die beiden Module sind komplett unabhängig, auch wenn das UI identisch aussieht.

Die DB-Tabellen (`grill_items`, `grill_orders`) existieren noch nicht. Alle Supabase-Calls sind als `TODO:`-Kommentare vorbereitet; bis dahin laufen Dummy-Daten (vier Fleischsorten).

**Angefasste Dateien:**
- `components/camper-grill-dashboard.tsx` (neu)
- `app/dashboard/grillfleisch/page.tsx` (neu)
- `app/dashboard/admin/grillfleisch/page.tsx` (neu, Placeholder)
- `public/images/{steak,bratwurst,bauchspeck,haehnchen}.png` (neu, KI-generiert)

---

## 2026-07-16 — Getränke-UI auf Grillfleisch-Stand bringen

Die Getränke-Seite hatte nach dem Editorial-Overhaul (Phase 10) noch das alte Karten-Layout — zentrierte Icons, `bg-card`-Token für den Deckel. Beides wurde auf den neuen Standard umgestellt.

**Deckel-Karte:** `bg-card text-card-foreground` wurde durch `style={{ backgroundColor: "#E5E4DE", color: "#4c503d" }}` ersetzt. Der Grund: theme-abhängige Tokens verhalten sich im Darkmode anders als erwartet. Hart-kodierte Werte sind hier die zuverlässigere Wahl.

**Getränke-Grid:** Die Karten wurden strukturell umgebaut. Vorher: `<button>` mit zentriertem Icon + Text. Nachher: Flex-Column, oben ein `aspect-square`-Bildbereich, unten eine Zeile mit Name/Preis links und dem `+1`-Badge rechts. Glassmorphism via `bg-white/5 backdrop-blur-md border-white/10`, Hover-Glow in `#D9FF3D`.

**Angefasste Dateien:**
- `components/camper-beverage-dashboard.tsx` — zwei Stellen: Deckel-Card className + Beverage-Button-Struktur

---

## 2026-07-16 → 2026-07-20 — Drink-Fotografie (Gläser → Flaschen)

### Erste Iteration: Gläser

Sechs Glas-Fotos (Pils, Radler, Cola, Fanta, Schöfferhofer, Mio Mate) auf olivem Hintergrund `#4c503d`, generiert per KI-Bildgenerierung. In der Komponente wurde `getBeverageImage()` eingefügt — eine Funktion, die den DB-Getränkenamen per Keyword-Suche auf einen Bildpfad mappt. Kein Match → `null` → SVG-Icon-Fallback.

Gleichzeitig wurde `next/image` mit `fill` + `object-cover` eingebaut, damit die Bilder den quadratischen Bereich sauber ausfüllen ohne Seitenverhältnis-Probleme.

### Zweite Iteration: Markenflaschen

Auf Wunsch wurden die Glas-Fotos durch stehende Markenflaschen ersetzt — 10 Produkte, cinematic studio lighting, gleicher Olivhintergrund. Neu dazugekommen: Veltins, Fassbrause, Emsland Wasser, Sprite, Krombacher Radler (mit eigenem Bild statt generischem Radler-Fallback), Bitburger Radler als eigener Eintrag.

Das Mapping wurde überarbeitet: spezifischere Patterns stehen vor allgemeineren, damit `"Bitburger Radler"` nicht fälschlicherweise das Pils-Bild zieht. Reihenfolge im Code:

1. Schöfferhofer / grapefruit
2. Krombacher + radler
3. Bitburger + radler
4. radler (generischer Fallback)
5. Bitburger / 0,0 / 0.0
6. Veltins, Fassbrause, Wasser/Emsland, Cola, Fanta, Sprite, Mate/Mio

**Angefasste Dateien:**
- `components/camper-beverage-dashboard.tsx` — `Image`-Import, `getBeverageImage()` erweitert
- `public/images/drinks/*.png` — 10 Flaschen-Fotos (einige überschreiben die alten Glas-Fotos)

---

## 2026-07-20 — ai-anweisungen.md

Neue Datei im Projekt-Root. Zweck: KI-Sessions in zukünftigen Chats mit dem nötigen Kontext versorgen, ohne jedes Mal alles neu erklären zu müssen.

Enthält fünf Abschnitte: Projektübersicht, Dokumentations-Regeln (README = Schaufenster, progress.md = Tagebuch), Trigger-Befehl für Doku-Updates, Design-System-Tokens und einen Text-Humanizer-Styleguide gegen Chatbot-Sprache in der Dokumentation.

**Angefasste Dateien:**
- `ai-anweisungen.md` (neu)
