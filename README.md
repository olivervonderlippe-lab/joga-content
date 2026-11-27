# JOGA Content

Board · Wochenreview · Drehplan · Hooks · Moves. Single-File-App (index.html), Daten in Netlify Blobs, KI über Anthropic.

## Deploy
1. Neues GitHub-Repo, diese Dateien pushen (index.html ist mit committet – Netlify baut sie trotzdem neu).
2. Netlify: „Import from Git“ → Repo wählen. Build command und Publish dir kommen aus netlify.toml.
3. Environment variables setzen:
   - `ANTHROPIC_API_KEY` – für die Hook-Impulse
   - `APP_PIN` – frei wählbar, z. B. 4–6 Ziffern. Ohne PIN kann jeder mit der URL deine Daten lesen und ändern.
4. Deploy. Beim ersten Öffnen PIN eingeben; sie bleibt im Browser gespeichert.

## Lokal bauen
```
npm install
npm run build      # erzeugt index.html aus src/
```
Ohne Netlify (nur Datei öffnen) läuft die App offline und speichert lokal im Browser.

## Dateien
- `src/app.jsx` – die App
- `src/input.css` – Styles
- `src/seed_moves.json` – Start-Bibliothek (aus JOGA 2.0 + 22 Flows)
- `src/template.html`, `src/font.txt` – Hülle und Melvinsone
- `netlify/functions/data.mjs` – Speicher (GET/PUT /api/data)
- `netlify/functions/joga.mjs` – KI-Impulse (POST /api/joga)

## V2 (Sept 2026)
- Vierter Typ US (Gespräch/Bedürfnisse). Jeder Typ wird an seiner Kennzahl gemessen: DO Saves, REACH Follower, ME und US Kommentare je View.
- Teststart 15.09.2026, Review-Fragen auf den Community-Test angepasst (6 Fragen).
- Moves haben ein Feld „Fähigkeit/Alltagsziel“; Drehplan und Hooks starten bei der Fähigkeit, nicht beim Körperbereich.
- Drehplan schlägt Schnitte vor, du wählst aus (vorausgewählt: Routine, REACH-Version, eine JOGA-Minute).

## Stundenwerkstatt (Reiter STUNDEN)
Klassenplan-Entwicklung: Reihe, Vergleich, Stundenprofil, Entscheidungen, Varianten, Starter-Module (60/45/30/20). Daten und Logik in `src/werkstatt_core.js` (identisch in der Journeys-App), Ansicht in `src/werkstatt_view.jsx`. Gespeichert im App-Zustand (`state.werkstatt`), also zusammen mit dem Rest in Netlify Blobs bzw. lokal.

## Kachel-Generator

Pieces mit Format „Kachel“ zeigen im Abschnitt Post den Kachel-Generator. Er zeichnet zwei Folien (1080 × 1350) im Canvas:
Folie 1 mit Foto aus `stills/`, Hook (Anton, Versalien) und Kernsatz, Folie 2 mit Fakten oder Balken, Einordnung und Quelle (Oswald).
Schriften sind als Latin-Subset in `src/tile_fonts.css` eingebettet, der Renderer liegt in `src/tile_render.js`, die Vorbelegung der Kacheln 01 bis 40 in `TILE_DATA` in `src/app.jsx` (Schlüssel: Titel). Eigene Änderungen stehen im Piece unter `tile`.
Fotos: `stills/still-NN.jpg` (1080 × 1920) und `stills/thumb-NN.jpg`.

## Sprüche / „Spruch des Tages“

- Format `Spruch` (Gruppe „Stimme und Sprüche“): ein Satz auf einem Foto, Feed 1080×1350 und Story 1080×1920.
- HEUTE → „Spruch des Tages“: zufälliger, noch nicht geposteter Spruch (wechselt den Topf), Foto wechseln, Text oben/unten, Ausschnitt, Teilen/Speichern, „Als gepostet markieren“ (Spruch fällt aus dem Pool).
- Ich-Sprüche (`tile.ich`) kommen erst nach Freigabe (`tile.freigabe`, Häkchen im Spruch-Editor) in die Verlosung.
- Sprüche erscheinen in Produktion nur, wenn der Format-Filter auf „Spruch“ steht; der Zufallsgenerator ignoriert sie.
- Import: `sprueche-001-100.json` über Produktion → ÜBERSICHT → Import. Neue Fotos: `stills/still-NN.jpg` + `thumb-NN.jpg` ablegen und `STILLS` in `src/app.jsx` ergänzen.
