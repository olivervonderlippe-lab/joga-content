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
