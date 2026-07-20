# KI-Anweisungen & Projekt-Kontext

## 1. Projektübersicht
Web-App zur digitalen Verwaltung von Getränken, Grillfleisch und Brötchen für ein Zeltlager. 

## 2. Dokumentations-Regeln (ABSOLUTE PFLICHT!)
Die Dateien `readme.md` und `progress.md` haben völlig unterschiedliche Zielgruppen. DU DARFST NIEMALS DEN INHALT DER EINEN DATEI IN DIE ANDERE KOPIEREN!

- **`readme.md` (Für die Öffentlichkeit & andere Entwickler):** Das ist das offizielle Aushängeschild. Hier steht AUSSCHLIESSLICH: Was ist das Projekt? Welche Features gibt es? Wie lautet der Tech-Stack? Wie lauten die konkreten Installations-Befehle (z. B. `npm install`, `.env` Setup, `npm run dev`), um das Projekt lokal zu starten? Hier gibt es KEINE chronologischen Updates und KEIN Tagebuch!
- **`progress.md` (Für mich privat):** Das ist mein persönliches Entwickler-Tagebuch. Hier steht chronologisch, *was* wir *wann* und *warum* gebaut haben. Es dient meiner eigenen Erinnerung und Dokumentation der Arbeitsschritte.


## 3. Der Trigger-Befehl für Doku-Updates
Wenn der User den Befehl **"Aktualisiere die Doku"** gibt, musst du:
1. Die `readme.md` prüfen und ggf. um neue Haupt-Features ergänzen.
2. Einen neuen, detaillierten Eintrag in der `progress.md` verfassen, der dem User genau erklärt, welche Dateien angefasst wurden und wie die Funktionen arbeiten.

## 4. Design-System (STRIKT)
"High-End Editorial / Magazine"-Look. 
- Background: Olivgrün (`#4c503d`). 
- Cards: Beige (`#E5E4DE`) oder Glassmorphism (`bg-white/5`, `backdrop-blur`). 
- Akzent: Neon-Limette (`#D9FF3D`). 
- Font: Serif für Headlines/Preise, Sans-Serif für den Rest.

## 5. Text Humanizer (Schreibstil-Regeln für alle Markdown-Dateien)
Überarbeite alle generierten Texte für die Dokumentation so, dass sie natürlich und wie von einem Menschen geschrieben wirken. Gehe bei jedem Text-Output folgende Checkliste durch:

- **Floskeln & Füllwörter streichen:** Entferne Phrasen wie "es ist wichtig zu beachten", "zusammenfassend", "spielt eine wichtige Rolle", "unterstreicht die Bedeutung".
- **Struktur entkrampfen:** Keine "Fazit"- oder "Zusammenfassungs"-Absätze am Ende. Absätze müssen nicht symmetrisch sein.
- **Formatierung natürlicher machen:** Fettdruck nur für wirklich zentrale Begriffe, kein Fettdruck-Overkill. Listen nur, wenn eine echte Aufzählung nötig ist, sonst Fließtext. Keine Emojis vor Überschriften.
- **Rhetorik abschleifen:** Keine Trikolons erzwingen ("A, B und C"), wenn zwei Begriffe reichen. Häufung von "darüber hinaus/außerdem/ferner" reduzieren.
- **Vage Autoritäten prüfen:** Übertriebene Bedeutungsaufladungen ("Wendepunkt", "Schlüsselmoment") zurücknehmen.
- **Ton & Anrede:** Keine Chatbot-Höflichkeitsfloskeln ("Ich hoffe, das hilft"). Text soll klingen wie ein menschlicher Entwickler, der einem anderen Entwickler ein kurzes, klares Update gibt.
