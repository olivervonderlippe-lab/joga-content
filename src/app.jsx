const { useState, useEffect, useMemo, useRef } = React;

/* ---------- Basis ---------- */
const TYPES = ['REACH', 'DO', 'ME', 'US'];
const TYPE_INFO = { REACH: 'neue Menschen holen', DO: 'Mitmachen / Nutzwert', ME: 'Oliver / Haltung', US: 'Gespräch / Bedürfnisse' };
// Primäre Kennzahl je Typ: daran wird grün/rot gemessen
const TYPE_METRIC = { REACH: 'followers', DO: 'saves', ME: 'comments', US: 'comments' };
const US_QUESTIONS = [
  'Was willst du mit 70 noch können?',
  'Was fällt dir heute schwerer als vor zehn Jahren?',
  'Welche Bewegung fehlt dir im Alltag?',
  'Was hast du als Kind gekonnt und heute verlernt?',
  'Wann hast du zuletzt auf dem Boden gesessen – freiwillig?',
  'Welche Treppe nervt dich am meisten?',
  'Was würdest du gern wieder ohne Nachdenken tun?',
  'Für wen willst du mit 70 noch beweglich sein?',
  'Was machst du morgens als Erstes gegen die Steifheit?',
  'Ihr habt gesagt: … Also machen wir heute genau das.',
];
const SKILLS = ['vom Boden aufstehen', 'Treppen steigen', 'Schuhe binden', 'über Kopf greifen', 'Balance halten', 'auf einem Bein stehen', 'mit Enkeln auf dem Boden spielen', 'wandern', 'lange sitzen ohne Schmerz', 'ruhig schlafen'];
const AREAS = ['Hüfte', 'Rücken', 'Nacken/Schulter', 'Beine', 'Hände', 'Augen', 'Balance', 'Kraft', 'Boden', 'Atem', 'Ganzkörper'];
const SITUATIONS = ['morgens eingerostet', 'nach 8 Stunden Sitzen', 'bevor du aufs Sofa gehst', 'vom Boden aufstehen', 'Treppe ohne Schnaufen', 'Schuhe binden', 'nach dem Autofahren', 'vor dem Einschlafen'];
const PATTERNS = {
  REACH: [
    { name: 'Versprechen + Zahl', form: '[N] Moves, die [Wirkung]', ex: '2 Moves, die dich 20 Jahre jünger wirken lassen.' },
    { name: 'Superlativ-Behauptung', form: 'Die [Adjektiv] [Sache] der Welt', ex: 'Die geilste Bewegungsroutine der Welt.' },
    { name: 'Fähigkeit mit 70', form: 'Mach das, damit du mit 70 noch [Fähigkeit]', ex: 'Mach das, damit du mit 70 noch ohne Hände vom Boden hochkommst.' },
    { name: 'Diagnose-Umkehr', form: 'Du bist nicht [X]. Du bist [Y].', ex: 'Du bist morgens nicht alt. Du bist eingerostet.' },
  ],
  DO: [
    { name: 'Nutzen + Dauer', form: '1 MINUTE JOGA – [NUTZEN]', ex: '1 MINUTE JOGA – FÜR DEINE HÜFTE' },
    { name: 'Situation + Dauer', form: '1 MINUTE JOGA – [SITUATION]', ex: '1 MINUTE JOGA – NACH 8 STUNDEN SITZEN' },
    { name: 'Körperteil spricht', form: 'Dein [Körperteil] [Zustand] gerade.', ex: 'Dein Nacken hasst dich gerade.' },
    { name: 'Ersatz', form: '[Bewegung] statt [Gewohnheit]', ex: 'Mach das statt Kaffee.' },
  ],
  US: [
    { name: 'Große Frage', form: 'Was willst du mit 70 noch können?', ex: 'Meine Antwort kennst du. Jetzt interessiert mich deine.' },
    { name: 'Vergleich zu früher', form: 'Was fällt dir heute schwerer als vor zehn Jahren?', ex: 'Bei mir: Schuhe binden im Stehen.' },
    { name: 'Lücke im Alltag', form: 'Welche Bewegung fehlt dir im Alltag?', ex: 'Nicht Sport. Bewegung.' },
    { name: 'Ihr habt gesagt', form: 'Ihr habt gesagt: [Problem]. Also machen wir heute genau das.', ex: 'Petra will mit 70 noch mit den Enkeln auf dem Boden spielen. Petra: Diese 3 sind für dich.' },
  ],
  ME: [
    { name: 'Nicht für X, sondern Y', form: 'Mit 56 [tue ich] nicht mehr für [X]. Sondern für [Y].', ex: 'Mit 56 trainiere ich nicht mehr für Optik. Sondern dafür, mit 70 noch beweglich zu sein.' },
    { name: 'Damals / heute', form: 'Was ich mit 56 anders mache als mit 36.', ex: 'Mit 56 zählt Pause mehr als Puls.' },
    { name: 'Heute ehrlich', form: 'Heute [Zustand]. Also [Handlung].', ex: 'Heute hatte ich keinen Bock. Also zehn Minuten.' },
    { name: 'Objekt-Metapher', form: 'Dein Körper ist kein [Objekt].', ex: 'Dein Körper ist kein Campingstuhl.' },
  ],
};
const GOALS_DEFAULT = { saves: 0.019, followers: 0.008, comments: 0.00035, commentsUS: 0.001, start: '2026-09-15', weeks: 4 };
const BASELINE = [
  { id: 'b1', date: '2026-08-27', type: 'DO', hook: 'Die geilste Bewegungsroutine der Welt', len: 48, recutOf: '', views: 159536, v3: 78180, saves: 3171, reacts: 1918, shares: 132, comments: 36, followers: 846, notes: 'Baseline' },
  { id: 'b2', date: '2026-08-31', type: 'REACH', hook: '2 Moves, die dich 20 Jahre jünger wirken lassen', len: 16, recutOf: '', views: 189986, v3: 88975, saves: 2864, reacts: 2919, shares: 182, comments: 38, followers: 1656, notes: 'Baseline' },
  { id: 'b3', date: '2026-09-02', type: 'ME', hook: 'Mit 56 trainiere ich nicht mehr für Optik', len: 28, recutOf: '', views: 205624, v3: 128831, saves: 2146, reacts: 2347, shares: 114, comments: 80, followers: 1313, notes: 'Baseline' },
];
const REVIEW_Q = [
  'Kommentieren dieselben Namen wiederholt?',
  'Funktioniert „1 Minute JOGA“ wiederholt?',
  'Reagieren Menschen auf Oliver – nicht nur auf die Übung?',
  'ME-Videos: weniger Views, mehr Gespräch?',
  'Taucht „meine JOGA-Minute“ von selbst auf?',
  'Welche Bedürfnisse/Themen tauchen wiederholt in Kommentaren auf?',
];
// Bewertung eines Reels nach der Kennzahl seines Typs: 'ok' | 'bad' | null
function verdict(r, g) {
  if (r.views === '' || r.views == null) return null;
  const m = TYPE_METRIC[r.type] || 'saves';
  const v = pct(r[m], r.views); if (v == null) return null;
  const goal = m === 'saves' ? g.saves : m === 'followers' ? g.followers : (r.type === 'US' ? g.commentsUS : g.comments);
  return v >= goal ? 'ok' : 'bad';
}
const fmtP3 = (x) => x == null ? '–' : (x * 100).toFixed(x < 0.001 ? 3 : 2).replace('.', ',') + ' %';

const uid = () => Math.random().toString(36).slice(2, 9);
const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
// Zeitzonensicher: reines UTC-Kalenderrechnen. (Die frühere Version rechnete lokal und gab UTC aus – in Hamburg verschob das jedes Datum um einen Tag zurück.)
const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const dayDiff = (a, b) => Math.round((new Date(a + 'T00:00:00Z') - new Date(b + 'T00:00:00Z')) / 864e5); // a − b in Tagen
const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const wdName = (iso) => WD[new Date(iso + 'T00:00:00Z').getUTCDay()];
const fmtD = (iso) => iso ? iso.slice(8, 10) + '.' + iso.slice(5, 7) + '.' : '';
const pct = (a, b) => (b > 0 && a !== '' && a != null) ? a / b : null;
const fmtP = (x) => x == null ? '–' : (x * 100).toFixed(2).replace('.', ',') + ' %';
const fmtN = (x) => (x == null || x === '') ? '–' : Number(x).toLocaleString('de-DE');
const weekOf = (iso, goals) => { if (!iso) return null; const s = new Date(goals.start), d = new Date(iso); const diff = Math.floor((d - s) / 864e5); if (diff < 0) return 0; return Math.floor(diff / 7) + 1; };
const weekLabel = (w) => w === 0 ? 'Base' : 'W' + w;

/* ---------- Speicher ---------- */
const PIN_KEY = 'joga_pin';
const api = {
  headers() { return { 'content-type': 'application/json', 'x-joga-pin': localStorage.getItem(PIN_KEY) || '' }; },
  async load() { const r = await fetch('/api/data', { headers: this.headers() }); if (r.status === 401) throw new Error('PIN'); if (!r.ok) throw new Error('Laden fehlgeschlagen'); return r.json(); },
  async save(state) { const r = await fetch('/api/data', { method: 'PUT', headers: this.headers(), body: JSON.stringify(state) }); if (r.status === 401) throw new Error('PIN'); if (!r.ok) throw new Error('Speichern fehlgeschlagen'); return r.json(); },
  async ki(type, params) { const r = await fetch('/api/joga', { method: 'POST', headers: this.headers(), body: JSON.stringify({ type, params }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error || 'KI-Fehler'); return d.lines; },
};
const emptyState = () => ({ v: 1, goals: GOALS_DEFAULT, reels: BASELINE, reviews: {}, moves: SEED_MOVES, shoots: [], hookNotes: [], oliContent: OLI_SEED, content: [], tests: [], contentMigrated: false });

/* ---------- Oli-Content-Bibliothek ---------- */
const OLI_FORMATS = ['Oli Geht', 'Oli Klärt', 'Typisch Mann', 'Oli Bewegt Hamburg'];
const OLI_STATUS = ['Idee', 'Skript fertig', 'gedreht', 'gepostet'];
// Seed aus JOGA_Oli_Drehscripte_V1_2_Audit.docx (Stand 23.09.2026) — die vier
// priorisierten Oli-Klärt-Folgen und die vier "Kopf sagt 26"-Piloten stehen
// bereits mit fertigem Skript, der Rest als Idee/Reserve.
const OLI_SEED = [
  { id: uid(), format: 'Oli Klärt', title: 'UNTER 10.000 SCHRITTEN ZÄHLT\'S NICHT?', status: 'Skript fertig',
    script: 'Oli: "Zum Glück kann dein Körper nicht zählen."\n\nEinordnung: Große Dosis-Wirkungs-Metaanalyse 2025 (Ding et al., Lancet Public Health, 57 Studien/35 Kohorten): Knickpunkt bei ca. 5.000–7.000 Schritten, 7.000 vs. 2.000 = 47% niedrigeres Sterberisiko. 10.000 bleiben sinnvoll, sind aber keine magische Grenze.\n\nSchluss: "7.842? Dein Körper sagt nicht: schade."\n\nQuelle: Ding D et al., Lancet Public Health 2025;10(8):e668–e681. PMID 40713949.', src: 'V1.2-Audit' },
  { id: uid(), format: 'Oli Klärt', title: 'STEIF? DANN MUSST DU MEHR DEHNEN.', status: 'Skript fertig',
    script: 'Oli: "Oder stärker werden."\n\nEinordnung: Dehnen verbessert ROM. Aber Krafttraining über volle Bewegungsamplitude kann ROM ähnlich gut verbessern (Alizadeh et al. 2023: ES=0,73 Krafttraining, kein signifikanter Unterschied zu Stretching ES=0,08 p=0,79).\n\nDemo: passive Dehnung → gleiche Richtung aktiv unter Kraft.\n\nSchluss: "Beweglichkeit kann man dehnen. Und belasten."\n\nQuelle: Alizadeh S et al., Sports Med 2023;53(3):707–722. PMID 36622555.', src: 'V1.2-Audit' },
  { id: uid(), format: 'Oli Klärt', title: 'BALANCE HAT MAN. ODER EBEN NICHT.', status: 'Skript fertig',
    script: 'Oli steht auf einem Bein, wackelt kurz: "Praktisch. Dann könnte ich jetzt aufhören."\n\nEinordnung: Balance ist trainierbar, gut belegt in der Sturzpräventions-Forschung; WHO empfiehlt älteren Erwachsenen multikomponentes Training mit Balance und Kraft.\n\nDemo: Progression Boden → ein Bein → Kopfbewegung/Reach.\n\nSchluss: "Wackeln ist nicht das Gegenargument. Wackeln ist das Training."', src: 'V1.2-Audit' },
  { id: uid(), format: 'Oli Klärt', title: 'KNIE NIE ÜBER DIE ZEHEN?', status: 'Skript fertig',
    script: 'Oli: "Dann wird eine Kniebeuge ziemlich kompliziert."\n\nDemo: einmal künstlich mit fast senkrechtem Schienbein squatten, dann natürlich.\n\nEinordnung: Fry et al. 2003 (7 krafttrainierte Männer) – künstliche Begrenzung der Knievorverlagerung senkt Kniedrehmoment, erhöht aber Hüftdrehmoment stark. Nicht die 1070%-Zahl verwenden, nur die Richtung.\n\nSchluss: "Nicht die Zehen sind die rote Linie."\n\nQuelle: Fry AC et al., J Strength Cond Res 2003;17(4):629–633. PMID 14636100.', src: 'V1.2-Audit' },
  { id: uid(), format: 'Oli Klärt', title: 'ZU ALT FÜR MUSKELAUFBAU?', status: 'Idee',
    script: 'Reserve für Staffel 2. Oli: "Deine Muskeln haben keinen Rentenbescheid bekommen." Quelle: de Santana DA et al., Experimental Gerontology 2024. PMID 39579806.', src: 'V1.2-Audit' },
  { id: uid(), format: 'Oli Klärt', title: 'VOR SPORT: ERST MAL LANGE DEHNEN?', status: 'Idee',
    script: 'Reserve für Staffel 2. Statisches Dehnen explizit, nicht pauschal "Dehnen". Quelle: Herbert & Gabriel, BMJ 2002;325:468. PMID 12202327.', src: 'V1.2-Audit' },
  { id: uid(), format: 'Oli Klärt', title: 'IST PILATES KRAFTTRAINING?', status: 'Idee',
    script: 'Später/differenziert drehen, nicht als Pilotfolge – Studienlage uneinheitlich. "Die nervige Antwort: kommt drauf an."', src: 'V1.2-Audit' },
  { id: uid(), format: 'Typisch Mann', title: 'KOPF SAGT: SOCKE. 3 SEKUNDEN.', status: 'Skript fertig',
    script: 'Oli versucht Socke im Stehen anzuziehen. Wackler. Fuß runter. Neuer Versuch. Wand.\nBottom erst am Ende: "KÖRPER HAT RÜCKFRAGEN."\nOli trocken: "Geht doch."\n\nKontrollierbar: kein Tier/Kind/Passant nötig.', src: 'V1.2-Audit' },
  { id: uid(), format: 'Typisch Mann', title: 'KOPF SAGT: ICH STEH EINFACH AUF.', status: 'Skript fertig',
    script: 'Oli sitzt auf dem Boden. Beginnt aufzustehen, stoppt, sortiert Beine neu, Hand dazu, kurzer Blick aufs Sofa – entscheidet sich bewusst für saubere Variante, steht auf.\nEnde: "KÖRPER: WIR BESPRECHEN DAS KURZ."\nWichtig: nicht künstlich 90-jährig spielen, Humor aus dem Mikro-Moment des Planens.', src: 'V1.2-Audit' },
  { id: uid(), format: 'Typisch Mann', title: 'KOPF: KANN ICH.', status: 'Skript fertig',
    script: 'Oli sieht eleganten Mobility-Move auf dem eigenen Handy.\nCut: Startposition. Cut: kurzer Versuch. Cut: Oli sitzt/liegt da, schaut in Kamera.\nBottom: "KÖRPER: INTERESSANTE THEORIE."\nKein Sturz nötig, kein Slapstick.', src: 'V1.2-Audit' },
  { id: uid(), format: 'Typisch Mann', title: 'ICH DEHNE MICH NUR KURZ.', status: 'Skript fertig',
    script: 'Oli beginnt simplen Stretch. Sieht, dass noch mehr geht. Nächste Position. Noch eine. Noch eine.\nCut auf Uhr. Bottom: "37 MINUTEN SPÄTER." Oli: "Jetzt kann ich anfangen."', src: 'V1.2-Audit' },
  { id: uid(), format: 'Typisch Mann', title: 'Ich brauche keine Anleitung.', status: 'Idee',
    script: 'Reserve (verständlich/billig, aber noch zu generisch – nicht Oli-eigen genug für Pilot). Falsch zusammenbauen, Schraube übrig, heimlich Anleitung lesen.', src: 'V1.2-Audit' },
  { id: uid(), format: 'Typisch Mann', title: 'Ich mach nur schnell ein Video.', status: 'Idee',
    script: 'Reserve. Kamera/Licht aufbauen, Versprecher, Akku leer, falscher Winkel – alles selbst herstellbar, kein Tier/Kind. Bottom: "2 STUNDEN SPÄTER."', src: 'V1.2-Audit' },
  { id: uid(), format: 'Oli Geht', title: 'Ich hab beruflich jahrelang versucht, Aufmerksamkeit zu erzeugen. Jetzt entscheidet ein Algorithmus, ob ich welche bekomme.', status: 'Skript fertig',
    script: 'Richtung: Werbung vs. Creator-Leben. Selbstironie statt Algorithmus-Jammern. Konkreter Auslöser + eigene Beobachtung + Satz zum Landen nicht vergessen.', src: 'V1.2-Audit' },
  { id: uid(), format: 'Oli Geht', title: 'Warum ich Bewegung Körperpflege nenne.', status: 'Skript fertig',
    script: 'Bleibt – echte Markenhaltung, gehört zu Oli. Vergleich: niemand fragt, wie viele Reps du beim Zähneputzen schaffst.', src: 'V1.2-Audit' },
  { id: uid(), format: 'Oli Geht', title: 'Ein Video braucht 15 Sekunden. Bis es 15 Sekunden lang ist, brauchst du zwei Stunden.', status: 'Skript fertig',
    script: 'Produktionsabsurditäts-Beobachtung, kann als Oli Geht oder Comedy funktionieren.', src: 'V1.2-Audit' },
  { id: uid(), format: 'Oli Geht', title: 'Freier Wochen-Slot', status: 'Idee',
    script: 'Kein vorbereitetes Thema. Nur drehen, wenn in der Woche tatsächlich etwas passiert/auffällt. Regel: erst drehen, wenn konkreter Auslöser + eigene Beobachtung + Satz zum Landen existieren.', src: 'V1.2-Audit' },
  // Route 1 — komplett fertig ausgearbeitet (Shotlists stehen), aber laut
  // Strategie V1/V1.2-Audit bewusst geparkt bis nach Auswertung des
  // 4-Wochen-FB-Tests (12.10.2026). Status "Idee" mit explizitem Parkhinweis,
  // damit hier niemand aus Versehen einen Drehtag ansetzt.
  { id: uid(), format: 'Oli Bewegt Hamburg', title: '1. Elbphilharmonie / Marco-Polo-Terrassen', status: 'Idee',
    script: 'GEPARKT bis nach dem FB-Test (12.10.). Move: großer Sidebend → Rotation → Reach. Charakter: groß, elegant, grafisch — genug Abstand für Hochformat mit Elphi im Bild, nicht der Touristen-Standardshot. Shotlist: Establisher weit → Oli geht Richtung Terrasse ins Bild → Move ×2 Takes → Abgang: Gehen Richtung Kamera, Schuhe/Treppe, Blick zurück zur Elphi.', src: 'Oli-Content-Konzept' },
  { id: uid(), format: 'Oli Bewegt Hamburg', title: '2. Landungsbrücken', status: 'Idee',
    script: 'GEPARKT bis nach dem FB-Test (12.10.). Move: Lunge → Rotation → Reach, dynamisch, passt zu Wasser/Schiffen im Hintergrund. Kamera mit Tiefe. + Oli Geht hier: "Warum ich mit 56 manche Dinge komplett anders sehe als mit 36."', src: 'Oli-Content-Konzept' },
  { id: uid(), format: 'Oli Bewegt Hamburg', title: '3. Alter Elbtunnel', status: 'Idee',
    script: 'GEPARKT bis nach dem FB-Test (12.10.). Move: Wide Squat → Side Shift/Reach, oder eine Balance. Kamera tief und exakt mittig — Symmetrie/Fluchtpunkt ist das Bild. Kein Oli Geht hier (Akustik im Tunnel schwierig).', src: 'Oli-Content-Konzept' },
  { id: uid(), format: 'Oli Bewegt Hamburg', title: '4. Millerntor / St. Pauli', status: 'Idee',
    script: 'GEPARKT bis nach dem FB-Test (12.10.). Move: Deep Squat → Rotation, oder kraftvoller Bodenmove. Charakter: rau, frontal. + Oli Geht hier: "Warum Männer so unglaublich schlecht darin sind zuzugeben, dass sie etwas nicht können." + Comedy-B-Roll (passt zum rauen Look von Typisch Mann).', src: 'Oli-Content-Konzept' },
  { id: uid(), format: 'Oli Bewegt Hamburg', title: '5. Jungfernstieg / Binnenalster', status: 'Idee',
    script: 'GEPARKT bis nach dem FB-Test (12.10.). Move: Standing Figure Four → Rotation/Balance. Charakter: bewusst urban, Passanten dürfen durchs Bild — Kontrast hektischer Ort vs. kontrollierter Oli ist das Bild.', src: 'Oli-Content-Konzept' },
  { id: uid(), format: 'Oli Bewegt Hamburg', title: '6. Außenalster / Alsterpark', status: 'Idee',
    script: 'GEPARKT bis nach dem FB-Test (12.10.). Move: ein Balance-Move — nicht Tree Pose, zu klischeehaft. + Oli Geht hier (beste Location dafür): "Warum ich Bewegung inzwischen nicht mehr als Sport betrachte."', src: 'Oli-Content-Konzept' },
  { id: uid(), format: 'Oli Bewegt Hamburg', title: '7. Stadtpark / Planetarium', status: 'Idee',
    script: 'GEPARKT bis nach dem FB-Test (12.10.). Move: etwas Großes, athletischer. Charakter: Planetarium als klarer Hamburg-Identifier, ohne wieder Hafen zu zeigen.', src: 'Oli-Content-Konzept' },
  { id: uid(), format: 'Oli Bewegt Hamburg', title: '8. Bonus: Winterhude / Uhlenhorst', status: 'Idee',
    script: 'GEPARKT bis nach dem FB-Test (12.10.). Move: bewusst unspektakulär — "Hamburg ist nicht nur Elphi." Ort: Straßenecke, Kanal, Hofweg o. Ä. + Oli Geht hier (bewusst NICHT übers Bewegen): Vorschlag "Ich hab mein halbes Leben Werbung gemacht. Deshalb glaub ich fast nichts mehr, was auf einer Verpackung steht." (austauschbar).', src: 'Oli-Content-Konzept' },
];

/* ---------- UI-Bausteine ---------- */
const Btn = ({ children, onClick, kind = 'ghost', small, disabled, className = '' }) => (
  <button onClick={onClick} disabled={disabled} className={`btn btn-${kind} ${small ? 'btn-sm' : ''} ${className}`}>{children}</button>
);
const Field = ({ label, children, className = '' }) => (
  <label className={`field ${className}`}><span>{label}</span>{children}</label>
);
const Num = ({ value, onChange, placeholder }) => (
  <input type="number" inputMode="numeric" value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
);
const Tag = ({ children, on, onClick }) => <button className={`tag ${on ? 'on' : ''}`} onClick={onClick}>{children}</button>;

/* ---------- Board ---------- */
function ReelForm({ initial, onSave, onCancel, reels }) {
  const [r, setR] = useState(initial);
  const set = (k, v) => setR(x => ({ ...x, [k]: v }));
  return (
    <div className="sheet">
      <div className="grid2">
        <Field label="Datum"><input type="date" value={r.date} onChange={e => set('date', e.target.value)} /></Field>
        <Field label="Typ"><select value={r.type} onChange={e => set('type', e.target.value)}>{TYPES.map(t => <option key={t} value={t}>{t} – {TYPE_INFO[t]}</option>)}</select></Field>
      </div>
      <Field label="Hook / Titel"><input value={r.hook} onChange={e => set('hook', e.target.value)} placeholder="So wie es im Video steht" /></Field>
      <div className="grid2">
        <Field label="Länge (Sek.)"><Num value={r.len} onChange={v => set('len', v)} /></Field>
        <Field label="Recut von"><select value={r.recutOf} onChange={e => set('recutOf', e.target.value)}><option value="">– keins –</option>{reels.filter(x => x.id !== r.id && !x.recutOf).map(x => <option key={x.id} value={x.id}>{fmtD(x.date)} {x.hook.slice(0, 28)}</option>)}</select></Field>
      </div>
      <p className="hint">Zahlen frühestens 48 Stunden nach Veröffentlichung eintragen. Quelle: FB-Beitragsdetails.</p>
      <div className="grid3">
        <Field label="Views"><Num value={r.views} onChange={v => set('views', v)} /></Field>
        <Field label="3-Sek-Views"><Num value={r.v3} onChange={v => set('v3', v)} /></Field>
        <Field label="Saves"><Num value={r.saves} onChange={v => set('saves', v)} /></Field>
        <Field label="Reaktionen"><Num value={r.reacts} onChange={v => set('reacts', v)} /></Field>
        <Field label="Shares"><Num value={r.shares} onChange={v => set('shares', v)} /></Field>
        <Field label="Kommentare"><Num value={r.comments} onChange={v => set('comments', v)} /></Field>
      </div>
      <Field label="Netto-Follower"><Num value={r.followers} onChange={v => set('followers', v)} /></Field>
      <Field label="Was sagen die Leute?"><textarea rows={2} value={r.notes} onChange={e => set('notes', e.target.value)} /></Field>
      <div className="row end">
        <Btn onClick={onCancel}>Abbrechen</Btn>
        <Btn kind="primary" onClick={() => onSave(r)} disabled={!r.date || !r.hook}>Speichern</Btn>
      </div>
    </div>
  );
}

function Board({ state, update }) {
  const [edit, setEdit] = useState(null);
  const [filter, setFilter] = useState('ALLE');
  const g = state.goals;
  const reels = useMemo(() => [...state.reels].sort((a, b) => b.date.localeCompare(a.date)), [state.reels]);
  const shown = reels.filter(r => filter === 'ALLE' || r.type === filter);
  const save = (r) => { update(s => ({ ...s, reels: s.reels.some(x => x.id === r.id) ? s.reels.map(x => x.id === r.id ? r : x) : [...s.reels, r] })); setEdit(null); };
  const del = (id) => { if (confirm('Reel löschen?')) update(s => ({ ...s, reels: s.reels.filter(x => x.id !== id) })); setEdit(null); };
  const blank = () => ({ id: uid(), date: todayISO(), type: 'DO', hook: '', len: '', recutOf: '', views: '', v3: '', saves: '', reacts: '', shares: '', comments: '', followers: '', notes: '' });
  return (
    <section>
      <header className="head">
        <h1>Board</h1>
        <Btn kind="primary" onClick={() => setEdit(blank())}>+ Reel</Btn>
      </header>
      {edit && <ReelForm initial={edit} reels={state.reels} onSave={save} onCancel={() => setEdit(null)} />}
      <div className="row wrap">{['ALLE', ...TYPES].map(t => <Tag key={t} on={filter === t} onClick={() => setFilter(t)}>{t}</Tag>)}</div>
      {shown.length === 0 && <p className="empty">Noch kein Reel. Trag das erste Haupt-Reel ein, sobald die 48-Stunden-Zahlen da sind.</p>}
      <ul className="list">
        {shown.map(r => {
          const sp = pct(r.saves, r.views), fp = pct(r.followers, r.views), q3 = pct(r.v3, r.views), cp = pct(r.comments, r.views);
          const m = TYPE_METRIC[r.type], vd = verdict(r, g);
          const cls = (k) => (m === k && vd) ? vd : '';
          const orig = r.recutOf ? state.reels.find(x => x.id === r.recutOf) : null;
          const recutWarn = orig && orig.views && r.views !== '' && r.views < orig.views / 3;
          return (
            <li key={r.id} className="card" onClick={() => setEdit(r)}>
              <div className="card-top">
                <span className={`type type-${r.type}`} title={TYPE_INFO[r.type]}>{r.type}</span>
                <span className="meta">{fmtD(r.date)} · {weekLabel(weekOf(r.date, g))}{r.len ? ` · ${r.len} s` : ''}{orig ? ' · Recut' : ''}</span>
              </div>
              <div className="hook">{r.hook}</div>
              {r.views !== '' && r.views != null ? (
                <div className="stats">
                  <div><b>{fmtN(r.views)}</b><small>Views</small></div>
                  <div className={cls('saves')}><b>{fmtP(sp)}</b><small>Saves</small></div>
                  <div className={cls('followers')}><b>{fmtP(fp)}</b><small>Follower</small></div>
                  <div className={cls('comments')}><b>{fmtN(r.comments)}</b><small>Komm. {cp != null && <span>{fmtP3(cp)}</span>}</small></div>
                  <div><b>{q3 == null ? '–' : Math.round(q3 * 100) + ' %'}</b><small>3 Sek.</small></div>
                </div>
              ) : <div className="pending">Zahlen fehlen</div>}
              {recutWarn && <div className="warn">Recut unter einem Drittel des Originals – FB erkennt es vermutlich als Duplikat.</div>}
              {r.notes && r.notes !== 'Baseline' && <div className="notes">{r.notes}</div>}
            </li>
          );
        })}
      </ul>
      {edit && state.reels.some(x => x.id === edit.id) && <div className="row end"><Btn small onClick={() => del(edit.id)}>Dieses Reel löschen</Btn></div>}
    </section>
  );
}

/* ---------- Review ---------- */
function Review({ state, update }) {
  const g = state.goals;
  const weeks = [0, ...Array.from({ length: g.weeks }, (_, i) => i + 1)];
  const agg = (w) => {
    const rs = state.reels.filter(r => weekOf(r.date, g) === w && !r.recutOf && r.views !== '' && r.views != null);
    const avg = (f) => { const v = rs.map(f).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const sum = (k) => rs.reduce((a, r) => a + (Number(r[k]) || 0), 0);
    const by = (t, f) => { const v = rs.filter(r => r.type === t).map(f).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const best = rs.slice().sort((a, b) => (pct(b.followers, b.views) || 0) - (pct(a.followers, a.views) || 0))[0];
    const ok = rs.filter(r => verdict(r, g) === 'ok').length;
    return { n: rs.length, ok, saves: avg(r => pct(r.saves, r.views)), fol: avg(r => pct(r.followers, r.views)), sumFol: sum('followers'), sumCom: sum('comments'), sumViews: sum('views'), doSaves: by('DO', r => pct(r.saves, r.views)), reachFol: by('REACH', r => pct(r.followers, r.views)), meCom: by('ME', r => pct(r.comments, r.views)), usCom: by('US', r => pct(r.comments, r.views)), best };
  };
  const [open, setOpen] = useState(() => { const w = weekOf(todayISO(), g); return Math.min(Math.max(w, 1), g.weeks); });
  const rev0 = state.reviews[open] || { q: [], decision: '' };
  const rev = { ...rev0, q: REVIEW_Q.map((_, i) => rev0.q[i] || '') };
  const setRev = (patch) => update(s => ({ ...s, reviews: { ...s.reviews, [open]: { ...rev, ...patch } } }));
  return (
    <section>
      <header className="head"><h1>Wochenreview</h1><span className="meta">Test {fmtD(g.start)}–{fmtD(addDays(g.start, g.weeks * 7 - 1))}</span></header>
      <table className="tbl">
        <thead><tr><th>Woche</th><th>Reels</th><th>Ziel erreicht</th><th>Ø Saves</th><th>Ø Follower</th><th>Σ Follower</th><th>Σ Komm.</th></tr></thead>
        <tbody>
          {weeks.map(w => { const a = agg(w); return (
            <tr key={w} className={w === open ? 'sel' : ''} onClick={() => w > 0 && setOpen(w)}>
              <td>{weekLabel(w)}{w > 0 && <small> {fmtD(addDays(g.start, (w - 1) * 7))}</small>}</td>
              <td>{a.n}</td>
              <td className={a.n ? (a.ok / a.n >= 0.5 ? 'ok' : 'bad') : ''}>{a.n ? `${a.ok}/${a.n}` : '–'}</td>
              <td>{fmtP(a.saves)}</td>
              <td>{fmtP(a.fol)}</td>
              <td>{fmtN(a.sumFol)}</td><td>{fmtN(a.sumCom)}</td>
            </tr>); })}
        </tbody>
      </table>
      {(() => { const a = agg(open); return (
        <div className="sheet">
          <h2>Woche {open}</h2>
          <div className="stats">
            <div className={a.doSaves == null ? '' : a.doSaves >= g.saves ? 'ok' : 'bad'}><b>{fmtP(a.doSaves)}</b><small>DO Saves</small></div>
            <div className={a.reachFol == null ? '' : a.reachFol >= g.followers ? 'ok' : 'bad'}><b>{fmtP(a.reachFol)}</b><small>REACH Follower</small></div>
            <div className={a.meCom == null ? '' : a.meCom >= g.comments ? 'ok' : 'bad'}><b>{fmtP3(a.meCom)}</b><small>ME Komm.</small></div>
            <div className={a.usCom == null ? '' : a.usCom >= g.commentsUS ? 'ok' : 'bad'}><b>{fmtP3(a.usCom)}</b><small>US Komm.</small></div>
            <div><b>{fmtN(a.sumViews)}</b><small>Σ Views</small></div>
          </div>
          {a.best && <p className="hint">Bestes Reel nach Follower-Rate: „{a.best.hook}“ ({fmtP(pct(a.best.followers, a.best.views))})</p>}
          {REVIEW_Q.map((q, i) => (
            <Field key={i} label={`${i + 1}. ${q}`}><input value={rev.q[i] || ''} onChange={e => { const qq = [...rev.q]; qq[i] = e.target.value; setRev({ q: qq }); }} placeholder="Ein Satz" /></Field>
          ))}
          <Field label="Entscheidung für nächste Woche"><textarea rows={3} value={rev.decision} onChange={e => setRev({ decision: e.target.value })} placeholder="Was wird wiederholt, was fliegt raus?" /></Field>
        </div>); })()}
      <details className="sheet"><summary>Ziele und Testzeitraum</summary>
        <p className="hint">Jeder Typ wird an seiner eigenen Kennzahl gemessen (in % der Views). Ziele = Baseline halten: DO Saves 1,9 · REACH Follower 0,8 · ME Kommentare 0,035 · US 0,10 (kein Beleg, erster Versuch).</p>
        <div className="grid3">
          <Field label="DO: Saves %"><input type="number" step="0.1" value={(g.saves * 100).toFixed(1)} onChange={e => update(s => ({ ...s, goals: { ...s.goals, saves: Number(e.target.value) / 100 } }))} /></Field>
          <Field label="REACH: Follower %"><input type="number" step="0.1" value={(g.followers * 100).toFixed(1)} onChange={e => update(s => ({ ...s, goals: { ...s.goals, followers: Number(e.target.value) / 100 } }))} /></Field>
          <Field label="ME: Kommentare %"><input type="number" step="0.01" value={(g.comments * 100).toFixed(2)} onChange={e => update(s => ({ ...s, goals: { ...s.goals, comments: Number(e.target.value) / 100 } }))} /></Field>
          <Field label="US: Kommentare %"><input type="number" step="0.01" value={(g.commentsUS * 100).toFixed(2)} onChange={e => update(s => ({ ...s, goals: { ...s.goals, commentsUS: Number(e.target.value) / 100 } }))} /></Field>
          <Field label="Start"><input type="date" value={g.start} onChange={e => update(s => ({ ...s, goals: { ...s.goals, start: e.target.value } }))} /></Field>
        </div>
        <p className="hint">Kill-Regel Hooks: Insta + TikTok unter 5 % der FB-Views nach 4 Wochen → Varianten stoppen. Kill-Regel Frequenz: Follower-Rate fällt unter Baseline (0,53 %) → zurück auf 4/Tag prüfen.</p>
      </details>
    </section>
  );
}

/* ---------- Bibliothek ---------- */
function MoveEditor({ initial, onSave, onCancel, onDelete }) {
  const [m, setM] = useState({ ...initial, stepsText: (initial.steps || []).join('\n') });
  const set = (k, v) => setM(x => ({ ...x, [k]: v }));
  return (
    <div className="sheet">
      <Field label="Name"><input value={m.title} onChange={e => set('title', e.target.value)} /></Field>
      <div className="grid2">
        <Field label="Körperbereich"><select value={m.area} onChange={e => set('area', e.target.value)}>{AREAS.map(a => <option key={a}>{a}</option>)}</select></Field>
        <Field label="Dauer"><input value={m.len} onChange={e => set('len', e.target.value)} placeholder="z. B. 15–20 Sek." /></Field>
      </div>
      <Field label="Nutzen / Situation"><input value={m.benefit} onChange={e => set('benefit', e.target.value)} placeholder="morgens, Schreibtisch, Boden …" /></Field>
      <Field label="Fähigkeit / Alltagsziel"><select value={m.skill || ''} onChange={e => set('skill', e.target.value)}><option value="">– keine –</option>{SKILLS.map(k => <option key={k}>{k}</option>)}</select></Field>
      <Field label="Hook-Idee"><input value={m.hookIdea} onChange={e => set('hookIdea', e.target.value)} /></Field>
      <Field label="Ablauf (eine Zeile pro Schritt)"><textarea rows={3} value={m.stepsText} onChange={e => set('stepsText', e.target.value)} /></Field>
      <div className="row end">
        {onDelete && <Btn small onClick={onDelete}>Löschen</Btn>}
        <Btn onClick={onCancel}>Abbrechen</Btn>
        <Btn kind="primary" disabled={!m.title} onClick={() => { const { stepsText, ...rest } = m; onSave({ ...rest, steps: stepsText.split('\n').map(s => s.trim()).filter(Boolean) }); }}>Speichern</Btn>
      </div>
    </div>
  );
}

function Library({ state, update }) {
  const [area, setArea] = useState('Alle');
  const [skill, setSkill] = useState('Alle');
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);
  const fileRef = useRef();
  const moves = state.moves.filter(m => (area === 'Alle' || m.area === area) && (skill === 'Alle' || m.skill === skill) && (!q || (m.title + m.benefit + m.hookIdea + (m.skill || '')).toLowerCase().includes(q.toLowerCase())));
  const save = (m) => { update(s => ({ ...s, moves: s.moves.some(x => x.id === m.id) ? s.moves.map(x => x.id === m.id ? m : x) : [...s.moves, m] })); setEdit(null); };
  const del = (id) => { if (confirm('Move löschen?')) update(s => ({ ...s, moves: s.moves.filter(x => x.id !== id) })); setEdit(null); };
  const exportJSON = () => { const a = document.createElement('a'); a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.moves, null, 1)); a.download = 'joga-moves.json'; a.click(); };
  const importJSON = (f) => { const rd = new FileReader(); rd.onload = () => { try { const arr = JSON.parse(rd.result); if (!Array.isArray(arr)) throw 0; update(s => { const ids = new Set(s.moves.map(m => m.id)); const add = arr.filter(m => m && m.title).map(m => ({ id: m.id && !ids.has(m.id) ? m.id : uid(), title: m.title, area: AREAS.includes(m.area) ? m.area : 'Ganzkörper', skill: SKILLS.includes(m.skill) ? m.skill : '', benefit: m.benefit || '', len: m.len || '', hookIdea: m.hookIdea || '', steps: m.steps || [], src: m.src || 'Import' })); return { ...s, moves: [...s.moves, ...add] }; }); } catch { alert('Datei ist kein JSON-Array mit Moves.'); } }; rd.readAsText(f); };
  return (
    <section>
      <header className="head"><h1>Bibliothek</h1><Btn kind="primary" onClick={() => setEdit({ id: uid(), title: '', area: 'Ganzkörper', benefit: '', len: '', hookIdea: '', steps: [], src: 'eigen' })}>+ Move</Btn></header>
      {edit && <MoveEditor initial={edit} onSave={save} onCancel={() => setEdit(null)} onDelete={state.moves.some(x => x.id === edit.id) ? () => del(edit.id) : null} />}
      <input className="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Suchen" />
      <div className="row wrap">{['Alle', ...SKILLS].map(k => <Tag key={k} on={skill === k} onClick={() => setSkill(k)}>{k}</Tag>)}</div>
      <div className="row wrap dim">{['Alle', ...AREAS].map(a => <Tag key={a} on={area === a} onClick={() => setArea(a)}>{a}</Tag>)}</div>
      <ul className="list">
        {moves.map(m => (
          <li key={m.id} className="card slim" onClick={() => setEdit(m)}>
            <div className="hook">{m.title}</div>
            <div className="meta">{m.skill ? m.skill + ' · ' : ''}{m.area}{m.benefit ? ' · ' + m.benefit : ''}{m.len ? ' · ' + m.len : ''}</div>
            {m.hookIdea && <div className="notes">{m.hookIdea}</div>}
          </li>
        ))}
      </ul>
      <div className="row end">
        <Btn small onClick={() => fileRef.current.click()}>JSON importieren</Btn>
        <Btn small onClick={exportJSON}>JSON exportieren</Btn>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={e => e.target.files[0] && importJSON(e.target.files[0])} />
      </div>
      <p className="hint">{state.moves.length} Moves. Import: JSON-Array mit title, area, skill, benefit, len, hookIdea, steps.</p>
    </section>
  );
}

/* ---------- Content-System: Datenmodell, Regeln, Migration ---------- */
const WORLDS = ['JOGA', 'OLI'];
const C_STATUS = ['Idee', 'Skript fertig', 'Drehbereit', 'Gedreht', 'Geschnitten', 'Gepostet'];
const PROD_TYPES = ['Neudreh', 'Bestand', 'Recut'];
const ENTRIES = ['Move first', 'Face first', 'Situation first', 'Text first'];
const AUDIOS = ['Silent/Musik', 'On-Cam', 'Voice-over', 'Hybrid'];
const AUDIO_SHORT = { 'Silent/Musik': 'Musik', 'On-Cam': 'On-Cam', 'Voice-over': 'VO', 'Hybrid': 'Hybrid' };
const PLATFORMS = ['Instagram', 'TikTok', 'Facebook', 'YouTube'];
const PIPE = ['IDEE', 'SKRIPT', 'DREH', 'CUTS', 'POST', 'ERGEBNIS'];

// Entscheidungslogik für Bewegungscontent: feste Defaults, jederzeit manuell überschreibbar.
const FORMAT_RULES = [
  { key: 'wow', format: 'WOW / Challenge', entry: 'Move first', audio: 'Silent/Musik', note: 'Kein gesprochenes Intro.' },
  { key: 'routine', format: 'Routine / 1 Minute JOGA', entry: 'Move first', audio: 'Silent/Musik', note: 'Hook als On-Screen-Text. Kein gesprochenes Intro.' },
  { key: 'erklaerung', format: 'Erklärung / Mythos', entry: 'Move first', audio: 'Hybrid', note: 'Move first oder unmittelbare Demonstration. Voice-over oder Hybrid. Kein allgemeines Intro.' },
  { key: 'persoenlich', format: 'Persönlichkeit / Haltung', entry: 'Face first', audio: 'On-Cam', note: 'Face first oder Situation first. On-Cam oder Hybrid.' },
  { key: 'humor', format: 'Typisch Mann / Humor', entry: 'Situation first', audio: 'Silent/Musik', note: 'Situation first. So wenig Sprache wie möglich, Pointe primär visuell.' },
];
const FORMAT_ALIAS = { 'Oli Klärt': 'erklaerung', 'Oli Geht': 'persoenlich', 'Typisch Mann': 'humor', '1 Minute JOGA': 'routine' };
const FORMAT_PRESETS = [...FORMAT_RULES.map(r => r.format), 'Oli Geht', 'Oli Klärt', 'Typisch Mann', 'Oli Bewegt Hamburg', '1 Minute JOGA', 'REACH-Version', 'US-Frage', 'Recut'];
const ruleFor = (format) => { if (!format) return null; return FORMAT_RULES.find(r => r.format === format || r.key === FORMAT_ALIAS[format]) || null; };

const newPerf = (platform = 'Instagram') => ({ id: uid(), platform, date: '', views: '', reach: '', nonFollower: '', avgWatch: '', completion: '', likes: '', comments: '', shares: '', saves: '', newFollowers: '' });
const newShot = () => ({ id: uid(), camera: '', action: '', speech: '', onscreen: '', onscreenRequired: false, audio: 'On-Cam', dur: '', note: '' });
const newPiece = (over = {}) => ({
  id: uid(), world: 'JOGA', fn: 'DO', format: '', title: '', hook: '', status: 'Idee', prodType: 'Neudreh',
  entry: 'Move first', audio: 'Silent/Musik', entryManual: false, audioManual: false,
  goal: '', speech: '', scriptText: '', shots: [], moveIds: [], material: '', variants: '',
  platforms: [], publishDate: '', perf: [], shootId: '', cutId: '', src: '',
  planPhase: '', preproductionRequired: false, productionDate: '', caption: '',
  created: todayISO(), updated: todayISO(), ...over,
});
const normPiece = (p) => {
  const b = newPiece();
  const o = { ...b, ...p };
  ['shots', 'moveIds', 'platforms', 'perf'].forEach(k => { if (!Array.isArray(o[k])) o[k] = []; });
  if (!WORLDS.includes(o.world)) o.world = 'JOGA';
  if (!TYPES.includes(o.fn)) o.fn = 'DO';
  if (!C_STATUS.includes(o.status)) o.status = 'Idee';
  o.shots = o.shots.map(sh => ({ camera: '', onscreenRequired: false, ...sh }));
  // Frühere V2.2-Fassung: `preproduced` war nur eine Planungsabsicht, kein Erledigt-Status → umbenannt.
  if ('preproduced' in o) { o.preproductionRequired = o.preproductionRequired === true || o.preproduced === true; delete o.preproduced; }
  return o;
};
// Master-Test ist der 7-Wochen-Zeitraum (PLAN_START–PLAN_END). Der frühere 14-Tage-Test existiert höchstens noch als Altbestand in state.tests; er wird nirgends mehr angezeigt oder ausgewertet.

// Dauer eines Shots: Zahl (3), Text ("3 s") oder Zeitbereich ("0–2 s" = 2 Sek.). Fürs Summieren zählt die Differenz.
const durSec = (d) => {
  if (d === '' || d == null) return 0;
  if (typeof d === 'number') return d;
  const t = String(d).replace(',', '.');
  const r = t.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)/);
  if (r) return Math.max(0, parseFloat(r[2]) - parseFloat(r[1]));
  const n = t.match(/\d+(?:\.\d+)?/);
  return n ? parseFloat(n[0]) : 0;
};
const fmtDur = (d) => (d === '' || d == null) ? '' : (typeof d === 'number' || !/s\s*$/i.test(String(d))) ? d + ' Sek.' : String(d);

// "Drehbereit" ist kein freier Status (V2.2): Nur ein vollständiges Piece darf ihn bekommen.
// Piece-Ebene: Hook, Einstieg, Audio, ≥1 Shot, Piece-Sprechtext sobald Sprache vorkommt (bei On-Cam/Voice-over/Hybrid).
// Shot-Ebene: Bildhandlung, Dauer > 0; On-Cam/Voice-over → Sprechtext; onscreenRequired → On-Screen-Text.
// Silent/Musik braucht keine Sprache; Hybrid wird nicht pauschal je Shot geprüft (die Shots definieren ihre Audioart).
function readinessMissing(p) {
  const m = [];
  const t = (x) => String(x || '').trim();
  if (!t(p.hook)) m.push('Hook');
  if (!p.entry) m.push('Einstieg');
  if (!p.audio) m.push('Audio');
  if (!p.shots.length) m.push('mindestens ein Shot');
  const spoken = p.shots.some(sh => t(sh.speech));
  // Piece-Audio On-Cam / Voice-over: Sprache MUSS vorkommen – als Piece-Sprechtext oder als passend gesprochener Shot.
  // (Sonst könnte ein "On-Cam"-Piece ohne jede Sprache durchrutschen, wenn die Shots nicht ebenfalls als On-Cam markiert sind.)
  const noSpeechAtAll = (p.audio === 'On-Cam' || p.audio === 'Voice-over') && !t(p.speech) && !p.shots.some(sh => sh.audio === p.audio && t(sh.speech));
  // Sobald irgendein Shot spricht, braucht der Gesamt-Sprechtext des Pieces einen Wert (gilt auch für Hybrid; dort prüfen sonst nur die Shots).
  if (noSpeechAtAll) m.push('Sprechtext (' + p.audio + ')');
  else if (['On-Cam', 'Voice-over', 'Hybrid'].includes(p.audio) && spoken && !t(p.speech)) m.push('Sprechtext (Piece)');
  p.shots.forEach((sh, i) => {
    const n = 'Shot ' + (i + 1) + ': ';
    if (!t(sh.action)) m.push(n + 'Bildhandlung');
    if (durSec(sh.dur) <= 0) m.push(n + 'Dauer');
    if ((sh.audio === 'On-Cam' || sh.audio === 'Voice-over') && !t(sh.speech)) m.push(n + 'Sprechtext (' + sh.audio + ')');
    if (sh.onscreenRequired === true && !t(sh.onscreen)) m.push(n + 'On-Screen-Text (Pflicht)');
  });
  return m;
}

/* ---------- V2.1 Produktions-Seeds: 14 Pieces 12.–25.10.2026 (W3/W4, aus dem Referenzbuild) ---------- */
const PRODUCTION_SEED_V21 = [
  {
    id:'prod-oli-anfaenger', world:'OLI', fn:'ME', format:'Persönlichkeit / Haltung', title:'MIT 56 BIN ICH WIEDER ANFÄNGER. ABSICHTLICH.',
    hook:'Mit 56 bin ich wieder Anfänger. Absichtlich.', status:'Drehbereit', prodType:'Neudreh', entry:'Situation first', audio:'Hybrid',
    goal:'Test Haltung/Person: Trägt Oli als Person ohne klassischen Mobility-Tipp? Signal: Follows, Kommentare, Profilinteresse.',
    speech:'Mit 56 bin ich wieder Anfänger. Absichtlich. Ich habe sehr lange Dinge gemacht, die ich ziemlich gut konnte. Und dann habe ich wieder angefangen, Dinge zu lernen, bei denen ich nicht gut bin. Yoga. Pilates. Unterrichten. Content. Das ist manchmal ziemlich unangenehm. Aber vielleicht ist genau das der Punkt. Fertig sein kann ich später.',
    scriptText:'Ort: zuhause/Trainingsraum. 9:16. Ruhig, nicht pathetisch. Kein Motivationscoach-Ton. Harte, saubere Cuts. Ziel 20–25 Sek.',
    shots:[
      {id:'a1',action:'Halbtotale. Matte ausrollen oder Reformer vorbereiten. Blick erst zur Handlung, dann kurz in die Kamera.',speech:'Mit 56 bin ich wieder Anfänger. Absichtlich.',onscreen:'MIT 56 BIN ICH WIEDER ANFÄNGER.',audio:'On-Cam',dur:'0–3 s',note:'Kein Begrüßungsintro.'},
      {id:'a2',action:'Detail Hände/Equipment oder Schuhe. Handlung weiterlaufen lassen.',speech:'Ich habe sehr lange Dinge gemacht, die ich ziemlich gut konnte.',onscreen:'',audio:'Voice-over',dur:'3–6 s',note:'B-Roll.'},
      {id:'a3',action:'Ganzkörper: eine Übung/Bewegung, bei der sichtbar Konzentration nötig ist; kein Show-off.',speech:'Und dann habe ich wieder angefangen, Dinge zu lernen, bei denen ich nicht gut bin.',onscreen:'',audio:'Voice-over',dur:'6–10 s',note:''},
      {id:'a4',action:'3 sehr kurze Cuts: Yoga/Pilates/Unterrichtsvorbereitung/Content-Setup – nur Material, das real verfügbar ist.',speech:'Yoga. Pilates. Unterrichten. Content.',onscreen:'YOGA. PILATES. UNTERRICHTEN. CONTENT.',audio:'Voice-over',dur:'10–14 s',note:'Je 0,7–1 s.'},
      {id:'a5',action:'Halbnah. Kurzer Fehlversuch oder konzentriertes Neuansetzen, ohne künstliches Scheitern.',speech:'Das ist manchmal ziemlich unangenehm. Aber vielleicht ist genau das der Punkt.',onscreen:'',audio:'Voice-over',dur:'14–20 s',note:''},
      {id:'a6',action:'Direkter Blick in die Kamera. Still stehen/sitzen. Keine Bewegung mehr.',speech:'Fertig sein kann ich später.',onscreen:'FERTIG SEIN KANN ICH SPÄTER.',audio:'On-Cam',dur:'20–23 s',note:'Danach sofort Cut.'}
    ], platforms:['Instagram','TikTok'], publishDate:'2026-10-12', variants:'IG: 20–25 s. TikTok: Einstieg identisch, ggf. auf 18–20 s straffen.', material:'Neudreh. Matte/Reformer + Stativ.'
  },
  {
    id:'prod-joga-tornado', world:'JOGA', fn:'REACH', format:'WOW / Challenge', title:'TORNADO-OPENER – MORGENS EINGEROSTET',
    hook:'Du bist morgens nicht alt. Du bist eingerostet.', status:'Drehbereit', prodType:'Bestand', entry:'Move first', audio:'Silent/Musik',
    goal:'Kontrollpost Bewegungscontent: Prüfen, ob ein sofort verständlicher visueller Move ohne Sprache weiterhin Reichweite erzeugt.', speech:'',
    scriptText:'BESTAND/RECUT. Kein neues Intro drehen. 9:16. 10–12 Sek. Bewegung ab Frame 1. Hook ab Frame 1. Musik. Kein VO.',
    shots:[
      {id:'t1',action:'Aus vorhandenem Material: tiefer weiter Stand, Knie gebeugt. Erste Schulterbewegung muss bereits im ersten Frame laufen.',speech:'',onscreen:'DU BIST MORGENS NICHT ALT.',audio:'Silent/Musik',dur:'0–2 s',note:'Kein Setup zeigen.'},
      {id:'t2',action:'Rechte Schulter explosiv hoch, Arme auseinander, Brustkorb komplett öffnen.',speech:'',onscreen:'DU BIST EINGEROSTET.',audio:'Silent/Musik',dur:'2–6 s',note:'Stärksten Take wählen.'},
      {id:'t3',action:'Seitenwechsel im Rhythmus. 2–3 Wiederholungen.',speech:'',onscreen:'30 SEKUNDEN. EINFACH MACHEN.',audio:'Silent/Musik',dur:'6–11 s',note:'Loop-fähig enden.'}
    ], platforms:['Instagram','TikTok','Facebook','YouTube'], publishDate:'2026-10-13', variants:'IG/TikTok: 10–12 s. FB/YT: gleicher Master möglich.', material:'Bestandsmaterial Tornado-Opener / vorhandenen passenden Clip verwenden.'
  },
  {
    id:'prod-oli-kreativteam', world:'OLI', fn:'REACH', format:'Typisch Mann / Humor', title:'FRÜHER KREATIVTEAM. HEUTE STATIV.',
    hook:'FRÜHER HATTE ICH EIN KREATIVTEAM.', status:'Drehbereit', prodType:'Neudreh', entry:'Situation first', audio:'Hybrid',
    goal:'Test Humor + berufliche Identität: Funktioniert Oli außerhalb von Bewegung und ohne Erklärvideo?', speech:'Teamwork.',
    scriptText:'Ort: normaler Content-Drehort. 9:16. 9–12 Sek. Komplett kontrollierbar. Trocken spielen, keine künstliche Genervtheit.',
    shots:[
      {id:'k1',action:'Halbtotale. Du stehst neben dem aufgebauten Stativ, prüfst die Kamera.',speech:'',onscreen:'FRÜHER HATTE ICH EIN KREATIVTEAM.',audio:'Silent/Musik',dur:'0–2 s',note:''},
      {id:'k2',action:'Detail: Hand verstellt Kamera/Stativ.',speech:'',onscreen:'HEUTE HABE ICH EIN STATIV.',audio:'Silent/Musik',dur:'2–3 s',note:''},
      {id:'k3',action:'Totale: vom Stativ schnell auf die Markierung laufen.',speech:'',onscreen:'',audio:'Silent/Musik',dur:'3–4.5 s',note:'Harter Cut.'},
      {id:'k4',action:'Du merkst, dass der Bildausschnitt nicht stimmt. Zurück zur Kamera.',speech:'',onscreen:'',audio:'Silent/Musik',dur:'4.5–6 s',note:''},
      {id:'k5',action:'Kamera minimal neu ausrichten; wieder auf Position; direkt wieder zurück zur Kamera zur Kontrolle.',speech:'',onscreen:'',audio:'Silent/Musik',dur:'6–9 s',note:'2–3 schnelle Cuts.'},
      {id:'k6',action:'Neben dem Stativ stehen bleiben. Trockener Blick direkt in die Linse.',speech:'Teamwork.',onscreen:'',audio:'On-Cam',dur:'9–11 s',note:'Sofort danach Ende.'}
    ], platforms:['Instagram','TikTok'], publishDate:'2026-10-14', variants:'TikTok darf 1–2 Setup-Cuts schneller sein. Kein zusätzlicher Erklärtext.', material:'Neudreh. Kamera + Stativ.'
  },
  {
    id:'prod-joga-1min-richtungen', world:'JOGA', fn:'DO', format:'Routine / 1 Minute JOGA', title:'1 MINUTE IN ALLE RICHTUNGEN – RECUT',
    hook:'Eine Minute in alle Richtungen.', status:'Drehbereit', prodType:'Recut', entry:'Move first', audio:'Silent/Musik',
    goal:'Kontrollpost Nutzwert: Test Saves/Completion mit bekanntem Bewegungsmaterial ohne Sprache.', speech:'',
    scriptText:'RECUT aus vorhandenem Material „Eine Minute in alle Richtungen“. Kein Talking Head. Die stärksten 3 Richtungswechsel zuerst. 15–25 Sek statt zwingend 60 Sek.',
    shots:[
      {id:'r1',action:'Stärkster visuell klarer Richtungswechsel aus dem bestehenden Reel – Bewegung läuft ab Frame 1.',speech:'',onscreen:'EINE MINUTE IN ALLE RICHTUNGEN.',audio:'Silent/Musik',dur:'0–4 s',note:''},
      {id:'r2',action:'Zweiter Move in deutlich anderer Bewegungsebene.',speech:'',onscreen:'NICHT NUR VOR UND ZURÜCK.',audio:'Silent/Musik',dur:'4–10 s',note:''},
      {id:'r3',action:'Dritter Move/Flow, möglichst Rotation oder lateral.',speech:'',onscreen:'EINFACH MITMACHEN.',audio:'Silent/Musik',dur:'10–18 s',note:''},
      {id:'r4',action:'Kurzer sauberer Loop zurück in Startbewegung.',speech:'',onscreen:'SPEICHERN. SPÄTER MACHEN.',audio:'Silent/Musik',dur:'18–22 s',note:'Nur wenn CTA nicht den Flow stört.'}
    ], platforms:['Instagram','TikTok','Facebook','YouTube'], publishDate:'2026-10-15', variants:'IG: Save-orientiert. TikTok: CTA ggf. weglassen und auf 15–18 s kürzen.', material:'Bestandsreel „Eine Minute in alle Richtungen“.'
  },
  {
    id:'prod-oli-marken', world:'OLI', fn:'ME', format:'Oli Klärt', title:'WARUM KLINGT JEDE MARKE GLEICH?',
    hook:'Warum klingt eigentlich inzwischen jede Marke gleich?', status:'Drehbereit', prodType:'Neudreh', entry:'Face first', audio:'On-Cam',
    goal:'Test Kompetenz außerhalb Fitness: Wird Olis Creative-/Marketing-Hintergrund als eigenständiger Follow-Grund interessant?',
    speech:'Warum klingt eigentlich inzwischen jede Marke gleich? Innovativ. Authentisch. Nachhaltig. Nahbar. Wenn das vier Unternehmen über sich sagen, habe ich viermal nichts gelernt. Eine Marke braucht nicht möglichst viele richtige Wörter. Sie braucht etwas, das nur zu ihr passt. Sonst ist es keine Positionierung. Sondern Tapete.',
    scriptText:'9:16, neutraler Hintergrund. 18–22 Sek. Keine B-Roll nötig. Jumpcuts auf die vier Buzzwords. Trocken, nicht dozierend.',
    shots:[
      {id:'m1',action:'Halbnah, direkter Blick in die Kamera.',speech:'Warum klingt eigentlich inzwischen jede Marke gleich?',onscreen:'WARUM KLINGT JEDE MARKE GLEICH?',audio:'On-Cam',dur:'0–3 s',note:''},
      {id:'m2',action:'Vier harte Jumpcuts, gleiche Position minimal verändert.',speech:'Innovativ. Authentisch. Nachhaltig. Nahbar.',onscreen:'INNOVATIV / AUTHENTISCH / NACHHALTIG / NAHBAR',audio:'On-Cam',dur:'3–7 s',note:'Ein Wort pro Cut.'},
      {id:'m3',action:'Halbnah, ruhig.',speech:'Wenn das vier Unternehmen über sich sagen, habe ich viermal nichts gelernt.',onscreen:'',audio:'On-Cam',dur:'7–12 s',note:''},
      {id:'m4',action:'Gleicher Frame, minimal näher oder digitaler Punch-in.',speech:'Eine Marke braucht nicht möglichst viele richtige Wörter. Sie braucht etwas, das nur zu ihr passt.',onscreen:'',audio:'On-Cam',dur:'12–19 s',note:''},
      {id:'m5',action:'Kurze Pause, Blick halten.',speech:'Sonst ist es keine Positionierung. Sondern Tapete.',onscreen:'SONDERN TAPETE.',audio:'On-Cam',dur:'19–22 s',note:'Cut direkt nach Tapete.'}
    ], platforms:['Instagram','TikTok'], publishDate:'2026-10-16', variants:'TikTok: ggf. Einstieg direkt „Innovativ. Authentisch…“ und Frage als Text testen; IG Master wie oben.', material:'Neudreh. Nur Kamera/Stativ.'
  },
  {
    id:'prod-joga-anti-desk', world:'JOGA', fn:'DO', format:'Routine / 1 Minute JOGA', title:'ANTI-SCHREIBTISCH – RÜCKEN',
    hook:'Nach 8 Stunden Sitzen braucht dein Körper genau das hier.', status:'Drehbereit', prodType:'Bestand', entry:'Move first', audio:'Voice-over',
    goal:'Test Bewegung + VO gegen Silent-Kontrollposts: erhöht Erklärung Watchtime/Saves?',
    speech:'Wenn du viel sitzt, brauchst du nicht noch mehr Sitzen mit besserer Haltung. Beweg dich in die Richtungen, die am Schreibtisch fehlen: aufrichten, rotieren, Seite öffnen. Drei Bewegungen. Keine Wissenschaft daraus machen.',
    scriptText:'Bestand verwenden, falls passende Rücken-/Desk-Sequenz vorhanden. Bewegung Frame 1. VO startet sofort. 18–22 Sek.',
    shots:[
      {id:'d1',action:'Stärkster Rücken-/Aufrichtungs-Move aus Bestand, bereits in Bewegung.',speech:'Wenn du viel sitzt, brauchst du nicht noch mehr Sitzen mit besserer Haltung.',onscreen:'8 STUNDEN SITZEN?',audio:'Voice-over',dur:'0–6 s',note:''},
      {id:'d2',action:'Rotationsmove, klarer Perspektivwechsel.',speech:'Beweg dich in die Richtungen, die am Schreibtisch fehlen:',onscreen:'',audio:'Voice-over',dur:'6–10 s',note:''},
      {id:'d3',action:'Drei schnelle Ausschnitte: Aufrichtung, Rotation, Seitöffnung.',speech:'aufrichten, rotieren, Seite öffnen.',onscreen:'AUFRICHTEN · ROTIEREN · ÖFFNEN',audio:'Voice-over',dur:'10–16 s',note:''},
      {id:'d4',action:'Flow sauber auslaufen lassen.',speech:'Drei Bewegungen. Keine Wissenschaft daraus machen.',onscreen:'EINFACH MACHEN.',audio:'Voice-over',dur:'16–21 s',note:''}
    ], platforms:['Instagram','TikTok','Facebook'], publishDate:'2026-10-17', variants:'Silent-Version zusätzlich exportieren, aber im Test primär VO posten.', material:'Bestandsmaterial Rücken/Schreibtisch; falls kein passender Clip vorhanden: nur diesen Bewegungsblock nachdrehen.'
  },
  {
    id:'prod-oli-kannich', world:'OLI', fn:'REACH', format:'Typisch Mann / Humor', title:'KOPF: KANN ICH.',
    hook:'KOPF: KANN ICH.', status:'Drehbereit', prodType:'Neudreh', entry:'Situation first', audio:'Silent/Musik',
    goal:'Test visueller Humor ohne Erklärung: erreicht Oli auch Menschen, die keinen Fitness-Tipp suchen?', speech:'',
    scriptText:'7–10 Sek. Eigenes Handyvideo mit einem tatsächlich anspruchsvollen Move verwenden. Kein Fake-Sturz, kein Slapstick.',
    shots:[
      {id:'c1',action:'Close-up Handy in der Hand: darauf läuft ein eigener eleganter, anspruchsvoller Mobility-Move.',speech:'',onscreen:'KOPF: KANN ICH.',audio:'Silent/Musik',dur:'0–2 s',note:'Display muss lesbar sein.'},
      {id:'c2',action:'Harter Cut zur Startposition des Moves. Du setzt konzentriert an.',speech:'',onscreen:'',audio:'Silent/Musik',dur:'2–4 s',note:''},
      {id:'c3',action:'Kurzer echter Versuch; abbrechen/neu sortieren, sobald klar ist: schwieriger als gedacht.',speech:'',onscreen:'',audio:'Silent/Musik',dur:'4–7 s',note:'Nicht künstlich scheitern.'},
      {id:'c4',action:'Du sitzt oder liegst danach ruhig da und schaust trocken in die Kamera.',speech:'',onscreen:'KÖRPER: INTERESSANTE THEORIE.',audio:'Silent/Musik',dur:'7–10 s',note:'Pointe stehen lassen.'}
    ], platforms:['Instagram','TikTok'], publishDate:'2026-10-18', variants:'Gleicher Master. Kein CTA.', material:'Neudreh + eigenes vorhandenes Handyvideo eines schwierigen Moves.'
  },
  {
    id:'prod-joga-3min', world:'JOGA', fn:'DO', format:'Routine / 1 Minute JOGA', title:'3 MINUTEN AM TAG – RECUT',
    hook:'3 Minuten am Tag.', status:'Drehbereit', prodType:'Recut', entry:'Move first', audio:'Silent/Musik',
    goal:'Kontrollpost: vorhandenes Format mit klarem Zeitversprechen gegen neue OLI-Formate benchmarken.', speech:'',
    scriptText:'RECUT des vorhandenen „3 Minuten am Tag“-Materials. 12–18 Sek. Keine neue Moderation. Drei stärkste Bewegungen, sofort beginnen.',
    shots:[
      {id:'g1',action:'Visuell stärkster Move ab Frame 1.',speech:'',onscreen:'3 MINUTEN AM TAG.',audio:'Silent/Musik',dur:'0–5 s',note:''},
      {id:'g2',action:'Zweiter Move, andere Ebene/Richtung.',speech:'',onscreen:'NICHT PERFEKT. REGELMÄSSIG.',audio:'Silent/Musik',dur:'5–10 s',note:''},
      {id:'g3',action:'Dritter Move mit sauberem Endpunkt/Loop.',speech:'',onscreen:'KÖRPERPFLEGE STATT SPORT.',audio:'Silent/Musik',dur:'10–16 s',note:''}
    ], platforms:['Instagram','TikTok','Facebook','YouTube'], publishDate:'2026-10-19', variants:'TikTok 12–15 s; IG bis 18 s.', material:'Bestandsmaterial „3 Minuten am Tag“.'
  },
  {
    id:'prod-oli-steif', world:'OLI', fn:'DO', format:'Oli Klärt', title:'STEIF? MEHR DEHNEN.',
    hook:'STEIF? MEHR DEHNEN.', status:'Drehbereit', prodType:'Neudreh', entry:'Move first', audio:'Hybrid',
    goal:'Test Kompetenz + Bewegung: funktioniert Erklärung besser, wenn der Move sofort sichtbar ist und Oli erst in Sekunde 1 widerspricht?',
    speech:'Oder stärker werden. Dehnen kann deine Beweglichkeit verbessern. Aber es ist nicht der einzige Weg. Auch Krafttraining über eine große Bewegungsamplitude kann deine Range of Motion verbessern. Beweglichkeit kann man dehnen. Und belasten.',
    scriptText:'15–20 Sek. Gleiche Bewegungsrichtung einmal passiv, einmal aktiv/unter Last zeigen. Kein „Heute erkläre ich…“.',
    shots:[
      {id:'s1',action:'Frame 1: bereits in einer klaren passiven Dehnung. Kamera 45° so, dass Bewegungsamplitude sichtbar ist.',speech:'',onscreen:'STEIF? MEHR DEHNEN.',audio:'Silent/Musik',dur:'0–1.5 s',note:''},
      {id:'s2',action:'Aus der Dehnung kurz in die Kamera schauen oder harter Cut halbnah.',speech:'Oder stärker werden.',onscreen:'ODER STÄRKER WERDEN.',audio:'On-Cam',dur:'1.5–3 s',note:'Trocken.'},
      {id:'s3',action:'Passive Variante weiter zeigen.',speech:'Dehnen kann deine Beweglichkeit verbessern. Aber es ist nicht der einzige Weg.',onscreen:'',audio:'Voice-over',dur:'3–8 s',note:''},
      {id:'s4',action:'Gleiche Bewegungsrichtung aktiv/unter kontrollierter Last zeigen.',speech:'Auch Krafttraining über eine große Bewegungsamplitude kann deine Range of Motion verbessern.',onscreen:'AKTIV + KONTROLLIERT',audio:'Voice-over',dur:'8–15 s',note:''},
      {id:'s5',action:'Kurzer Split/Wechsel passiv → aktiv.',speech:'Beweglichkeit kann man dehnen. Und belasten.',onscreen:'DEHNEN. UND BELASTEN.',audio:'Voice-over',dur:'15–19 s',note:'Quelle nicht ins Video quetschen; in Caption/Notiz.'}
    ], platforms:['Instagram','TikTok','Facebook'], publishDate:'2026-10-20', variants:'IG/TikTok identischer Master; Caption kann Quellenhinweis tragen.', material:'Neudreh. Matte + ggf. leichtes Gewicht/Equipment für dieselbe Bewegungsrichtung.'
  },
  {
    id:'prod-joga-tryit', world:'JOGA', fn:'REACH', format:'WOW / Challenge', title:'TRY IT – CHALLENGE RECUT',
    hook:'TRY IT.', status:'Drehbereit', prodType:'Recut', entry:'Move first', audio:'Silent/Musik',
    goal:'Benchmark gegen einen jüngst stärkeren IG-Mechanismus: extrem direkte Challenge, minimale Erklärung.', speech:'',
    scriptText:'RECUT des vorhandenen „Try it“-Materials. Stärksten Versuch zuerst. 7–10 Sek. Keine Erklärung, kein VO.',
    shots:[
      {id:'y1',action:'Schwierigster/visuell klarster Moment sofort in Frame 1.',speech:'',onscreen:'TRY IT.',audio:'Silent/Musik',dur:'0–4 s',note:''},
      {id:'y2',action:'Zweiter Winkel oder vollständiger Versuch.',speech:'',onscreen:'',audio:'Silent/Musik',dur:'4–8 s',note:''},
      {id:'y3',action:'Kurzer Endhold/Blick.',speech:'',onscreen:'UND?',audio:'Silent/Musik',dur:'8–10 s',note:'Kein weiterer CTA.'}
    ], platforms:['Instagram','TikTok','Facebook','YouTube'], publishDate:'2026-10-21', variants:'Gleicher Master.', material:'Bestandsmaterial „Try it“.'
  },
  {
    id:'prod-oli-koerperpflege', world:'OLI', fn:'ME', format:'Oli Geht', title:'WARUM ICH BEWEGUNG KÖRPERPFLEGE NENNE.',
    hook:'Ich nenne Bewegung inzwischen Körperpflege.', status:'Drehbereit', prodType:'Neudreh', entry:'Face first', audio:'On-Cam',
    goal:'Test Markenhaltung: verbindet Oli-Person mit JOGA, ohne Tutorial zu werden?',
    speech:'Ich nenne Bewegung inzwischen Körperpflege. Beim Zähneputzen fragt ja auch keiner, ob du heute Bestleistung gebracht hast. Du machst es, weil dein Körper Pflege braucht. Genau so sehe ich Bewegung inzwischen auch. Nicht jedes Mal Training. Nicht jedes Mal Leistung. Aber regelmäßig bewegen. Einfach machen.',
    scriptText:'Oli Geht. 20–25 Sek. Im Gehen sprechen, nicht stehen und dozieren. Ein Take bevorzugt; nur 1–2 B-Roll-Cuts, wenn nötig.',
    shots:[
      {id:'p1',action:'Selfie/mitlaufende Kamera, du gehst bereits. Gesicht sichtbar.',speech:'Ich nenne Bewegung inzwischen Körperpflege.',onscreen:'BEWEGUNG = KÖRPERPFLEGE',audio:'On-Cam',dur:'0–3 s',note:''},
      {id:'p2',action:'Weitergehen, natürlicher Blickwechsel.',speech:'Beim Zähneputzen fragt ja auch keiner, ob du heute Bestleistung gebracht hast.',onscreen:'',audio:'On-Cam',dur:'3–8 s',note:''},
      {id:'p3',action:'Optional kurzer B-Roll-Cut auf Schritte/Hände, Ton läuft weiter.',speech:'Du machst es, weil dein Körper Pflege braucht.',onscreen:'',audio:'On-Cam',dur:'8–12 s',note:''},
      {id:'p4',action:'Gesicht wieder klar im Bild.',speech:'Genau so sehe ich Bewegung inzwischen auch. Nicht jedes Mal Training. Nicht jedes Mal Leistung.',onscreen:'NICHT IMMER TRAINING. NICHT IMMER LEISTUNG.',audio:'On-Cam',dur:'12–20 s',note:''},
      {id:'p5',action:'Weitergehen, kleiner natürlicher Abschlussblick.',speech:'Aber regelmäßig bewegen. Einfach machen.',onscreen:'EINFACH MACHEN.',audio:'On-Cam',dur:'20–24 s',note:'Kein künstlicher CTA.'}
    ], platforms:['Instagram','TikTok'], publishDate:'2026-10-22', variants:'TikTok ggf. 18–20 s durch Kürzen von Shot 3/4.', material:'Neudreh beim Gehen. Kein spezieller Ort nötig.'
  },
  {
    id:'prod-joga-mobility', world:'JOGA', fn:'DO', format:'Erklärung / Mythos', title:'MOBILITY IST NICHT NUR DEHNEN – RECUT',
    hook:'Mobility ist nicht nur Dehnen.', status:'Drehbereit', prodType:'Recut', entry:'Move first', audio:'Voice-over',
    goal:'Test, ob bestehender Mobility-Content durch knappen VO mehr Watchtime/Saves erhält als reine Textversion.',
    speech:'Mobility ist nicht nur: möglichst weit ziehen. Entscheidend ist auch, ob du Bewegung aktiv kontrollieren kannst. Deshalb kombiniere ich Range gern mit Kraft und Kontrolle.',
    scriptText:'RECUT vorhandenen Materials. 15–18 Sek. Visuell passive und aktive Bewegung kontrastieren. Kein medizinisches Versprechen.',
    shots:[
      {id:'mo1',action:'Aktiver kontrollierter Move sofort sichtbar.',speech:'Mobility ist nicht nur: möglichst weit ziehen.',onscreen:'MOBILITY IST NICHT NUR DEHNEN.',audio:'Voice-over',dur:'0–5 s',note:''},
      {id:'mo2',action:'Move mit sichtbarer aktiver Kontrolle/Endrange.',speech:'Entscheidend ist auch, ob du Bewegung aktiv kontrollieren kannst.',onscreen:'KONTROLLE',audio:'Voice-over',dur:'5–11 s',note:''},
      {id:'mo3',action:'Kraft-/Range-Move oder kontrollierter Übergang.',speech:'Deshalb kombiniere ich Range gern mit Kraft und Kontrolle.',onscreen:'RANGE + KRAFT + KONTROLLE',audio:'Voice-over',dur:'11–17 s',note:''}
    ], platforms:['Instagram','TikTok','Facebook'], publishDate:'2026-10-23', variants:'IG/TikTok gleicher Test-Master.', material:'Bestandsmaterial „Mobility ist nicht nur Dehnen“ bzw. passende aktive Range-Clips.'
  },
  {
    id:'prod-oli-video15', world:'OLI', fn:'ME', format:'Oli Geht', title:'15 SEKUNDEN VIDEO. ZWEI STUNDEN ARBEIT.',
    hook:'Ein Video braucht 15 Sekunden. Bis es 15 Sekunden lang ist, brauchst du zwei Stunden.', status:'Drehbereit', prodType:'Neudreh', entry:'Situation first', audio:'Voice-over',
    goal:'Test Creator-Alltag/Selbstironie ohne Bewegung: erzeugt die Person Oli Anschluss außerhalb JOGA?',
    speech:'Ein Video braucht 15 Sekunden. Bis es 15 Sekunden lang ist, brauchst du zwei Stunden. Kamera. Licht. Noch ein Take. Schnitt. Text. Musik. Cover. Und dann drückst du auf Posten und 47 Menschen sehen es. Kreativbranche. Nur jetzt mit Stativ.',
    scriptText:'12–18 Sek. Nicht jammern, trocken. Alle Probleme selbst kontrollierbar filmen. Schnelle Montage, VO darüber.',
    shots:[
      {id:'v1',action:'Stativ aufklappen/Kamera einsetzen.',speech:'Ein Video braucht 15 Sekunden. Bis es 15 Sekunden lang ist, brauchst du zwei Stunden.',onscreen:'15 SEKUNDEN VIDEO.',audio:'Voice-over',dur:'0–3 s',note:''},
      {id:'v2',action:'4–5 Mikro-Cuts: Licht, Markierung, Take starten, zurück zur Kamera, Timeline am Rechner/Handy.',speech:'Kamera. Licht. Noch ein Take. Schnitt. Text. Musik. Cover.',onscreen:'',audio:'Voice-over',dur:'3–9 s',note:'Je 0,5–1 s.'},
      {id:'v3',action:'Finger tippt auf „Posten“/symbolisch auf Handy; keine privaten Daten zeigen.',speech:'Und dann drückst du auf Posten und 47 Menschen sehen es.',onscreen:'47 VIEWS.',audio:'Voice-over',dur:'9–13 s',note:'47 ist Pointe, nicht als echte aktuelle Kennzahl behaupten.'},
      {id:'v4',action:'Du sitzt neben dem Stativ, trockener Blick.',speech:'Kreativbranche. Nur jetzt mit Stativ.',onscreen:'',audio:'Voice-over',dur:'13–17 s',note:''}
    ], platforms:['Instagram','TikTok'], publishDate:'2026-10-24', variants:'Wenn „47“ zu konstruiert wirkt, im Dreh zwei Varianten aufnehmen: „47“ und „kaum jemand“; im Schnitt entscheiden.', material:'Neudreh. Stativ, Kamera/Handy, Schnittscreen.'
  },
  {
    id:'prod-joga-balance', world:'JOGA', fn:'REACH', format:'WOW / Challenge', title:'BALANCE-CHECK – WACKELN ERLAUBT',
    hook:'Wie lange hältst du durch?', status:'Drehbereit', prodType:'Bestand', entry:'Move first', audio:'Silent/Musik',
    goal:'Abschluss-Kontrollpost: einfache Mitmach-Challenge. Vergleich mit OLI-Humor und OLI-Haltung.', speech:'',
    scriptText:'Bestand bevorzugt. 10–15 Sek. Einbein-Balance/Reach, sofort starten. Keine Erklärung. Sichtbarer echter Wackler darf drinbleiben.',
    shots:[
      {id:'b1',action:'Einbeinstand/Reach bereits aktiv in Frame 1. Ganzkörper, Fuß vollständig sichtbar.',speech:'',onscreen:'WIE LANGE HÄLTST DU DURCH?',audio:'Silent/Musik',dur:'0–5 s',note:''},
      {id:'b2',action:'Progression: Reach/Kopfbewegung oder schwierigerer Hebel.',speech:'',onscreen:'OHNE ABZUSETZEN.',audio:'Silent/Musik',dur:'5–10 s',note:''},
      {id:'b3',action:'Echter kleiner Wackler/Recovery oder sauberer Hold.',speech:'',onscreen:'WACKELN ZÄHLT.',audio:'Silent/Musik',dur:'10–14 s',note:'Nicht künstlich wackeln.'}
    ], platforms:['Instagram','TikTok','Facebook','YouTube'], publishDate:'2026-10-25', variants:'Gleicher Master; FB kann etwas länger laufen.', material:'Bestandsmaterial Balance; nur nachdrehen, wenn kein sauberer Ganzkörperclip existiert.'
  }
];
const productionSeedV21 = () => PRODUCTION_SEED_V21.map(p => normPiece({ ...p, created: '2026-10-05', updated: '2026-10-05' }));

/* ---------- V2.2 Produktions-Seeds: 28 neue Pieces (05.–11.10. und 26.10.–15.11.2026), geparst aus dem 7-Wochen-Contentplan ---------- */
const PRODUCTION_SEED_V22 = [
 {
  "id": "v22-joga-aufstehen",
  "world": "JOGA",
  "fn": "REACH",
  "format": "WOW / Challenge",
  "title": "OHNE HÄNDE VOM BODEN AUFSTEHEN",
  "hook": "Kommst du ohne Hände vom Boden hoch?",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Einfacher funktioneller Challenge-Post; Shares/Kommentare und Mitmachimpuls testen.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-joga-aufstehen-1",
    "action": "Du sitzt bereits am Boden und beginnst sofort aufzustehen. Keine Vorbereitung zeigen.",
    "speech": "",
    "onscreen": "KOMMST DU OHNE HÄNDE HOCH?",
    "audio": "Silent/Musik",
    "dur": "0–2 s",
    "note": "Hook in Frame 1.",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-aufstehen-2",
    "action": "Saubere Variante ohne Hände vollständig zeigen.",
    "speech": "",
    "onscreen": "1 VERSUCH.",
    "audio": "Silent/Musik",
    "dur": "2–7 s",
    "note": "Nicht beschleunigen.",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-aufstehen-3",
    "action": "Noch einmal aus leicht anderem Winkel oder kontrolliert zurück zum Boden.",
    "speech": "",
    "onscreen": "NICHT SCHUMMELN.",
    "audio": "Silent/Musik",
    "dur": "7–11 s",
    "note": "Loop-fähig enden.",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook",
   "YouTube"
  ],
  "publishDate": "2026-10-05",
  "variants": "IG/TT 9–11 s; FB/YT gleicher Master.",
  "material": "Matte oder freier Boden, Stativ. 9:16. Ganzkörper inklusive Füße.",
  "planPhase": "transition",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-socke",
  "world": "OLI",
  "fn": "REACH",
  "format": "Typisch Mann / Humor",
  "title": "KOPF SAGT: SOCKE. 3 SEKUNDEN.",
  "hook": "KOPF: SOCKE. 3 SEKUNDEN.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Situation first",
  "audio": "Hybrid",
  "goal": "Kontrollierbaren Alltags-Humor testen, der unmittelbar mit Beweglichkeit/Balance verbunden ist, aber nicht wie Training wirkt.",
  "speech": "Geht doch.",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-oli-socke-1",
    "action": "Im Stehen Socke anziehen wollen. Fuß bereits oben.",
    "speech": "",
    "onscreen": "KOPF: SOCKE. 3 SEKUNDEN.",
    "audio": "Silent/Musik",
    "dur": "0–2 s",
    "note": "Kein Intro.",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-socke-2",
    "action": "Echter kleiner Wackler, Fuß kurz runter, neu sortieren.",
    "speech": "",
    "onscreen": "KÖRPER HAT RÜCKFRAGEN.",
    "audio": "Silent/Musik",
    "dur": "2–6 s",
    "note": "Nicht künstlich übertreiben.",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-socke-3",
    "action": "Socke schließlich an. Trockener Blick in Kamera.",
    "speech": "Geht doch.",
    "onscreen": "",
    "audio": "On-Cam",
    "dur": "6–9 s",
    "note": "Sofort Cut.",
    "onscreenRequired": false
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok"
  ],
  "publishDate": "2026-10-06",
  "variants": "Kein CTA. TikTok ggf. 0,5 s schneller schneiden.",
  "material": "Socke, freie Wand in Reichweite, Stativ.",
  "planPhase": "transition",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-9090",
  "world": "JOGA",
  "fn": "DO",
  "format": "Routine / 1 Minute JOGA",
  "title": "90/90 FÜR DIE HÜFTE",
  "hook": "Wenn deine Hüfte nach Sitzen so tut, als wäre sie aus Beton.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Save-orientierte Mini-Routine mit klarer Alltagssituation.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-joga-9090-1",
    "action": "90/90 Sitz, Oberkörper wechselt kontrolliert zur anderen Seite.",
    "speech": "",
    "onscreen": "HÜFTE NACH VIEL SITZEN?",
    "audio": "Silent/Musik",
    "dur": "0–4 s",
    "note": "Bewegung Frame 1.",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-9090-2",
    "action": "90/90 Switches 2–3 Wiederholungen.",
    "speech": "",
    "onscreen": "30 SEKUNDEN.",
    "audio": "Silent/Musik",
    "dur": "4–10 s",
    "note": "Keine Erklärung.",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-9090-3",
    "action": "Aus 90/90 nach vorn neigen, dann wieder aufrichten.",
    "speech": "",
    "onscreen": "LANGSAM. OHNE ZERREN.",
    "audio": "Silent/Musik",
    "dur": "10–16 s",
    "note": "Sauberer Endpunkt.",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook"
  ],
  "publishDate": "2026-10-07",
  "variants": "IG/FB 16 s; TT 12–14 s.",
  "material": "Matte, Stativ. 9:16, Kamera leicht erhöht seitlich.",
  "planPhase": "transition",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-aufstehen",
  "world": "OLI",
  "fn": "REACH",
  "format": "Typisch Mann / Humor",
  "title": "KOPF SAGT: ICH STEH EINFACH AUF.",
  "hook": "KOPF: ICH STEH EINFACH AUF.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Situation first",
  "audio": "Silent/Musik",
  "goal": "Zweiter kontrollierbarer Humor-Test: Mikro-Moment statt Slapstick.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-oli-aufstehen-1",
    "action": "Du sitzt entspannt am Boden und willst spontan aufstehen.",
    "speech": "",
    "onscreen": "KOPF: ICH STEH EINFACH AUF.",
    "audio": "Silent/Musik",
    "dur": "0–2 s",
    "note": "Statischer Frame.",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-aufstehen-2",
    "action": "Du beginnst, stoppst kurz und sortierst die Beine neu.",
    "speech": "",
    "onscreen": "",
    "audio": "Silent/Musik",
    "dur": "2–6 s",
    "note": "Humor aus echter Planung.",
    "onscreenRequired": false
   },
   {
    "id": "v22-oli-aufstehen-3",
    "action": "Du entscheidest dich für eine saubere Variante und stehst auf.",
    "speech": "",
    "onscreen": "KÖRPER: WIR BESPRECHEN DAS KURZ.",
    "audio": "Silent/Musik",
    "dur": "6–10 s",
    "note": "Nicht alt spielen.",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok"
  ],
  "publishDate": "2026-10-08",
  "variants": "Gleicher Master IG/TT. Kein CTA.",
  "material": "Freier Boden, optional Sofa im Hintergrund, Stativ.",
  "planPhase": "transition",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-eagle",
  "world": "JOGA",
  "fn": "DO",
  "format": "Routine / 1 Minute JOGA",
  "title": "SCHULTERN NACH SCHREIBTISCH",
  "hook": "Mach das einmal, bevor du deine Schultern für alt erklärst.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Voice-over",
  "goal": "Test kurzer VO über klarer Bewegung; Nutzwert ohne Talking-Head-Intro.",
  "speech": "Viel Sitzen macht deine Schultern nicht kaputt. Aber oft ziemlich unbewegt. Einmal verschränken, Ellbogen heben, Rücken breit machen und wieder lösen. Kein Gewaltakt. Nur Bewegung.",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-joga-eagle-1",
    "action": "Eagle Arms bereits verschränkt; Ellbogen langsam heben.",
    "speech": "Viel Sitzen macht deine Schultern nicht kaputt. Aber oft ziemlich unbewegt.",
    "onscreen": "SCHULTERN NACH SCHREIBTISCH?",
    "audio": "Voice-over",
    "dur": "0–5 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-eagle-2",
    "action": "Rücken leicht runden, Hände vom Gesicht weg, dann aufrichten.",
    "speech": "Einmal verschränken, Ellbogen heben, Rücken breit machen und wieder lösen.",
    "onscreen": "",
    "audio": "Voice-over",
    "dur": "5–11 s",
    "note": "",
    "onscreenRequired": false
   },
   {
    "id": "v22-joga-eagle-3",
    "action": "Arme lösen, große Öffnung nach hinten/oben.",
    "speech": "Kein Gewaltakt. Nur Bewegung.",
    "onscreen": "NUR BEWEGEN.",
    "audio": "Voice-over",
    "dur": "11–16 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook"
  ],
  "publishDate": "2026-10-09",
  "variants": "Silent-Version zusätzlich exportieren, primär VO posten.",
  "material": "Stuhl oder Stand, Stativ. Eagle-Arms/Schultersequenz.",
  "planPhase": "transition",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-knie",
  "world": "OLI",
  "fn": "DO",
  "format": "Oli Klärt",
  "title": "KNIE NIE ÜBER DIE ZEHEN?",
  "hook": "KNIE NIE ÜBER DIE ZEHEN?",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Hybrid",
  "goal": "Fachkompetenz über sofort sichtbare Demonstration testen.",
  "speech": "Dann wird eine Kniebeuge ziemlich kompliziert. Wenn du die Knie absichtlich hinten hältst, verschiebst du die Belastung einfach woanders hin. Knie über den Zehen sind deshalb nicht automatisch ein Fehler. Wie weit sie nach vorn kommen, hängt von Körperbau, Beweglichkeit, Squat-Variante und Last ab. Nicht die Zehen sind die rote Linie.",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-oli-knie-1",
    "action": "Künstlicher Squat mit möglichst senkrechtem Schienbein; sichtbar unnatürlich.",
    "speech": "Dann wird eine Kniebeuge ziemlich kompliziert.",
    "onscreen": "KNIE NIE ÜBER DIE ZEHEN?",
    "audio": "On-Cam",
    "dur": "0–3 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-knie-2",
    "action": "Natürlich squatten, Knie dürfen vor.",
    "speech": "Wenn du die Knie absichtlich hinten hältst, verschiebst du die Belastung einfach woanders hin.",
    "onscreen": "",
    "audio": "Voice-over",
    "dur": "3–9 s",
    "note": "",
    "onscreenRequired": false
   },
   {
    "id": "v22-oli-knie-3",
    "action": "Seitliche Ansicht natürlicher Squat, kontrolliert.",
    "speech": "Knie über den Zehen sind deshalb nicht automatisch ein Fehler. Wie weit sie nach vorn kommen, hängt von Körperbau, Beweglichkeit, Squat-Variante und Last ab.",
    "onscreen": "",
    "audio": "Voice-over",
    "dur": "9–17 s",
    "note": "",
    "onscreenRequired": false
   },
   {
    "id": "v22-oli-knie-4",
    "action": "Oben stehen, Blick in Kamera.",
    "speech": "Nicht die Zehen sind die rote Linie.",
    "onscreen": "NICHT DIE ZEHEN SIND DIE ROTE LINIE.",
    "audio": "On-Cam",
    "dur": "17–20 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook"
  ],
  "publishDate": "2026-10-10",
  "variants": "IG/FB Master 20 s; TT ggf. 17–18 s.",
  "material": "Stativ, Ganzkörper, normale Squat-Position.",
  "planPhase": "transition",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-koerperwecker",
  "world": "JOGA",
  "fn": "DO",
  "format": "Routine / 1 Minute JOGA",
  "title": "30 SEKUNDEN KÖRPERWECKER",
  "hook": "30 Sekunden gegen das Gefühl, eingerostet zu sein.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Breiter, einfacher JOGA-Nutzwert als Kontrollpost vor Testphase.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-joga-koerperwecker-1",
    "action": "Weiter Stand, große Armkreise + Brustkorb öffnen.",
    "speech": "",
    "onscreen": "30 SEKUNDEN GEGEN EINGEROSTET.",
    "audio": "Silent/Musik",
    "dur": "0–4 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-koerperwecker-2",
    "action": "Squat-Seitentap rechts/links.",
    "speech": "",
    "onscreen": "1. SEITE",
    "audio": "Silent/Musik",
    "dur": "4–9 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-koerperwecker-3",
    "action": "Lunge mit Rotation im Wechsel.",
    "speech": "",
    "onscreen": "2. DREHEN",
    "audio": "Silent/Musik",
    "dur": "9–14 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-koerperwecker-4",
    "action": "Großer Reach nach oben/seitlich, sauberer Loop.",
    "speech": "",
    "onscreen": "3. LANG MACHEN",
    "audio": "Silent/Musik",
    "dur": "14–18 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook",
   "YouTube"
  ],
  "publishDate": "2026-10-11",
  "variants": "Master 18 s. Keine Moderation.",
  "material": "Freier Stand, Stativ, Ganzkörper.",
  "planPhase": "transition",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-stretch37",
  "world": "OLI",
  "fn": "REACH",
  "format": "Typisch Mann / Humor",
  "title": "ICH DEHNE MICH NUR KURZ.",
  "hook": "Ich dehne mich nur kurz.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Situation first",
  "audio": "Hybrid",
  "goal": "Humorformat nach Testphase wiederholen: kontrollierbar, körpernah, ohne Erklärvideo.",
  "speech": "Jetzt kann ich anfangen.",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-oli-stretch37-1",
    "action": "Einfachen Stretch beginnen.",
    "speech": "",
    "onscreen": "ICH DEHNE MICH NUR KURZ.",
    "audio": "Silent/Musik",
    "dur": "0–2 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-stretch37-2",
    "action": "Drei harte Cuts in immer weitere Stretch-/Mobility-Positionen.",
    "speech": "",
    "onscreen": "",
    "audio": "Silent/Musik",
    "dur": "2–7 s",
    "note": "Keine akrobatische Eskalation.",
    "onscreenRequired": false
   },
   {
    "id": "v22-oli-stretch37-3",
    "action": "Insert Uhr/Timer.",
    "speech": "",
    "onscreen": "37 MINUTEN SPÄTER.",
    "audio": "Silent/Musik",
    "dur": "7–9 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-stretch37-4",
    "action": "Aufstehen, trockener Blick.",
    "speech": "Jetzt kann ich anfangen.",
    "onscreen": "",
    "audio": "On-Cam",
    "dur": "9–11 s",
    "note": "",
    "onscreenRequired": false
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok"
  ],
  "publishDate": "2026-10-26",
  "variants": "IG/TT 10–11 s.",
  "material": "Matte, Uhr/Handy nur als Insert, Stativ.",
  "planPhase": "deepen",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-balance-wurf",
  "world": "JOGA",
  "fn": "REACH",
  "format": "WOW / Challenge",
  "title": "BALANCE + WURF",
  "hook": "Stehen ist leicht. Bis deine Hände etwas anderes machen.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Visuell verständliche Dual-Task-Balance als Challenge.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-joga-balance-wurf-1",
    "action": "Einbeinstand, Ball von Hand zu Hand werfen.",
    "speech": "",
    "onscreen": "STEHEN IST LEICHT.",
    "audio": "Silent/Musik",
    "dur": "0–4 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-balance-wurf-2",
    "action": "Ball etwas höher/seitlich werfen, Blick folgt.",
    "speech": "",
    "onscreen": "BIS DIE HÄNDE MITMISCHEN.",
    "audio": "Silent/Musik",
    "dur": "4–9 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-balance-wurf-3",
    "action": "Seitenwechsel, echter kleiner Wackler darf bleiben.",
    "speech": "",
    "onscreen": "30 SEKUNDEN. DANN WECHSELN.",
    "audio": "Silent/Musik",
    "dur": "9–14 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook",
   "YouTube"
  ],
  "publishDate": "2026-10-27",
  "variants": "Kein VO. Master 14 s.",
  "material": "Kleiner weicher Ball, freie Wand oder Ball von Hand zu Hand; Stativ.",
  "planPhase": "deepen",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-algorithmus",
  "world": "OLI",
  "fn": "ME",
  "format": "Oli Geht",
  "title": "WERBUNG VS. ALGORITHMUS",
  "hook": "Ich habe jahrelang Aufmerksamkeit geplant. Jetzt entscheidet ein Algorithmus, ob ich welche bekomme.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Face first",
  "audio": "On-Cam",
  "goal": "Berufliche Identität + Creator-Selbstironie als Follow-Grund testen.",
  "speech": "Ich habe beruflich jahrelang versucht, Aufmerksamkeit zu erzeugen. Mit Strategie, Idee, Text, Kampagne. Heute stelle ich ein Stativ hin, mache 17 Sekunden Video und ein Algorithmus entscheidet, ob es 200 oder 200.000 Menschen sehen. Das ist nicht tragisch. Nur eine ziemlich gute Pointe auf meine Karriere.",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-oli-algorithmus-1",
    "action": "Halbnah, direkt in Kamera.",
    "speech": "Ich habe beruflich jahrelang versucht, Aufmerksamkeit zu erzeugen.",
    "onscreen": "ICH HABE AUFMERKSAMKEIT GEPLANT.",
    "audio": "On-Cam",
    "dur": "0–4 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-algorithmus-2",
    "action": "Jumpcuts, gleiche Position.",
    "speech": "Mit Strategie, Idee, Text, Kampagne. Heute stelle ich ein Stativ hin, mache 17 Sekunden Video und ein Algorithmus entscheidet, ob es 200 oder 200.000 Menschen sehen.",
    "onscreen": "",
    "audio": "On-Cam",
    "dur": "4–11 s",
    "note": "",
    "onscreenRequired": false
   },
   {
    "id": "v22-oli-algorithmus-3",
    "action": "Kurze Pause, Blick halten.",
    "speech": "Das ist nicht tragisch. Nur eine ziemlich gute Pointe auf meine Karriere.",
    "onscreen": "POINTE AUF MEINE KARRIERE.",
    "audio": "On-Cam",
    "dur": "11–17 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok"
  ],
  "publishDate": "2026-10-28",
  "variants": "Keine Algorithmus-Jammer-Caption. 17–20 s.",
  "material": "Neutraler Hintergrund oder Content-Setup, Stativ.",
  "planPhase": "deepen",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-lunge-rotation",
  "world": "JOGA",
  "fn": "DO",
  "format": "Routine / 1 Minute JOGA",
  "title": "LUNGE + ROTATION",
  "hook": "Wenn du nur geradeaus trainierst, fehlt dir eine Richtung.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Rotation als einfache Bewegungsdimension; Save-orientiert.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-joga-lunge-rotation-1",
    "action": "Reverse Lunge rechts, Rotation über vorderes Bein.",
    "speech": "",
    "onscreen": "DIR FEHLT EINE RICHTUNG.",
    "audio": "Silent/Musik",
    "dur": "0–5 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-lunge-rotation-2",
    "action": "Zurück, Seite wechseln.",
    "speech": "",
    "onscreen": "LUNGE + ROTATION",
    "audio": "Silent/Musik",
    "dur": "5–10 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-lunge-rotation-3",
    "action": "2 flüssige Wechsel.",
    "speech": "",
    "onscreen": "6 PRO SEITE. LANGSAM.",
    "audio": "Silent/Musik",
    "dur": "10–16 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook"
  ],
  "publishDate": "2026-10-29",
  "variants": "Master 16 s.",
  "material": "Matte, Stativ, Ganzkörper.",
  "planPhase": "deepen",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-balance-trainierbar",
  "world": "OLI",
  "fn": "DO",
  "format": "Oli Klärt",
  "title": "BALANCE HAT MAN. ODER EBEN NICHT.",
  "hook": "Balance hat man. Oder eben nicht.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Hybrid",
  "goal": "Challenge vom 25.10. fachlich vertiefen; testet Follow-up-Serie Challenge → Erklärung.",
  "speech": "Praktisch. Dann könnte ich jetzt aufhören. Balance ist trainierbar. Deshalb ist sie auch Bestandteil von Trainingsprogrammen für funktionelle Fitness und Sturzprävention. Boden. Ein Bein. Dann Reach oder Kopfbewegung. Wackeln ist nicht das Gegenargument. Wackeln ist das Training.",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-oli-balance-trainierbar-1",
    "action": "Einbeinstand, echter kleiner Wackler.",
    "speech": "Praktisch. Dann könnte ich jetzt aufhören.",
    "onscreen": "BALANCE HAT MAN. ODER EBEN NICHT.",
    "audio": "On-Cam",
    "dur": "0–3 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-balance-trainierbar-2",
    "action": "Einbeinstand stabil, dann Reach.",
    "speech": "Balance ist trainierbar. Deshalb ist sie auch Bestandteil von Trainingsprogrammen für funktionelle Fitness und Sturzprävention.",
    "onscreen": "",
    "audio": "Voice-over",
    "dur": "3–9 s",
    "note": "",
    "onscreenRequired": false
   },
   {
    "id": "v22-oli-balance-trainierbar-3",
    "action": "Progression mit Kopfbewegung/Reach.",
    "speech": "Boden. Ein Bein. Dann Reach oder Kopfbewegung.",
    "onscreen": "PROGRESSION STATT TALENT.",
    "audio": "Voice-over",
    "dur": "9–15 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-balance-trainierbar-4",
    "action": "Wackler auffangen.",
    "speech": "Wackeln ist nicht das Gegenargument. Wackeln ist das Training.",
    "onscreen": "WACKELN IST DAS TRAINING.",
    "audio": "On-Cam",
    "dur": "15–18 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook"
  ],
  "publishDate": "2026-10-30",
  "variants": "18 s Master.",
  "material": "Stativ, Ganzkörper.",
  "planPhase": "deepen",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-zombie",
  "world": "JOGA",
  "fn": "REACH",
  "format": "WOW / Challenge",
  "title": "MORGENS ZOMBIE?",
  "hook": "Wenn du morgens läufst wie ein Zombie: 20 Sekunden.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Saisonaler Halloween-Aufhänger ohne Kostümzwang; einfacher Mobility-Loop.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-joga-zombie-1",
    "action": "Bewusst steifer erster Schritt, sofort Übergang in große Arm-/Brustöffnung.",
    "speech": "",
    "onscreen": "MORGENS ZOMBIE?",
    "audio": "Silent/Musik",
    "dur": "0–3 s",
    "note": "Nicht Schauspiel überziehen.",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-zombie-2",
    "action": "Weiter Stand, Sidebend rechts/links.",
    "speech": "",
    "onscreen": "20 SEKUNDEN.",
    "audio": "Silent/Musik",
    "dur": "3–9 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-zombie-3",
    "action": "Squat + Rotation im Wechsel.",
    "speech": "",
    "onscreen": "DANN WIEDER MENSCH.",
    "audio": "Silent/Musik",
    "dur": "9–15 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook",
   "YouTube"
  ],
  "publishDate": "2026-10-31",
  "variants": "Nur am 31.10. verwenden; kein Horrorlook nötig.",
  "material": "Normale Kleidung. Kein Halloween-Set nötig.",
  "planPhase": "deepen",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-schnellvideo",
  "world": "OLI",
  "fn": "REACH",
  "format": "Typisch Mann / Humor",
  "title": "ICH MACH NUR SCHNELL EIN VIDEO.",
  "hook": "Ich mach nur schnell ein Video.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Situation first",
  "audio": "Silent/Musik",
  "goal": "Creator-Alltag als kontrollierbarer Humor; anschlussfähig an 24.10., aber neue visuelle Pointe.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.",
  "shots": [
   {
    "id": "v22-oli-schnellvideo-1",
    "action": "Du stellst nur das Handy/Stativ hin.",
    "speech": "",
    "onscreen": "ICH MACH NUR SCHNELL EIN VIDEO.",
    "audio": "Silent/Musik",
    "dur": "0–2 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-schnellvideo-2",
    "action": "Schnelle Cuts: Winkel korrigieren, Licht, Position markieren, erneut kontrollieren.",
    "speech": "",
    "onscreen": "",
    "audio": "Silent/Musik",
    "dur": "2–7 s",
    "note": "",
    "onscreenRequired": false
   },
   {
    "id": "v22-oli-schnellvideo-3",
    "action": "Blick auf Uhr/Handy.",
    "speech": "",
    "onscreen": "47 MINUTEN SPÄTER.",
    "audio": "Silent/Musik",
    "dur": "7–10 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-schnellvideo-4",
    "action": "Du drückst endlich Aufnahme und gehst ins Bild.",
    "speech": "",
    "onscreen": "JETZT ABER.",
    "audio": "Silent/Musik",
    "dur": "10–12 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok"
  ],
  "publishDate": "2026-11-01",
  "variants": "Kein gesprochener CTA.",
  "material": "Kamera, Stativ, Licht/kleines Setup, Akku/SD optional.",
  "planPhase": "deepen",
  "preproductionRequired": false,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-9090-reach",
  "world": "JOGA",
  "fn": "DO",
  "format": "Routine / 1 Minute JOGA",
  "title": "90/90 + REACH",
  "hook": "Hüfte steif? Beweg sie. Nicht nur ziehen.",
  "status": "Drehbereit",
  "prodType": "Recut",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Urlaubsfähiger Recut aus 07.10.; gleiche Basis, anderer Nutzen/anderer Schnitt.",
  "speech": "",
  "scriptText": "RECUT – kein Neudreh. Nur aus vorhandenem Material schneiden (siehe Material). Reihenfolge, On-Screen-Text, Audio und Länge exakt wie in der Shotliste. VORPRODUZIEREN: fertig exportieren.",
  "shots": [
   {
    "id": "v22-joga-9090-reach-1",
    "action": "90/90 Switch aus bestehendem Master.",
    "speech": "",
    "onscreen": "HÜFTE STEIF?",
    "audio": "Silent/Musik",
    "dur": "0–4 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-9090-reach-2",
    "action": "90/90 mit Reach diagonal nach vorn.",
    "speech": "",
    "onscreen": "BEWEGEN. NICHT NUR ZIEHEN.",
    "audio": "Silent/Musik",
    "dur": "4–9 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-9090-reach-3",
    "action": "Seitenwechsel + Reach.",
    "speech": "",
    "onscreen": "30 SEKUNDEN.",
    "audio": "Silent/Musik",
    "dur": "9–14 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook"
  ],
  "publishDate": "2026-11-02",
  "variants": "Als eigener Cut vorproduzieren.",
  "material": "Material vom 07.10.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-muskeln",
  "world": "OLI",
  "fn": "DO",
  "format": "Oli Klärt",
  "title": "ZU ALT FÜR MUSKELAUFBAU?",
  "hook": "Deine Muskeln haben keinen Rentenbescheid bekommen.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Hybrid",
  "goal": "Alterskompetenz mit trockenem Satz und sichtbarer Kraftübung.",
  "speech": "Deine Muskeln haben keinen Rentenbescheid bekommen. Auch ältere Erwachsene können mit Krafttraining Muskelmasse und Kraft aufbauen. Die Reaktion wird nicht mit 50 abgeschaltet. Entscheidend sind Training, Belastung, Erholung und genug Zeit. Alt genug zum Trainieren bist du nicht. Höchstens alt genug, es vernünftig zu machen.",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts. VORPRODUZIEREN: vor Beginn von W6 (02.11.) drehen, schneiden und exportieren.",
  "shots": [
   {
    "id": "v22-oli-muskeln-1",
    "action": "Kraftübung bereits in Bewegung.",
    "speech": "Deine Muskeln haben keinen Rentenbescheid bekommen.",
    "onscreen": "ZU ALT FÜR MUSKELAUFBAU?",
    "audio": "On-Cam",
    "dur": "0–3 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-muskeln-2",
    "action": "2 kontrollierte Wiederholungen, anderer Winkel.",
    "speech": "Auch ältere Erwachsene können mit Krafttraining Muskelmasse und Kraft aufbauen. Die Reaktion wird nicht mit 50 abgeschaltet.",
    "onscreen": "",
    "audio": "Voice-over",
    "dur": "3–10 s",
    "note": "",
    "onscreenRequired": false
   },
   {
    "id": "v22-oli-muskeln-3",
    "action": "Weitertrainieren, sauberer Range.",
    "speech": "Entscheidend sind Training, Belastung, Erholung und genug Zeit.",
    "onscreen": "TRAINING. BELASTUNG. ERHOLUNG.",
    "audio": "Voice-over",
    "dur": "10–17 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-muskeln-4",
    "action": "Blick in Kamera.",
    "speech": "Alt genug zum Trainieren bist du nicht. Höchstens alt genug, es vernünftig zu machen.",
    "onscreen": "VERNÜNFTIG MACHEN.",
    "audio": "On-Cam",
    "dur": "17–21 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook"
  ],
  "publishDate": "2026-11-03",
  "variants": "Keine medizinischen Versprechen. 20–22 s.",
  "material": "Eine kontrollierte Kraftübung, z. B. Goblet Squat/RDL/Row; Stativ.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-thread",
  "world": "JOGA",
  "fn": "DO",
  "format": "Routine / 1 Minute JOGA",
  "title": "THREAD THE NEEDLE",
  "hook": "Dein Rücken kann mehr als vor und zurück.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Rotation visuell einfach und speicherbar.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts. VORPRODUZIEREN: vor Beginn von W6 (02.11.) drehen, schneiden und exportieren.",
  "shots": [
   {
    "id": "v22-joga-thread-1",
    "action": "Thread the Needle rechts, Arm weit durch.",
    "speech": "",
    "onscreen": "DEIN RÜCKEN KANN MEHR ALS VOR UND ZURÜCK.",
    "audio": "Silent/Musik",
    "dur": "0–5 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-thread-2",
    "action": "Öffnung nach oben.",
    "speech": "",
    "onscreen": "ROTIEREN.",
    "audio": "Silent/Musik",
    "dur": "5–10 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-thread-3",
    "action": "Seitenwechsel.",
    "speech": "",
    "onscreen": "3–5 PRO SEITE.",
    "audio": "Silent/Musik",
    "dur": "10–16 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook",
   "YouTube"
  ],
  "publishDate": "2026-11-04",
  "variants": "16 s Master.",
  "material": "Matte, Vierfüßler, Kamera schräg vorn.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-nicht-optik",
  "world": "OLI",
  "fn": "ME",
  "format": "Persönlichkeit / Haltung",
  "title": "ICH TRAINIER NICHT MEHR NUR FÜR OPTIK.",
  "hook": "Mit 56 ist mir wichtiger geworden, was mein Körper kann.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Situation first",
  "audio": "Hybrid",
  "goal": "Bewährtes Alters-/Haltungsfeld vertiefen, ohne Motivationscoach-Ton.",
  "speech": "Mit 56 ist mir wichtiger geworden, was mein Körper kann. Kraft. Beweglichkeit. Balance. Ausdauer. Natürlich darf ich gut aussehen wollen. Aber wenn das der einzige Maßstab ist, wird Training ziemlich klein. Ich will einen Körper, der mitmacht.",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts. VORPRODUZIEREN: vor Beginn von W6 (02.11.) drehen, schneiden und exportieren.",
  "shots": [
   {
    "id": "v22-oli-nicht-optik-1",
    "action": "Kraft- oder Mobility-Bewegung Frame 1.",
    "speech": "Mit 56 ist mir wichtiger geworden, was mein Körper kann.",
    "onscreen": "MIT 56: WAS KANN MEIN KÖRPER?",
    "audio": "Voice-over",
    "dur": "0–3 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-nicht-optik-2",
    "action": "Vier kurze Cuts Kraft/Beweglichkeit/Balance/Ausdauer.",
    "speech": "Kraft. Beweglichkeit. Balance. Ausdauer.",
    "onscreen": "KRAFT · MOBILITY · BALANCE · AUSDAUER",
    "audio": "Voice-over",
    "dur": "3–10 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-nicht-optik-3",
    "action": "Ruhiger Bewegungsclip.",
    "speech": "Natürlich darf ich gut aussehen wollen. Aber wenn das der einzige Maßstab ist, wird Training ziemlich klein.",
    "onscreen": "",
    "audio": "Voice-over",
    "dur": "10–16 s",
    "note": "",
    "onscreenRequired": false
   },
   {
    "id": "v22-oli-nicht-optik-4",
    "action": "Halbnah, Blick in Kamera.",
    "speech": "Ich will einen Körper, der mitmacht.",
    "onscreen": "EIN KÖRPER, DER MITMACHT.",
    "audio": "On-Cam",
    "dur": "16–19 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok"
  ],
  "publishDate": "2026-11-05",
  "variants": "19–21 s.",
  "material": "Kurze B-Roll aus Kraft + Mobility; 1 On-Cam-Ende.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-squat-taps",
  "world": "JOGA",
  "fn": "DO",
  "format": "Routine / 1 Minute JOGA",
  "title": "SQUAT → SIDE TAP → ROTATION",
  "hook": "Eine Bewegung. Drei Richtungen.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Kompakter Full-Body-Flow mit klarer Struktur.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts. VORPRODUZIEREN: vor Beginn von W6 (02.11.) drehen, schneiden und exportieren.",
  "shots": [
   {
    "id": "v22-joga-squat-taps-1",
    "action": "Squat, beim Hochkommen Side Tap rechts.",
    "speech": "",
    "onscreen": "EINE BEWEGUNG. DREI RICHTUNGEN.",
    "audio": "Silent/Musik",
    "dur": "0–5 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-squat-taps-2",
    "action": "Side Tap links, dann Reverse Lunge rechts.",
    "speech": "",
    "onscreen": "SEITE.",
    "audio": "Silent/Musik",
    "dur": "5–10 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-squat-taps-3",
    "action": "Lunge + Rotation, dann Wechsel.",
    "speech": "",
    "onscreen": "ZURÜCK. DREHEN.",
    "audio": "Silent/Musik",
    "dur": "10–16 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook"
  ],
  "publishDate": "2026-11-06",
  "variants": "16 s, loopfähig.",
  "material": "Freier Stand, Ganzkörper.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-anleitung",
  "world": "OLI",
  "fn": "REACH",
  "format": "Typisch Mann / Humor",
  "title": "ICH BRAUCHE KEINE ANLEITUNG.",
  "hook": "Ich brauche keine Anleitung.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Situation first",
  "audio": "Silent/Musik",
  "goal": "Typisch-Mann-Format mit komplett kontrollierbarem Setup; bewusst kurz.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts. VORPRODUZIEREN: vor Beginn von W6 (02.11.) drehen, schneiden und exportieren. Nur drehen, wenn vorhandenes Equipment eine glaubwürdige Mini-Handlung ermöglicht; sonst eine Reserve-Idee verwenden.",
  "shots": [
   {
    "id": "v22-oli-anleitung-1",
    "action": "Du legst Anleitung demonstrativ zur Seite.",
    "speech": "",
    "onscreen": "ICH BRAUCHE KEINE ANLEITUNG.",
    "audio": "Silent/Musik",
    "dur": "0–2 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-anleitung-2",
    "action": "Du versuchst etwas offensichtlich in falscher Reihenfolge zusammenzusetzen/einzustellen.",
    "speech": "",
    "onscreen": "",
    "audio": "Silent/Musik",
    "dur": "2–6 s",
    "note": "Nur reales, ungefährliches Objekt.",
    "onscreenRequired": false
   },
   {
    "id": "v22-oli-anleitung-3",
    "action": "Kurzer Blick, dann Anleitung heimlich wieder ins Bild ziehen.",
    "speech": "",
    "onscreen": "ICH SCHAU NUR, OB SIE STIMMT.",
    "audio": "Silent/Musik",
    "dur": "6–9 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok"
  ],
  "publishDate": "2026-11-07",
  "variants": "",
  "material": "Ein kleines vorhandenes Objekt/Equipment mit Anleitung; nichts kaufen.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-dolphin",
  "world": "JOGA",
  "fn": "DO",
  "format": "Routine / 1 Minute JOGA",
  "title": "DOLPHIN FÜR SCHULTERN + CORE",
  "hook": "Wenn Plank langweilig wird: geh einen Schritt weiter.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Athletischer JOGA-Post ohne Zirkusmove; Saves und Watchtime.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts. VORPRODUZIEREN: vor Beginn von W6 (02.11.) drehen, schneiden und exportieren.",
  "shots": [
   {
    "id": "v22-joga-dolphin-1",
    "action": "Dolphin Hold, Schultern über/leicht vor Ellbogen.",
    "speech": "",
    "onscreen": "PLANK LANGWEILIG?",
    "audio": "Silent/Musik",
    "dur": "0–5 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-dolphin-2",
    "action": "Dolphin Rocks vor/zurück kontrolliert.",
    "speech": "",
    "onscreen": "DOLPHIN ROCKS.",
    "audio": "Silent/Musik",
    "dur": "5–10 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-dolphin-3",
    "action": "Hüfte etwas höher, sauber zurück.",
    "speech": "",
    "onscreen": "6–10 LANGSAME.",
    "audio": "Silent/Musik",
    "dur": "10–15 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook",
   "YouTube"
  ],
  "publishDate": "2026-11-08",
  "variants": "15 s.",
  "material": "Matte, Stativ seitlich.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-stretch-vor-sport",
  "world": "OLI",
  "fn": "DO",
  "format": "Oli Klärt",
  "title": "VOR SPORT: ERST MAL LANGE DEHNEN?",
  "hook": "Vor Sport erst mal lange statisch dehnen? Kommt drauf an, was du danach vorhast.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Move first",
  "audio": "Hybrid",
  "goal": "Differenzierte Kompetenz; explizit statisches Dehnen, keine pauschale Dehnkritik.",
  "speech": "Vor Sport erst mal lange statisch dehnen? Kommt drauf an, was du danach vorhast. Statisches Dehnen ist nicht grundsätzlich schlecht. Direkt vor explosiver Leistung ist langes statisches Halten aber nicht automatisch die beste Vorbereitung. Wenn du danach Leistung willst: warm werden, bewegen, spezifisch vorbereiten. Dehnen darf bleiben. Nur nicht als Religion.",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts. VORPRODUZIEREN: vor Beginn von W6 (02.11.) drehen, schneiden und exportieren.",
  "shots": [
   {
    "id": "v22-oli-stretch-vor-sport-1",
    "action": "Statischer Stretch bereits gehalten.",
    "speech": "Vor Sport erst mal lange statisch dehnen? Kommt drauf an, was du danach vorhast.",
    "onscreen": "VOR SPORT: LANGE DEHNEN?",
    "audio": "On-Cam",
    "dur": "0–4 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-stretch-vor-sport-2",
    "action": "Dynamische Bewegung/Leg swing oder kontrollierte Mobilisation.",
    "speech": "Statisches Dehnen ist nicht grundsätzlich schlecht. Direkt vor explosiver Leistung ist langes statisches Halten aber nicht automatisch die beste Vorbereitung.",
    "onscreen": "",
    "audio": "Voice-over",
    "dur": "4–10 s",
    "note": "",
    "onscreenRequired": false
   },
   {
    "id": "v22-oli-stretch-vor-sport-3",
    "action": "2 dynamische vorbereitende Moves.",
    "speech": "Wenn du danach Leistung willst: warm werden, bewegen, spezifisch vorbereiten.",
    "onscreen": "WARM · BEWEGEN · SPEZIFISCH",
    "audio": "Voice-over",
    "dur": "10–17 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-stretch-vor-sport-4",
    "action": "Blick in Kamera.",
    "speech": "Dehnen darf bleiben. Nur nicht als Religion.",
    "onscreen": "NICHT ALS RELIGION.",
    "audio": "On-Cam",
    "dur": "17–20 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook"
  ],
  "publishDate": "2026-11-09",
  "variants": "20 s; Caption muss statisches Dehnen präzise benennen.",
  "material": "Matte/Stand, kurzer statischer Stretch + dynamische Vorbereitung.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-balance-reach",
  "world": "JOGA",
  "fn": "REACH",
  "format": "WOW / Challenge",
  "title": "EIN BEIN. DREI REACHES.",
  "hook": "Ein Bein. Drei Richtungen. Wie ruhig bleibst du?",
  "status": "Drehbereit",
  "prodType": "Recut",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Vorproduzierbarer Balance-Recut aus Material 27./30.10.",
  "speech": "",
  "scriptText": "RECUT – kein Neudreh. Nur aus vorhandenem Material schneiden (siehe Material). Reihenfolge, On-Screen-Text, Audio und Länge exakt wie in der Shotliste. VORPRODUZIEREN: fertig exportieren.",
  "shots": [
   {
    "id": "v22-joga-balance-reach-1",
    "action": "Einbeinstand, Reach nach vorn.",
    "speech": "",
    "onscreen": "EIN BEIN.",
    "audio": "Silent/Musik",
    "dur": "0–4 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-balance-reach-2",
    "action": "Reach seitlich.",
    "speech": "",
    "onscreen": "DREI RICHTUNGEN.",
    "audio": "Silent/Musik",
    "dur": "4–9 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-balance-reach-3",
    "action": "Reach diagonal/hinten, Recovery.",
    "speech": "",
    "onscreen": "WACKELN ERLAUBT.",
    "audio": "Silent/Musik",
    "dur": "9–14 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook",
   "YouTube"
  ],
  "publishDate": "2026-11-10",
  "variants": "14 s.",
  "material": "Bestandsmaterial Balance.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-anfaenger2",
  "world": "OLI",
  "fn": "ME",
  "format": "Persönlichkeit / Haltung",
  "title": "GUT SEIN IST BEQUEM.",
  "hook": "Gut sein ist bequem. Lernen nicht.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Face first",
  "audio": "On-Cam",
  "goal": "Nachfolger des Anfänger-Pieces; Haltung ohne Wiederholung derselben Hook.",
  "speech": "Gut sein ist bequem. Lernen nicht. Wenn du etwas lange kannst, weißt du, wie du gut aussiehst. Als Anfänger sieht man Fehler. Man fragt. Man probiert. Man scheitert sichtbar. Genau deshalb versuche ich, mir das zu erhalten. Nicht Anfänger bleiben. Aber immer wieder einer werden.",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts. VORPRODUZIEREN: vor Beginn von W6 (02.11.) drehen, schneiden und exportieren.",
  "shots": [
   {
    "id": "v22-oli-anfaenger2-1",
    "action": "Halbnah, direkt.",
    "speech": "Gut sein ist bequem. Lernen nicht.",
    "onscreen": "GUT SEIN IST BEQUEM.",
    "audio": "On-Cam",
    "dur": "0–4 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-anfaenger2-2",
    "action": "Leichte Jumpcuts.",
    "speech": "Wenn du etwas lange kannst, weißt du, wie du gut aussiehst. Als Anfänger sieht man Fehler. Man fragt. Man probiert. Man scheitert sichtbar.",
    "onscreen": "",
    "audio": "On-Cam",
    "dur": "4–12 s",
    "note": "",
    "onscreenRequired": false
   },
   {
    "id": "v22-oli-anfaenger2-3",
    "action": "Minimal näher.",
    "speech": "Genau deshalb versuche ich, mir das zu erhalten. Nicht Anfänger bleiben. Aber immer wieder einer werden.",
    "onscreen": "IMMER WIEDER ANFÄNGER WERDEN.",
    "audio": "On-Cam",
    "dur": "12–19 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok"
  ],
  "publishDate": "2026-11-11",
  "variants": "19–21 s.",
  "material": "Neutraler Hintergrund, ein Take plus 2 Jumpcuts.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-afterdesk",
  "world": "JOGA",
  "fn": "DO",
  "format": "Routine / 1 Minute JOGA",
  "title": "NACH 8 STUNDEN SITZEN",
  "hook": "Nach 8 Stunden Sitzen braucht dein Körper nicht noch einen Stuhl.",
  "status": "Drehbereit",
  "prodType": "Recut",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Urlaubsfähige Silent-Variante des Anti-Desk-Themas; Vergleich VO vs Silent.",
  "speech": "",
  "scriptText": "RECUT – kein Neudreh. Nur aus vorhandenem Material schneiden (siehe Material). Reihenfolge, On-Screen-Text, Audio und Länge exakt wie in der Shotliste. VORPRODUZIEREN: fertig exportieren.",
  "shots": [
   {
    "id": "v22-joga-afterdesk-1",
    "action": "Aufrichtung/Brustöffnung Frame 1.",
    "speech": "",
    "onscreen": "NACH 8 STUNDEN SITZEN ...",
    "audio": "Silent/Musik",
    "dur": "0–5 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-afterdesk-2",
    "action": "Rotation.",
    "speech": "",
    "onscreen": "... NICHT NOCH EINEN STUHL.",
    "audio": "Silent/Musik",
    "dur": "5–10 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-afterdesk-3",
    "action": "Seitöffnung/Reach.",
    "speech": "",
    "onscreen": "AUFRICHTEN · DREHEN · ÖFFNEN",
    "audio": "Silent/Musik",
    "dur": "10–16 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook"
  ],
  "publishDate": "2026-11-12",
  "variants": "16 s; expliziter Vergleich zum VO-Piece vom 17.10.",
  "material": "Bestandsmaterial vom 17.10. oder verwandtes Desk-Material.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-video-urlaub",
  "world": "OLI",
  "fn": "REACH",
  "format": "Typisch Mann / Humor",
  "title": "URLAUB. DER CONTENT ARBEITET TROTZDEM.",
  "hook": "Urlaub. Der Content arbeitet trotzdem.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Situation first",
  "audio": "Silent/Musik",
  "goal": "Meta-Humor über Vorproduktion; passt zum tatsächlichen 7-Wochen-System und benötigt keinen Urlaubsdreh.",
  "speech": "",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts. VORPRODUZIEREN: vor Beginn von W6 (02.11.) drehen, schneiden und exportieren.",
  "shots": [
   {
    "id": "v22-oli-video-urlaub-1",
    "action": "Du sitzt vor einer Liste/Timeline mit mehreren fertigen Clips.",
    "speech": "",
    "onscreen": "URLAUB.",
    "audio": "Silent/Musik",
    "dur": "0–3 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-video-urlaub-2",
    "action": "Du klickst/markierst mehrere fertige Exporte nacheinander.",
    "speech": "",
    "onscreen": "CONTENT: VORPRODUZIERT.",
    "audio": "Silent/Musik",
    "dur": "3–7 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-video-urlaub-3",
    "action": "Stuhl leer, Kamera läuft noch 1 Sekunde.",
    "speech": "",
    "onscreen": "ICH: WEG.",
    "audio": "Silent/Musik",
    "dur": "7–10 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok"
  ],
  "publishDate": "2026-11-13",
  "variants": "Vor Urlaub produzieren. Kein Ortsbezug nötig.",
  "material": "Am Schreibtisch/Content-Setup vorab drehen. Kalender/Exportliste auf eigenem Screen möglich.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-joga-fullbody3",
  "world": "JOGA",
  "fn": "DO",
  "format": "Routine / 1 Minute JOGA",
  "title": "3 MOVES. GANZER KÖRPER.",
  "hook": "Wenn du heute nur drei Bewegungen machst: diese.",
  "status": "Drehbereit",
  "prodType": "Recut",
  "entry": "Move first",
  "audio": "Silent/Musik",
  "goal": "Best-of-Rekombination der sieben Wochen; Save-Post.",
  "speech": "",
  "scriptText": "RECUT – kein Neudreh. Nur aus vorhandenem Material schneiden (siehe Material). Reihenfolge, On-Screen-Text, Audio und Länge exakt wie in der Shotliste. VORPRODUZIEREN: fertig exportieren.",
  "shots": [
   {
    "id": "v22-joga-fullbody3-1",
    "action": "Squat + Rotation.",
    "speech": "",
    "onscreen": "WENN HEUTE NUR 3 MOVES:",
    "audio": "Silent/Musik",
    "dur": "0–5 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-fullbody3-2",
    "action": "90/90 Switch/Reach.",
    "speech": "",
    "onscreen": "1. DREHEN 2. HÜFTE",
    "audio": "Silent/Musik",
    "dur": "5–10 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-fullbody3-3",
    "action": "Schulter-/Brustöffnung.",
    "speech": "",
    "onscreen": "3. ÖFFNEN",
    "audio": "Silent/Musik",
    "dur": "10–15 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-joga-fullbody3-4",
    "action": "Kurzer Loop aus erstem Move.",
    "speech": "",
    "onscreen": "SPEICHERN. MACHEN.",
    "audio": "Silent/Musik",
    "dur": "15–18 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook",
   "YouTube"
  ],
  "publishDate": "2026-11-14",
  "variants": "18 s.",
  "material": "Beste vorhandene Takes aus Squat/Rotation, 90/90, Schulteröffnung.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 },
 {
  "id": "v22-oli-7wochen",
  "world": "OLI",
  "fn": "ME",
  "format": "Oli Geht",
  "title": "7 WOCHEN. WAS BLEIBT?",
  "hook": "7 Wochen Content. Die wichtigste Zahl ist nicht die größte.",
  "status": "Drehbereit",
  "prodType": "Neudreh",
  "entry": "Face first",
  "audio": "On-Cam",
  "goal": "Abschluss des Zeitraums; keine vorgetäuschte Erkenntnis, sondern Haltung zur Auswertung.",
  "speech": "Sieben Wochen Content. Natürlich schaue ich auf Views. Aber die größte Zahl ist nicht automatisch der beste Inhalt. Mich interessiert: Was wird gespeichert? Was wird geteilt? Wofür folgen Menschen? Und bei welchem Content bleibe ich selbst gern dran? Danach wird nicht alles neu. Nur klarer.",
  "scriptText": "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts. VORPRODUZIEREN: vor Beginn von W6 (02.11.) drehen, schneiden und exportieren.",
  "shots": [
   {
    "id": "v22-oli-7wochen-1",
    "action": "Halbnah, direkt.",
    "speech": "Sieben Wochen Content. Natürlich schaue ich auf Views.",
    "onscreen": "7 WOCHEN CONTENT.",
    "audio": "On-Cam",
    "dur": "0–4 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-7wochen-2",
    "action": "Jumpcuts, ruhig.",
    "speech": "Aber die größte Zahl ist nicht automatisch der beste Inhalt. Mich interessiert: Was wird gespeichert? Was wird geteilt? Wofür folgen Menschen?",
    "onscreen": "VIEWS ≠ ALLES.",
    "audio": "On-Cam",
    "dur": "4–12 s",
    "note": "",
    "onscreenRequired": true
   },
   {
    "id": "v22-oli-7wochen-3",
    "action": "Blick halten, minimal näher.",
    "speech": "Und bei welchem Content bleibe ich selbst gern dran? Danach wird nicht alles neu. Nur klarer.",
    "onscreen": "NICHT ALLES NEU. NUR KLARER.",
    "audio": "On-Cam",
    "dur": "12–19 s",
    "note": "",
    "onscreenRequired": true
   }
  ],
  "platforms": [
   "Instagram",
   "TikTok",
   "Facebook"
  ],
  "publishDate": "2026-11-15",
  "variants": "A-Version komplett vorproduzieren. Zahlen nicht sprechen; falls gewünscht am 15.11. nur On-Screen-Daten ergänzen.",
  "material": "Vorproduzierbare A-Version + am 15.11. optional nur Zahlen/Text aktualisieren. Kein neuer Dreh nötig.",
  "planPhase": "preproduced",
  "preproductionRequired": true,
  "src": "V2.2"
 }
];
// Einmalige Datenkorrektur für Bestandsdaten, die mit der ersten V2.2-Fassung geseedet wurden (Importartefakte in variants usw.).
// Ersetzt ein Feld NUR, wenn es noch exakt dem alten, fehlerhaften Wert entspricht; Nutzeränderungen bleiben unberührt.
const V22_SEED_FIXES = {"v22-joga-aufstehen": {"variants": ["IG/TT 9--11 s; FB/YT gleicher Master.", "IG/TT 9–11 s; FB/YT gleicher Master."]}, "v22-joga-9090": {"variants": ["IG/FB 16 s; TT 12--14 s.", "IG/FB 16 s; TT 12–14 s."], "shots": {"v22-joga-9090-2": {"action": ["90/90 Switches 2--3 Wiederholungen.", "90/90 Switches 2–3 Wiederholungen."]}}}, "v22-oli-knie": {"variants": ["IG/FB Master 20 s; TT ggf. 17--18 s.", "IG/FB Master 20 s; TT ggf. 17–18 s."]}, "v22-joga-koerperwecker": {"variants": ["Master 18 s. Keine Moderation. ## W3/W4 --- 12.10.--25.10. --- BEREITS IN V2.1 VOLLSTÄNDIG AUSGEARBEITET Diese 14 Pieces werden **nicht neu erfunden oder überschrieben**. Sie bleiben mit ihren vorhandenen vollständigen Shotlists/Sprechtexten bestehen: - **12.10. · OLI:** MIT 56 BIN ICH WIEDER ANFÄNGER. ABSICHTLICH. - **13.10. · JOGA:** TORNADO-OPENER -- MORGENS EINGEROSTET - **14.10. · OLI:** FRÜHER KREATIVTEAM. HEUTE STATIV. - **15.10. · JOGA:** 1 MINUTE IN ALLE RICHTUNGEN -- RECUT - **16.10. · OLI:** WARUM KLINGT JEDE MARKE GLEICH? - **17.10. · JOGA:** ANTI-SCHREIBTISCH -- RÜCKEN - **18.10. · OLI:** KOPF: KANN ICH. - **19.10. · JOGA:** 3 MINUTEN AM TAG -- RECUT - **20.10. · OLI:** STEIF? MEHR DEHNEN. - **21.10. · JOGA:** TRY IT -- CHALLENGE RECUT - **22.10. · OLI:** WARUM ICH BEWEGUNG KÖRPERPFLEGE NENNE. - **23.10. · JOGA:** MOBILITY IST NICHT NUR DEHNEN -- RECUT - **24.10. · OLI:** 15 SEKUNDEN VIDEO. ZWEI STUNDEN ARBEIT. - **25.10. · JOGA:** BALANCE-CHECK -- WACKELN ERLAUBT ## W5 --- 26.10.--01.11. --- VERTIEFUNG", "Master 18 s. Keine Moderation."]}, "v22-oli-stretch37": {"variants": ["IG/TT 10--11 s.", "IG/TT 10–11 s."]}, "v22-oli-algorithmus": {"variants": ["Keine Algorithmus-Jammer-Caption. 17--20 s.", "Keine Algorithmus-Jammer-Caption. 17–20 s."]}, "v22-oli-schnellvideo": {"variants": ["Kein gesprochener CTA. ## W6 --- 02.11.--08.11. --- VORPRODUZIERT Alle Neudrehs dieser Woche vorab drehen; Recuts fertig exportieren.", "Kein gesprochener CTA."]}, "v22-oli-muskeln": {"variants": ["Keine medizinischen Versprechen. 20--22 s.", "Keine medizinischen Versprechen. 20–22 s."]}, "v22-joga-thread": {"shots": {"v22-joga-thread-3": {"onscreen": ["3--5 PRO SEITE.", "3–5 PRO SEITE."]}}}, "v22-oli-nicht-optik": {"variants": ["19--21 s.", "19–21 s."]}, "v22-oli-anleitung": {"scriptText": ["9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts. VORPRODUZIEREN: vor Beginn von W6 (02.11.) drehen, schneiden und exportieren.", "9:16. Zusätzlich 3–5 Sek. sauberer Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts. VORPRODUZIEREN: vor Beginn von W6 (02.11.) drehen, schneiden und exportieren. Nur drehen, wenn vorhandenes Equipment eine glaubwürdige Mini-Handlung ermöglicht; sonst eine Reserve-Idee verwenden."], "variants": ["Nur drehen, wenn vorhandenes Equipment eine glaubwürdige Mini-Handlung ermöglicht; sonst Reserve `v22-oli-setup-check` verwenden.", ""]}, "v22-joga-dolphin": {"variants": ["15 s. ## W7 --- 09.11.--15.11. --- VORPRODUZIERT Keine spontane Urlaubsproduktion erforderlich. Der 15.11.-Abschluss kann vollständig vorproduziert werden; nur optionale Zahlen als On-Screen-Text nachtragen.", "15 s."], "shots": {"v22-joga-dolphin-3": {"onscreen": ["6--10 LANGSAME.", "6–10 LANGSAME."]}}}, "v22-oli-stretch-vor-sport": {"variants": ["20 s; Caption muss `statisches Dehnen` präzise benennen.", "20 s; Caption muss statisches Dehnen präzise benennen."]}, "v22-oli-anfaenger2": {"variants": ["19--21 s.", "19–21 s."]}, "v22-oli-7wochen": {"variants": ["A-Version komplett vorproduzieren. Zahlen nicht sprechen; falls gewünscht am 15.11. nur On-Screen-Daten ergänzen. ## Qualitätsregeln für alle 28 neuen Seeds 1. Kein gesprochenes „Heute zeige ich...\". 2. Starker Bewegungscontent startet mit Bewegung in Frame 1. 3. Humor benötigt keine unkontrollierbaren Personen/Tiere/Ereignisse. 4. Kein künstliches Scheitern und kein künstliches „alt spielen\". 5. OLI-Haltung kurz, konkret, trocken; kein Motivationscoach-Ton. 6. On-Screen-Hooks ab Frame 1, wenn sie die Idee tragen. 7. Jeder Neudreh erhält 3--5 Sekunden sauberen Start/Ende ohne gesprochenen Text als zusätzliches Rohmaterial für spätere Recuts. 8. Maximal 5 Hashtags in späteren Captions; Hook nicht einfach in der Caption wiederholen. 9. Für W6/W7 sämtliche Dateien vorab exportieren und im Piece als fertig markieren. 10. Die 28 neuen Seeds plus die 14 V2.1-Pieces ergeben für W2--W7 genau 42 tägliche Hauptslots.", "A-Version komplett vorproduzieren. Zahlen nicht sprechen; falls gewünscht am 15.11. nur On-Screen-Daten ergänzen."]}};
const productionSeedV22 = () => PRODUCTION_SEED_V22.map(p => normPiece({ ...p, created: '2026-10-05', updated: '2026-10-05' }));


// Alt-Daten (Oli-Bibliothek) → Content-Modell. Deterministische IDs: mehrfaches Migrieren ist idempotent.
const OLI_FN = { 'Oli Geht': 'ME', 'Oli Klärt': 'DO', 'Typisch Mann': 'REACH', 'Oli Bewegt Hamburg': 'REACH' };
const OLI_STATUS_MAP = { 'Idee': 'Idee', 'Skript fertig': 'Skript fertig', 'gedreht': 'Gedreht', 'gepostet': 'Gepostet' };
function migrateOliItem(m, forceId) {
  const r = ruleFor(m.format);
  const talk = m.format === 'Oli Geht' || m.format === 'Oli Klärt';
  return normPiece({
    id: forceId || ('oli-' + m.id), world: 'OLI', fn: OLI_FN[m.format] || 'ME', format: m.format || '',
    title: m.title || '', hook: m.title || '', status: OLI_STATUS_MAP[m.status] || 'Idee', prodType: 'Neudreh',
    entry: r ? r.entry : 'Situation first', audio: r ? r.audio : 'Silent/Musik',
    speech: talk ? (m.script || '') : '', scriptText: talk ? '' : (m.script || ''), src: m.src || 'Oli-Bibliothek',
    created: '', updated: '',
  });
}
function migrateState(s) {
  const out = { ...s };
  if (!Array.isArray(out.content)) out.content = [];
  if (!Array.isArray(out.tests)) out.tests = []; // Altbestand (14-Tage-Test) bleibt unangetastet im State, ohne Funktion
  if (!out.contentMigrated) {
    const have = new Set(out.content.map(c => c.id));
    const src = Array.isArray(out.oliContent) ? out.oliContent : [];
    out.content = [...out.content, ...src.map(m => migrateOliItem(m)).filter(c => !have.has(c.id))];
    out.contentMigrated = true; // oliContent bleibt unverändert als Sicherung im State
  }
  out.content = out.content.map(normPiece);
  // V2.1: Produktions-Seeds einmalig ergänzen. Idempotent (IDs), überschreibt nichts, der Marker verhindert
  // das Wiederauftauchen gelöschter Seeds. Das Testfenster wird nur gesetzt, wenn der Nutzer keins eingetragen hat.
  if (!out.productionSeedV21) {
    const have = new Set(out.content.map(c => c.id));
    out.content = [...out.content, ...productionSeedV21().filter(c => !have.has(c.id))];
    out.productionSeedV21 = true;
  }
  // V2.2: 28 neue Pieces fuer den 7-Wochen-Plan. Eigener Marker; nur fehlende IDs; nichts wird ueberschrieben.
  if (!out.productionSeedV22SevenWeek) {
    const have = new Set(out.content.map(c => c.id));
    out.content = [...out.content, ...productionSeedV22().filter(c => !have.has(c.id))];
    out.productionSeedV22SevenWeek = true;
  }
  // V2.2-Datenbereinigung (einmalig): Die erste V2.2-Fassung hat Markdown-Reste (Wochenüberschriften, Qualitätsregeln) in `variants`
  // einzelner Seeds mitgeseedet. Korrigiert wird ein Feld nur, wenn es noch exakt dem alten Fehlerwert entspricht.
  if (!out.seedCleanV22a) {
    out.content = out.content.map(c => {
      const fx = V22_SEED_FIXES[c.id]; if (!fx) return c;
      const n = { ...c };
      Object.entries(fx).forEach(([k, v]) => { if (k !== 'shots' && n[k] === v[0]) n[k] = v[1]; });
      if (fx.shots) n.shots = n.shots.map(sh => { const f = fx.shots[sh.id]; if (!f) return sh; const m = { ...sh }; Object.entries(f).forEach(([k, v]) => { if (m[k] === v[0]) m[k] = v[1]; }); return m; });
      return n;
    });
    out.seedCleanV22a = true;
  }
  return out;
}

// Pipeline: IDEE → SKRIPT → DREH → CUTS → POST → ERGEBNIS. Zeigt für jedes Piece, wo es steht.
const hasPerf = (p) => p.perf.some(x => Number(x.views) > 0);
function pipeState(p) {
  const st = C_STATUS.indexOf(p.status);
  const doneThrough = [-1, 1, 1, 2, 3, hasPerf(p) ? 5 : 4][st];
  const active = doneThrough >= 5 ? -1 : doneThrough + 1;
  return PIPE.map((_, i) => i <= doneThrough ? 'done' : i === active ? 'active' : 'todo');
}
const pipeNow = (p) => { const s = pipeState(p), i = s.indexOf('active'); return i < 0 ? 'abgeschlossen' : PIPE[i]; };

/* ---------- Content-System: UI ---------- */
const lblStyle = { fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', margin: '14px 0 6px' };
const NumD = ({ value, onChange, placeholder }) => (
  <input type="number" inputMode="decimal" step="any" value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
);
const WorldBadge = ({ w }) => (
  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', padding: '2px 7px', borderRadius: 4, background: w === 'OLI' ? 'var(--accent)' : 'var(--panel2)', color: w === 'OLI' ? 'var(--accent-ink)' : 'var(--text)' }}>{w}</span>
);

function PipeBar({ p, compact, onJump }) {
  const st = pipeState(p);
  return (
    <div style={{ display: 'flex', gap: compact ? 3 : 5 }}>
      {PIPE.map((l, i) => (
        <div key={l} data-pipe={l} data-state={st[i]} onClick={onJump ? () => onJump(i) : undefined} style={{ flex: 1, cursor: onJump ? 'pointer' : 'default', textAlign: 'center' }}>
          <div style={{ height: compact ? 4 : 7, borderRadius: 3, background: st[i] === 'done' ? 'var(--accent)' : 'var(--panel2)', border: st[i] === 'active' ? '1px solid var(--accent)' : '1px solid transparent' }} />
          {!compact && <div style={{ fontSize: 9, marginTop: 5, letterSpacing: '.04em', color: st[i] === 'todo' ? 'var(--muted)' : 'var(--accent)', fontWeight: st[i] === 'active' ? 800 : 600 }}>{l}</div>}
        </div>
      ))}
    </div>
  );
}

// Sortierbare Shotliste. Drag & Drop per Pointer-Events (funktioniert auch auf dem Handy), zusätzlich ▲▼.
function ShotList({ shots, onChange, defaultAudio }) {
  const [open, setOpen] = useState(null);
  const [drag, setDrag] = useState(null);
  const refs = useRef({});
  const setShot = (id, patch) => onChange(shots.map(s => s.id === id ? { ...s, ...patch } : s));
  const move = (from, to) => { if (to < 0 || to >= shots.length || from === to) return; const a = shots.slice(); const [x] = a.splice(from, 1); a.splice(to, 0, x); onChange(a); };
  const startDrag = (ev, idx) => {
    ev.preventDefault();
    const startY = ev.clientY, id = shots[idx].id;
    const rects = shots.map(s => refs.current[s.id].getBoundingClientRect());
    setDrag({ id, dy: 0 });
    const onMove = (e) => setDrag({ id, dy: e.clientY - startY });
    const onUp = (e) => {
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp);
      const y = rects[idx].top + rects[idx].height / 2 + (e.clientY - startY);
      const pos = rects.filter((r, i) => i !== idx && (r.top + r.height / 2) < y).length;
      setDrag(null);
      move(idx, pos);
    };
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
  };
  const total = Math.round(shots.reduce((a, s) => a + durSec(s.dur), 0) * 10) / 10;
  return (
    <div>
      <div className="meta">{shots.length} Shots · Σ {total} Sek.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0' }}>
        {shots.map((s, i) => (
          <div key={s.id} data-shot={i + 1} ref={el => { refs.current[s.id] = el; }}
            style={{ background: 'var(--panel2)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px', position: 'relative', transform: drag && drag.id === s.id ? `translateY(${drag.dy}px)` : 'none', zIndex: drag && drag.id === s.id ? 3 : 1, boxShadow: drag && drag.id === s.id ? '0 6px 18px rgba(0,0,0,.5)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span data-handle onPointerDown={ev => startDrag(ev, i)} title="Ziehen zum Sortieren" style={{ touchAction: 'none', cursor: 'grab', padding: '6px 8px', color: 'var(--muted)', fontSize: 18, lineHeight: 1, userSelect: 'none' }}>⠿</span>
              <div style={{ flex: 1, minWidth: 0 }} onClick={() => setOpen(open === s.id ? null : s.id)}>
                <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>SHOT {i + 1}{s.action ? ' | ' + s.action : ''}</div>
                <div className="meta" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{[s.speech && '„' + s.speech + '“', AUDIO_SHORT[s.audio] || s.audio, fmtDur(s.dur)].filter(Boolean).join(' | ')}</div>
              </div>
              <button className="x" aria-label="nach oben" onClick={() => move(i, i - 1)}>▲</button>
              <button className="x" aria-label="nach unten" onClick={() => move(i, i + 1)}>▼</button>
            </div>
            {open === s.id && (
              <div style={{ marginTop: 8 }}>
                <Field label="Kamera / Bildausschnitt"><input value={s.camera || ''} onChange={e => setShot(s.id, { camera: e.target.value })} placeholder="z. B. Halbtotale, Detail Hände" /></Field>
                <Field label="Bild / Aktion"><input value={s.action} onChange={e => setShot(s.id, { action: e.target.value })} /></Field>
                <Field label="Gesprochener Text"><textarea rows={2} value={s.speech} onChange={e => setShot(s.id, { speech: e.target.value })} /></Field>
                <Field label="On-Screen-Text"><input value={s.onscreen} onChange={e => setShot(s.id, { onscreen: e.target.value })} /></Field>
                <label data-onscreen-required style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 8px', fontSize: 13, color: 'var(--muted)' }}><input type="checkbox" checked={!!s.onscreenRequired} onChange={e => setShot(s.id, { onscreenRequired: e.target.checked })} style={{ width: 20, height: 20, flex: 'none' }} />On-Screen-Text ist Pflicht (trägt Hook oder Pointe)</label>
                <div className="grid2">
                  <Field label="Audioart"><select value={s.audio} onChange={e => setShot(s.id, { audio: e.target.value })}>{AUDIOS.map(a => <option key={a}>{a}</option>)}</select></Field>
                  <Field label="Geschätzte Dauer (Sek. oder Bereich)"><input value={s.dur ?? ''} onChange={e => setShot(s.id, { dur: e.target.value })} placeholder="3 oder 0–3 s" /></Field>
                </div>
                <Field label="Notiz"><input value={s.note} onChange={e => setShot(s.id, { note: e.target.value })} /></Field>
                <div className="row end"><Btn small onClick={() => onChange(shots.filter(x => x.id !== s.id))}>Shot löschen</Btn></div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Btn small onClick={() => { const n = { ...newShot(), audio: defaultAudio || 'On-Cam' }; onChange([...shots, n]); setOpen(n.id); }}>+ Shot</Btn>
    </div>
  );
}

function ContentDetail({ id, state, update, onClose, gotoContent }) {
  const p = state.content.find(c => c.id === id);
  const secRefs = useRef({});
  const [blocked, setBlocked] = useState([]);
  if (!p) return null;
  const set = (patch) => update(s => ({ ...s, content: s.content.map(c => c.id === id ? { ...c, ...patch, updated: todayISO() } : c) }));
  const jump = (i) => { const el = secRefs.current[i]; if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const rule = ruleFor(p.format);
  const setFormat = (v) => { const r = ruleFor(v); const patch = { format: v }; if (r) { if (!p.entryManual) patch.entry = r.entry; if (!p.audioManual) patch.audio = r.audio; } set(patch); };
  const changeStatus = (v) => { if (v === 'Drehbereit') { const m = readinessMissing(p); if (m.length) { setBlocked(m); return; } } setBlocked([]); set({ status: v }); };
  const resetDefaults = () => { if (rule) set({ entry: rule.entry, audio: rule.audio, entryManual: false, audioManual: false }); };
  const shoot = state.shoots.find(s => s.id === p.shootId);
  const siblings = p.shootId ? state.content.filter(c => c.shootId === p.shootId && c.id !== p.id) : [];
  const moves = p.moveIds.map(mid => state.moves.find(m => m.id === mid)).filter(Boolean);
  // Hook-Bibliothek: gemerkte Hooks + Hook-Ideen der Moves (zuerst die der gewählten Moves)
  const hookOptions = (() => { const seen = new Set(), out = []; const add = (v, l) => { if (v && !seen.has(v)) { seen.add(v); out.push({ v, l }); } };
    moves.forEach(m => add(m.hookIdea, m.title + ': ' + m.hookIdea));
    state.hookNotes.forEach(n => add(n.line, 'Gemerkt: ' + n.line));
    state.moves.forEach(m => add(m.hookIdea, m.title + ': ' + m.hookIdea)); return out; })();
  const addCut = () => { const n = newPiece({ world: p.world, fn: p.fn, shootId: p.shootId, moveIds: p.moveIds, material: p.material, prodType: 'Bestand', title: '', status: 'Idee' }); update(s => ({ ...s, content: [...s.content, n] })); gotoContent(n.id); };
  const del = () => { if (confirm('Content-Piece löschen?')) { update(s => ({ ...s, content: s.content.filter(c => c.id !== id), shoots: s.shoots.map(sh => ({ ...sh, cuts: sh.cuts.map(c => c.contentId === id ? { ...c, contentId: '' } : c) })) })); onClose(); } };
  const setPerf = (eid, patch) => set({ perf: p.perf.map(e => e.id === eid ? { ...e, ...patch } : e) });
  const sec = (i, title, children) => (
    <div ref={el => { secRefs.current[i] = el; }} className="sheet" data-section={PIPE[i]}>
      <h2 style={{ marginBottom: 4 }}>{i + 1} · {title}</h2>
      {children}
    </div>
  );
  const choice = (opts, val, on) => <div className="row wrap">{opts.map(o => <Tag key={o} on={val === o} onClick={() => on(o)}>{o}</Tag>)}</div>;
  return (
    <section>
      <header className="head"><Btn small onClick={onClose}>← Zurück</Btn><div className="row" style={{ margin: 0 }}><WorldBadge w={p.world} /><span className={`type type-${p.fn}`}>{p.fn}</span></div></header>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>{p.title || '(ohne Titel)'}</h1>
      <PipeBar p={p} onJump={jump} />
      <div className="row between" style={{ marginTop: 10 }}>
        <span className="meta" data-now>Jetzt: <b style={{ color: 'var(--accent)' }}>{pipeNow(p)}</b></span>
        <select value={p.status} data-status onChange={e => changeStatus(e.target.value)} style={{ width: 'auto' }}>{C_STATUS.map(s => <option key={s}>{s}</option>)}</select>
      </div>
      {blocked.length > 0 && <div className="warn" data-blocked>Nicht drehbereit. Es fehlt: {blocked.join(' · ')}</div>}
      {blocked.length === 0 && p.status === 'Drehbereit' && readinessMissing(p).length > 0 && <div className="warn" data-incomplete>Als Drehbereit markiert, aber unvollständig: {readinessMissing(p).join(' · ')}</div>}
      {blocked.length === 0 && (p.status === 'Idee' || p.status === 'Skript fertig') && readinessMissing(p).length > 0 && <div className="meta" data-needs style={{ marginTop: 6 }}>Für „Drehbereit“ fehlt noch: {readinessMissing(p).join(' · ')}</div>}

      {sec(0, 'Idee', <>
        <div style={lblStyle}>Content-Welt</div>{choice(WORLDS, p.world, v => set({ world: v }))}
        <div style={lblStyle}>Funktion</div>
        <div className="row wrap">{TYPES.map(t => <Tag key={t} on={p.fn === t} onClick={() => set({ fn: t })}>{t}</Tag>)}</div>
        <div className="hint">{TYPE_INFO[p.fn]}</div>
        <Field label="Format (frei, mit Presets)"><input list="format-presets" value={p.format} onChange={e => setFormat(e.target.value)} placeholder="z. B. Oli Klärt, Routine / 1 Minute JOGA …" /></Field>
        <datalist id="format-presets">{FORMAT_PRESETS.map(f => <option key={f} value={f} />)}</datalist>
        <Field label="Titel"><input value={p.title} onChange={e => set({ title: e.target.value })} /></Field>
        <Field label="Hook"><input value={p.hook} onChange={e => set({ hook: e.target.value })} /></Field>
        {hookOptions.length > 0 && <select data-hook-picker value="" onChange={e => { if (e.target.value) set({ hook: e.target.value }); }}>
          <option value="">Hook aus Bibliothek wählen …</option>
          {hookOptions.map(h => <option key={h.v} value={h.v}>{h.l}</option>)}
        </select>}
        <Field label="Ziel / Hypothese des Posts"><textarea rows={3} value={p.goal} onChange={e => set({ goal: e.target.value })} placeholder="Was soll dieser Post zeigen oder testen?" /></Field>
      </>)}

      {sec(1, 'Skript', <>
        <div style={lblStyle}>Einstieg {rule && !p.entryManual && <span className="meta" style={{ textTransform: 'none', letterSpacing: 0 }}>· Default</span>}{p.entryManual && <span className="meta" style={{ textTransform: 'none', letterSpacing: 0 }}>· manuell</span>}</div>
        {choice(ENTRIES, p.entry, v => set({ entry: v, entryManual: true }))}
        <div style={lblStyle}>Audio {rule && !p.audioManual && <span className="meta" style={{ textTransform: 'none', letterSpacing: 0 }}>· Default</span>}{p.audioManual && <span className="meta" style={{ textTransform: 'none', letterSpacing: 0 }}>· manuell</span>}</div>
        {choice(AUDIOS, p.audio, v => set({ audio: v, audioManual: true }))}
        {rule && <div className="hint" data-rule>Regel „{rule.format}“: {rule.note}{(p.entryManual || p.audioManual) ? ' ' : ''}{(p.entryManual || p.audioManual) && <button className="x" style={{ fontSize: 13, textDecoration: 'underline' }} onClick={resetDefaults}>Zurück auf Default</button>}</div>}
        <Field label="Sprechtext"><textarea rows={5} value={p.speech} onChange={e => set({ speech: e.target.value })} /></Field>
        <div style={lblStyle}>Drehskript / Shotlist</div>
        <ShotList shots={p.shots} onChange={shots => set({ shots })} defaultAudio={p.audio === 'Silent/Musik' ? 'Silent/Musik' : p.audio === 'Voice-over' ? 'Voice-over' : 'On-Cam'} />
        <Field label="Drehskript (frei, Notizen)"><textarea rows={4} value={p.scriptText} onChange={e => set({ scriptText: e.target.value })} /></Field>
      </>)}

      {sec(2, 'Dreh', <>
        <div style={lblStyle}>Produktionsart</div>{choice(PROD_TYPES, p.prodType, v => set({ prodType: v }))}
        <Field label="Produktions-/Drehdatum (optional)"><input type="date" value={p.productionDate} onChange={e => set({ productionDate: e.target.value })} /></Field>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 8px', fontSize: 13, color: 'var(--muted)' }}><input type="checkbox" checked={!!p.preproductionRequired} onChange={e => set({ preproductionRequired: e.target.checked })} style={{ width: 20, height: 20, flex: 'none' }} />Muss vorproduziert werden (spätestens „Geschnitten“ vor der Veröffentlichung, keine spontane Aufnahme)</label>
        <Field label="Master-Dreh (Rohmaterial)"><select value={p.shootId} onChange={e => { const v = e.target.value; const sh = state.shoots.find(s => s.id === v); set({ shootId: v, ...(sh && p.moveIds.length === 0 ? { moveIds: sh.moves } : {}) }); }}>
          <option value="">– keiner –</option>
          {state.shoots.slice().sort((a, b) => b.date.localeCompare(a.date)).map(s => <option key={s.id} value={s.id}>{fmtD(s.date)} · {s.theme}</option>)}
        </select></Field>
        <div style={lblStyle}>Benötigte Moves</div>
        <div className="row wrap">{moves.map(m => <Tag key={m.id} on onClick={() => set({ moveIds: p.moveIds.filter(x => x !== m.id) })}>{m.title} ×</Tag>)}{moves.length === 0 && <span className="meta">Keine gewählt</span>}</div>
        <select value="" onChange={e => { if (e.target.value) set({ moveIds: [...p.moveIds, e.target.value] }); }}>
          <option value="">+ Move hinzufügen …</option>
          {state.moves.filter(m => m.src !== '22 Flows' && !p.moveIds.includes(m.id)).map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <Field label="Vorhandenes Ausgangsmaterial"><textarea rows={3} value={p.material} onChange={e => set({ material: e.target.value })} placeholder="Welches Rohmaterial gibt es schon? (Clips, Ordner, Dreh vom …)" /></Field>
      </>)}

      {sec(3, 'Cuts', <>
        <Field label="Geplante Cuts / Varianten"><textarea rows={3} value={p.variants} onChange={e => set({ variants: e.target.value })} placeholder="z. B. andere Hook, 15-Sek.-Version, Recut in einer Woche" /></Field>
        {p.shootId ? <>
          <div style={lblStyle}>Weitere Pieces aus demselben Master{shoot ? ' · ' + shoot.theme : ''}</div>
          {siblings.length === 0 && <div className="meta">Noch keine weiteren.</div>}
          <ul className="list">{siblings.map(c => <li key={c.id} className="card slim" onClick={() => gotoContent(c.id)}><div className="hook">{c.title || '(ohne Titel)'}</div><div className="meta">{c.world} · {c.fn} · {c.format || '–'} · {c.status}</div></li>)}</ul>
          <div className="row"><Btn small onClick={addCut}>+ Weiteren Cut aus diesem Master</Btn></div>
        </> : <div className="hint">Verknüpfe in Schritt 3 einen Master-Dreh, um mehrere Pieces aus demselben Rohmaterial zu bündeln.</div>}
      </>)}

      {sec(4, 'Post', <>
        <div style={lblStyle}>Plattformen</div>
        <div className="row wrap">{PLATFORMS.map(pl => <Tag key={pl} on={p.platforms.includes(pl)} onClick={() => set({ platforms: p.platforms.includes(pl) ? p.platforms.filter(x => x !== pl) : [...p.platforms, pl] })}>{pl}</Tag>)}</div>
        <Field label="Veröffentlichungsdatum"><input type="date" value={p.publishDate} onChange={e => set({ publishDate: e.target.value })} /></Field>
        <Field label="Caption (optional)"><textarea rows={3} value={p.caption} onChange={e => set({ caption: e.target.value })} placeholder="Max. 5 Hashtags. Hook nicht einfach wiederholen." /></Field>
      </>)}

      {sec(5, 'Ergebnis', <>
        {p.perf.length === 0 && <div className="hint">Noch keine Performance-Daten. Pro Plattform ein Eintrag.</div>}
        {p.perf.map(e => (
          <div key={e.id} data-perf className="sheet" style={{ background: 'var(--panel2)' }}>
            <div className="grid2">
              <Field label="Plattform"><select value={e.platform} onChange={ev => setPerf(e.id, { platform: ev.target.value })}>{PLATFORMS.map(x => <option key={x}>{x}</option>)}</select></Field>
              <Field label="Datum (leer = Veröffentlichung)"><input type="date" value={e.date} onChange={ev => setPerf(e.id, { date: ev.target.value })} /></Field>
            </div>
            <div className="grid3">
              <Field label="Views"><NumD value={e.views} onChange={v => setPerf(e.id, { views: v })} /></Field>
              <Field label="Reichweite"><NumD value={e.reach} onChange={v => setPerf(e.id, { reach: v })} /></Field>
              <Field label="Non-Follower %"><NumD value={e.nonFollower} onChange={v => setPerf(e.id, { nonFollower: v })} /></Field>
              <Field label="Ø Wiedergabe Sek."><NumD value={e.avgWatch} onChange={v => setPerf(e.id, { avgWatch: v })} /></Field>
              <Field label="Completion %"><NumD value={e.completion} onChange={v => setPerf(e.id, { completion: v })} /></Field>
              <Field label="Likes / Reactions"><NumD value={e.likes} onChange={v => setPerf(e.id, { likes: v })} /></Field>
              <Field label="Kommentare"><NumD value={e.comments} onChange={v => setPerf(e.id, { comments: v })} /></Field>
              <Field label="Shares"><NumD value={e.shares} onChange={v => setPerf(e.id, { shares: v })} /></Field>
              <Field label="Saves"><NumD value={e.saves} onChange={v => setPerf(e.id, { saves: v })} /></Field>
            </div>
            <Field label="Neue Follower"><NumD value={e.newFollowers} onChange={v => setPerf(e.id, { newFollowers: v })} /></Field>
            <div className="stats" style={{ gridTemplateColumns: 'repeat(4,1fr)' }} data-ratios>
              <div><b>{fmtP(pct(e.newFollowers, e.views))}</b><small>Follower / Views</small></div>
              <div><b>{fmtP(pct(e.saves, e.views))}</b><small>Saves / Views</small></div>
              <div><b>{fmtP(pct(e.shares, e.views))}</b><small>Shares / Views</small></div>
              <div><b>{fmtP(pct(e.comments, e.views))}</b><small>Komm. / Views</small></div>
            </div>
            <div className="row end"><Btn small onClick={() => set({ perf: p.perf.filter(x => x.id !== e.id) })}>Eintrag löschen</Btn></div>
          </div>
        ))}
        <Btn small onClick={() => set({ perf: [...p.perf, newPerf(p.platforms[0] || 'Instagram')] })}>+ Performance-Eintrag</Btn>
      </>)}
      <div className="row end"><Btn small onClick={del}>Piece löschen</Btn></div>
    </section>
  );
}

/* ---------- V2.2: Ansichten (alles berechnete Ansichten auf state.content) ---------- */
const Pill = ({ children }) => <span style={{ fontSize: 12, padding: '2px 9px', borderRadius: 999, border: '1px solid var(--line)', color: 'var(--text)' }}>{children}</span>;
const WRAP = { overflowWrap: 'anywhere' }; // lange Wortketten aus dem Plan (z. B. „Yoga/Pilates/Unterrichtsvorbereitung“) dürfen umbrechen
const stIdx = (p) => C_STATUS.indexOf(p.status);
const isDone = (p) => stIdx(p) >= 4; // Geschnitten oder Gepostet
const pieceLen = (p) => Math.round(p.shots.reduce((a, s) => a + durSec(s.dur), 0) * 10) / 10;
const byDate = (a, b) => (a.publishDate || '9999').localeCompare(b.publishDate || '9999');
// Ampel: Grün = fertig/geschnitten/gepostet · Gelb = noch ≥ 48 h · Rot = < 48 h (oder überfällig) und nicht fertig
function ampel(p, today) {
  if (isDone(p)) return { c: 'green', t: p.status === 'Gepostet' ? 'gepostet' : 'fertig' };
  const left = dayDiff(p.publishDate, today);
  if (left < 0) return { c: 'red', t: 'überfällig' };
  return left < 2 ? { c: 'red', t: left === 0 ? 'heute' : 'morgen' } : { c: 'yellow', t: 'in ' + left + ' Tagen' };
}
const AMPEL_COL = { green: '#7fbf6a', yellow: '#e0b04a', red: '#d9534f' };
const Dot = ({ c }) => <span data-ampel={c} style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: AMPEL_COL[c], marginRight: 6, flex: 'none' }} />;
// Vorproduktion (Urlaubsabsicherung): `preproductionRequired` ist nur die Planungsabsicht.
// VORPRODUZIEREN = muss noch produziert werden · VORPRODUZIERT = Piece ist mindestens „Geschnitten“.
const preState = (p) => !p.preproductionRequired ? '' : isDone(p) ? 'VORPRODUZIERT' : 'VORPRODUZIEREN';
const PreBadge = ({ s }) => !s ? null : <span data-pre={s} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', background: s === 'VORPRODUZIERT' ? '#7fbf6a' : 'var(--accent)', color: '#1a1408' }}>{s}</span>;
const preCount = (list) => { const req = list.filter(p => p.preproductionRequired); return { n: req.length, done: req.filter(isDone).length }; };
const readinessLabel = (p) => { if (p.status === 'Gepostet') return 'veröffentlicht'; if (isDone(p)) return 'fertig'; const m = readinessMissing(p); return m.length ? '⚠ ' + m.length + ' fehlt' : '✓ vollständig'; };

const PLAN_START = '2026-09-28', PLAN_END = '2026-11-15';
const PLAN_WEEKS = Array.from({ length: 7 }, (_, i) => ({ n: i + 1, start: addDays(PLAN_START, 7 * i), end: addDays(PLAN_START, 7 * i + 6) }));
const WEEK_LABEL = ['BASELINE · rückblickend', 'Übergang / Vorproduktion', 'Testphase', 'Testphase', 'Vertiefung', 'Vorproduktion', 'Vorproduktion'];
const weekIdxOf = (iso) => { const d = dayDiff(iso, PLAN_START); return d < 0 ? 0 : d > 48 ? 6 : Math.floor(d / 7); };
const STAGES = [['ideen', 'IDEEN', 'Idee'], ['skripte', 'SKRIPTE', 'Skript fertig'], ['drehen', 'DREHEN', 'Drehbereit'], ['schneiden', 'SCHNEIDEN', 'Gedreht'], ['bereit', 'BEREIT', 'Geschnitten']];

/* ---- Produktionskarte: ohne externe Notiz drehbar (Neudreh) bzw. exakter Schnittplan (Recut/Bestand) ---- */
function ProdCard({ p, idx, gotoContent, onStatus }) {
  const miss = readinessMissing(p), len = pieceLen(p), neu = p.prodType === 'Neudreh';
  const L = ({ k, children }) => <div style={{ marginTop: 4 }}><b>{k}: </b>{children}</div>;
  return (
    <div data-prod-card data-id={p.id} className="sheet" style={{ marginBottom: 16, ...WRAP }}>
      <div className="row between">
        <div className="meta">{idx != null ? (neu ? 'DREH ' : 'SCHNITT ') + (idx + 1) + ' · ' : ''}POST {p.publishDate ? wdName(p.publishDate) + ' ' + fmtD(p.publishDate) : '–'}{p.productionDate ? ' · PRODUKTION ' + fmtD(p.productionDate) : ''}</div>
        <Btn small onClick={() => gotoContent(p.id)}>Öffnen</Btn>
      </div>
      <h2 style={{ margin: '4px 0 8px' }}>{p.title}</h2>
      <div className="row wrap"><WorldBadge w={p.world} /><span className={`type type-${p.fn}`}>{p.fn}</span><Pill>{p.prodType}</Pill><Pill>{p.entry}</Pill><Pill>{AUDIO_SHORT[p.audio] || p.audio}</Pill><Pill>9:16</Pill>{len > 0 && <Pill>{len} Sek.</Pill>}{p.preproductionRequired && <PreBadge s={preState(p)} />}</div>
      {!neu && <div className="hint" data-schnittplan style={{ marginTop: 8 }}><b>SCHNITTPLAN – KEIN NEUDREH.</b> Material, Ausschnitte, Reihenfolge, On-Screen-Text, Audio und Länge stehen unten exakt.</div>}
      {miss.length > 0 && <div className="warn" data-warn>NICHT DREHBEREIT: {miss.join(' · ')}</div>}
      <p style={{ margin: '10px 0 4px' }}><b>Hook: </b>{p.hook}</p>
      {p.goal && <L k="Ziel / Hypothese">{p.goal}</L>}
      {p.platforms.length > 0 && <L k="Plattformen">{p.platforms.join(' · ')}</L>}
      {p.material && <L k={neu ? 'Material / Setup' : 'Material (Quelle)'}>{p.material}</L>}
      {p.scriptText && <p className="meta" style={{ textTransform: 'none', letterSpacing: 0, margin: '8px 0 10px' }}><b>Produktionsnotiz: </b>{p.scriptText}</p>}
      {p.shots.map((sh, i) => (
        <div key={sh.id} data-shot-card style={{ borderLeft: '3px solid var(--accent)', background: 'var(--panel2)', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
          <div className="row between" style={{ margin: 0 }}><b>{neu ? 'SHOT' : 'AUSSCHNITT'} {i + 1}</b><span className="meta">{fmtDur(sh.dur)} · {AUDIO_SHORT[sh.audio] || sh.audio}</span></div>
          {sh.camera && <div className="meta" style={{ marginTop: 4, textTransform: 'none', letterSpacing: 0 }}>Kamera: {sh.camera}</div>}
          <div style={{ marginTop: 4 }}>{sh.action}</div>
          {sh.speech && <div style={{ marginTop: 4 }}><b>Sagen: </b>„{sh.speech}“</div>}
          {sh.onscreen && <div style={{ marginTop: 4 }}><b>On-Screen: </b>{sh.onscreen}</div>}
          {sh.note && <div className="meta" style={{ marginTop: 4, textTransform: 'none', letterSpacing: 0 }}>{sh.note}</div>}
        </div>
      ))}
      <div data-danach style={{ marginTop: 8, fontSize: 14 }}>
        <div className="meta" style={{ marginBottom: 2 }}>DANACH</div>
        <div><b>Masterlänge: </b>{len > 0 ? len + ' Sek.' : '–'}</div>
        {p.variants && <div><b>Schnitt / Plattformvarianten: </b>{p.variants}</div>}
        {p.caption && <div><b>Caption: </b>{p.caption}</div>}
      </div>
      {onStatus && p.status === 'Drehbereit' && <div className="row" style={{ marginTop: 12 }}>
        {neu ? <Btn kind="primary" onClick={() => onStatus(p.id, 'Gedreht')}>Als gedreht markieren</Btn>
          : <Btn kind="primary" onClick={() => onStatus(p.id, 'Geschnitten')}>Als geschnitten markieren</Btn>}
      </div>}
    </div>
  );
}

function PieceRow({ p, onOpen, today }) {
  return (
    <li data-piece data-id={p.id} className="card slim" style={WRAP} onClick={() => onOpen(p.id)}>
      <div className="card-top"><div className="row" style={{ margin: 0 }}><WorldBadge w={p.world} /><span className={`type type-${p.fn}`}>{p.fn}</span>{p.format && <span className="meta">{p.format}</span>}</div><span className="meta">{p.publishDate ? wdName(p.publishDate) + ' ' + fmtD(p.publishDate) : 'ohne Datum'}</span></div>
      <div className="hook">{p.title || '(ohne Titel)'}</div>
      <div className="meta">{p.status} · {p.prodType} · {p.entry} · {AUDIO_SHORT[p.audio]}{p.platforms.length ? ' · ' + p.platforms.join(', ') : ''}</div>
      <div style={{ marginTop: 8 }}><PipeBar p={p} compact /></div>
    </li>
  );
}

/* ---- HEUTE: Was muss ich jetzt tun? (berechnet, kein eigener Datentopf) ---- */
function HeuteView({ state, update, gotoContent, gotoBriefing }) {
  const today = todayISO(), horizon = addDays(today, 7);
  const markPosted = (p) => {
    if (stIdx(p) < 4 && !confirm('„' + (p.title || 'Piece') + '“ ist noch nicht geschnitten. Trotzdem als gepostet markieren?')) return;
    update(s => ({ ...s, content: s.content.map(c => c.id === p.id ? { ...c, status: 'Gepostet', updated: todayISO() } : c) }));
  };
  const open = state.content.filter(p => p.status !== 'Gepostet');
  const A = state.content.filter(p => p.publishDate === today).sort((a, b) => a.title.localeCompare(b.title));
  const rank = (p) => (p.productionDate === today ? 0 : p.status === 'Drehbereit' && p.prodType === 'Neudreh' ? 1 : p.status === 'Drehbereit' ? 2 : 3);
  const B = open.filter(p => !isDone(p) && ((p.productionDate && p.productionDate <= today) || (p.publishDate && p.publishDate <= horizon))).sort((a, b) => rank(a) - rank(b) || byDate(a, b));
  const C = open.filter(p => p.publishDate && p.publishDate <= horizon && !isDone(p)).sort(byDate);
  const greens = state.content.filter(p => p.publishDate >= today && p.publishDate <= horizon && isDone(p)).length;
  const D = open.filter(p => p.publishDate > today).sort(byDate).slice(0, 3);
  const act = (p) => p.status === 'Drehbereit' ? (p.prodType === 'Neudreh' ? 'Dreh öffnen' : 'Schnitt öffnen') : p.status === 'Gedreht' ? 'Schnitt öffnen' : 'Öffnen';
  const go = (p) => p.status === 'Drehbereit' ? gotoBriefing(p.id) : gotoContent(p.id); // Drehbereit → Drehbriefing, sonst Editor
  const sec = (id, title, sub, children) => <div data-heute={id} className="sheet" style={WRAP}><h2 style={{ marginBottom: 2 }}>{title}</h2>{sub && <div className="hint" style={{ marginTop: 0 }}>{sub}</div>}{children}</div>;
  return (
    <section>
      <header className="head"><h1>Heute</h1><span className="meta" data-today>{wdName(today)} {fmtD(today)}{today.slice(0, 4)}</span></header>
      {sec('A', 'Heute posten', A.length ? A.length + ' Piece' + (A.length > 1 ? 's' : '') : null, A.length === 0 ? <div className="meta" data-empty>Heute ist nichts zum Posten geplant.</div> : A.map(p => (
        <div key={p.id} data-card className="card slim" style={{ marginTop: 8 }}>
          <div className="row wrap" style={{ margin: 0 }}><WorldBadge w={p.world} /><span className={`type type-${p.fn}`}>{p.fn}</span><span className="meta">{p.prodType} · {p.status}</span></div>
          <div className="hook" style={{ marginTop: 4 }}>{p.title}</div>
          <div className="meta">{p.platforms.join(' · ') || 'keine Plattform gewählt'}</div>
          <div className="row" style={{ marginTop: 8 }}><Btn small onClick={() => gotoContent(p.id)}>Öffnen</Btn>{p.status !== 'Gepostet' ? <Btn small kind="primary" onClick={() => markPosted(p)}>Als gepostet markieren</Btn> : <span className="meta">✓ gepostet</span>}</div>
        </div>
      )))}
      {sec('B', 'Heute produzieren', B.length ? 'Fällig in den nächsten 7 Tagen und noch nicht geschnitten. Drehbereite Neudrehs zuerst.' : null, B.length === 0 ? <div className="meta" data-empty>Nichts zu produzieren.</div> : B.map(p => (
        <div key={p.id} data-card data-id={p.id} className="card slim" style={{ marginTop: 8 }}>
          <div className="card-top"><div className="hook">{p.title}</div></div>
          <div className="meta">Veröffentlichung {wdName(p.publishDate)} {fmtD(p.publishDate)} · {pieceLen(p) ? pieceLen(p) + ' Sek.' : 'Länge offen'} · {p.entry} · {AUDIO_SHORT[p.audio]} · {p.prodType}</div>
          {p.material && <div className="meta" style={{ textTransform: 'none', letterSpacing: 0 }}>Material: {p.material}</div>}
          {p.preproductionRequired && <div style={{ marginTop: 6 }}><PreBadge s={preState(p)} /></div>}
          <div className="row" style={{ marginTop: 8 }}><Btn small kind={p.status === 'Drehbereit' ? 'primary' : undefined} onClick={() => go(p)}>{act(p)}</Btn></div>
        </div>
      )))}
      {sec('C', 'Offen / gefährdet', 'Nächste 7 Tage, Status noch zu niedrig. Rot: unter 48 h. Gelb: noch mindestens 48 h.' + (greens ? ' ' + greens + ' bereits fertig (grün).' : ''), C.length === 0 ? <div className="meta" data-empty>Nichts gefährdet.</div> : C.map(p => { const a = ampel(p, today); return (
        <div key={p.id} data-risk data-id={p.id} className="row between" onClick={() => gotoContent(p.id)} style={{ cursor: 'pointer', margin: '8px 0' }}>
          <span style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}><Dot c={a.c} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span></span>
          <span className="meta" style={{ flex: 'none' }}>{wdName(p.publishDate)} {fmtD(p.publishDate)} · {p.status} · {a.t}</span>
        </div>); }))}
      {sec('D', 'Danach', 'Die nächsten drei Veröffentlichungen.', D.length === 0 ? <div className="meta" data-empty>Keine weiteren geplanten Pieces.</div> : D.map(p => (
        <div key={p.id} data-next className="row between" onClick={() => gotoContent(p.id)} style={{ cursor: 'pointer', margin: '8px 0' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><WorldBadge w={p.world} /> {p.title}</span><span className="meta" style={{ flex: 'none' }}>{wdName(p.publishDate)} {fmtD(p.publishDate)}</span>
        </div>)))}
    </section>
  );
}

/* ---- 7-WOCHEN-PLAN: 28.09.–15.11.2026, ein Hauptslot pro Tag; öffnet immer das Original ---- */
function PlanView({ state, gotoContent, ui, setUi }) {
  const today = todayISO();
  const wk = ui.planWeek, view = ui.planView, W = PLAN_WEEKS[wk];
  const piecesOn = (d) => state.content.filter(p => p.publishDate === d);
  const plannedDays = (() => { let n = 0; for (let i = 7; i < 49; i++) if (piecesOn(addDays(PLAN_START, i)).length) n++; return n; })();
  const days = (w) => Array.from({ length: 7 }, (_, i) => addDays(w.start, i));
  const weekPieces = (w) => state.content.filter(p => p.publishDate >= w.start && p.publishDate <= w.end);
  const weekPre = preCount(weekPieces(W));
  const allPre = preCount(state.content);
  const Slot = ({ p }) => (
    <div data-slot data-id={p.id} className="card slim" onClick={() => gotoContent(p.id)} style={{ marginTop: 6, ...WRAP }}>
      <div className="row wrap" style={{ margin: 0 }}><WorldBadge w={p.world} /><span className={`type type-${p.fn}`}>{p.fn}</span><span className="meta">{p.format}</span></div>
      <div className="hook" style={{ marginTop: 4 }}>{p.title}</div>
      <div className="meta">{p.prodType} · {p.platforms.join(', ') || '–'}</div>
      <div className="row between" style={{ margin: '2px 0 0' }}><span className="meta" data-readiness>{p.status} · {readinessLabel(p)}</span>{p.preproductionRequired && <PreBadge s={preState(p)} />}</div>
    </div>
  );
  return (
    <section>
      <header className="head"><h1>7-Wochen-Plan</h1></header>
      <div className="hint" data-plan-count style={{ marginTop: -4 }}>W2–W7: {plannedDays} von 42 Tagen belegt{allPre.n > 0 ? ' · Vorproduktion ' + allPre.done + ' von ' + allPre.n + ' geschnitten' : ''}</div>
      <div className="row wrap" data-week-tabs>{PLAN_WEEKS.map((w, i) => <Tag key={i} on={wk === i} onClick={() => setUi({ planWeek: i })}>W{w.n}{today >= w.start && today <= w.end ? ' •' : ''}</Tag>)}</div>
      <div className="row wrap"><Tag on={view === 'wochen'} onClick={() => setUi({ planView: 'wochen' })}>Wochen</Tag><Tag on={view === 'kalender'} onClick={() => setUi({ planView: 'kalender' })}>Kalender</Tag></div>
      {view === 'wochen' && <>
        <div className="row between" data-week-head><h2 style={{ margin: 0 }}>W{W.n} · {fmtD(W.start)}–{fmtD(W.end)}</h2>{(wk >= 5 || weekPre.n > 0) && <span data-week-pre style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="meta">{weekPre.done}/{weekPre.n}</span><PreBadge s={weekPre.n > 0 && weekPre.done === weekPre.n ? 'VORPRODUZIERT' : 'VORPRODUZIEREN'} /></span>}</div>
        <div className="hint" style={{ marginTop: 2 }}>{WEEK_LABEL[wk]}{wk >= 5 ? ' · alle Pieces dieser Woche vorab drehen und schneiden. VORPRODUZIERT erst ab „Geschnitten“, keine spontane Aufnahme am Veröffentlichungstag' : ''}</div>
        {days(W).map(d => { const ps = piecesOn(d), reels = wk === 0 ? state.reels.filter(r => r.date === d) : []; return (
          <div key={d} data-day={d} className="sheet" style={{ padding: 10, marginBottom: 8, borderColor: d === today ? 'var(--accent)' : undefined }}>
            <div className="row between" style={{ margin: 0 }}><b>{wdName(d)} {fmtD(d)}</b>{d === today && <span className="meta" style={{ color: 'var(--accent)' }}>HEUTE</span>}</div>
            {ps.map(p => <Slot key={p.id} p={p} />)}
            {reels.map(r => <div key={r.id} data-reel className="meta" style={{ marginTop: 6, textTransform: 'none', letterSpacing: 0 }}>Reel (Board) · {r.type} · {r.hook}{r.views ? ' · ' + fmtN(r.views) + ' Views' : ''}</div>)}
            {ps.length === 0 && reels.length === 0 && <div className="meta" data-empty style={{ marginTop: 6 }}>{wk === 0 ? 'Keine hinterlegten Daten' : 'Kein Slot geplant'}</div>}
          </div>); })}
      </>}
      {view === 'kalender' && (
        <div data-calendar style={{ marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '30px repeat(7, 1fr)', gap: 4, marginBottom: 4 }}><span />{['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(x => <span key={x} className="meta" style={{ textAlign: 'center' }}>{x}</span>)}</div>
          {PLAN_WEEKS.map((w, i) => (
            <div key={i} data-cal-week={w.n} style={{ display: 'grid', gridTemplateColumns: '30px repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              <span className="meta" style={{ alignSelf: 'center', lineHeight: 1.1 }}>W{w.n}{(() => { const c = preCount(weekPieces(w)); return c.n ? <small data-cal-pre style={{ display: 'block', fontSize: 9 }}>{c.done}/{c.n}</small> : null; })()}</span>
              {days(w).map(d => { const ps = piecesOn(d), rl = i === 0 ? state.reels.filter(r => r.date === d).length : 0; return (
                <div key={d} data-cal-day={d} style={{ background: 'var(--panel)', border: '1px solid ' + (d === today ? 'var(--accent)' : 'var(--line)'), borderRadius: 6, minHeight: 46, padding: 3 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{d.slice(8)}</div>
                  {ps.map(p => <div key={p.id} data-cal-piece onClick={() => gotoContent(p.id)} style={{ fontSize: 10, fontWeight: 800, textAlign: 'center', borderRadius: 3, marginTop: 2, padding: '1px 0', cursor: 'pointer', background: p.world === 'OLI' ? 'var(--accent)' : 'var(--panel2)', color: p.world === 'OLI' ? 'var(--accent-ink)' : 'var(--text)', outline: isDone(p) ? '2px solid ' + AMPEL_COL.green : 'none' }}>{p.world === 'OLI' ? 'O' : 'J'}</div>)}
                  {rl > 0 && <div style={{ fontSize: 9, color: 'var(--muted)' }}>{rl} Reel</div>}
                </div>); })}
            </div>))}
          <div className="hint">J = JOGA · O = OLI · grüner Rahmen = geschnitten/gepostet · n/7 unter der Woche = bereits vorproduziert (mind. „Geschnitten“). Tippen öffnet das Piece.</div>
        </div>)}
    </section>
  );
}

/* ---- PRODUKTION: Übersicht (Liste | Board) · Ideen · Skripte · Drehen · Schneiden · Bereit ---- */
function applyPf(list, pf) {
  return list.filter(p => (pf.world === 'Alle' || p.world === pf.world) && (pf.fn === 'Alle' || p.fn === pf.fn) && (pf.prodType === 'Alle' || p.prodType === pf.prodType) && (pf.platform === 'Alle' || p.platforms.includes(pf.platform)) && (pf.format === 'Alle' || p.format === pf.format) && (pf.status === 'Alle' || p.status === pf.status));
}
function ProduktionView({ state, update, ui, setUi, gotoContent, gotoHooks }) {
  const fileRef = useRef();
  const pf = ui.pf, sec = ui.prodSec;
  const setPf = (patch) => setUi({ pf: { ...pf, ...patch } });
  const all = applyPf(state.content, pf);
  const countOf = (st) => all.filter(p => p.status === st).length;
  const formats = [...new Set(state.content.map(p => p.format).filter(Boolean))].sort();
  const create = () => { const n = newPiece({ world: pf.world === 'OLI' ? 'OLI' : 'JOGA' }); update(s => ({ ...s, content: [...s.content, n] })); gotoContent(n.id); };
  const exportJSON = () => { const a = document.createElement('a'); a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.content, null, 1)); a.download = 'joga-content.json'; a.click(); };
  const importJSON = (f) => {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const arr = JSON.parse(rd.result); if (!Array.isArray(arr)) throw 0;
        update(s => {
          const ids = new Set(s.content.map(c => c.id));
          const add = arr.filter(m => m && m.title).map(m => {
            const piece = !m.world ? migrateOliItem(m, uid()) : normPiece(m);
            if (piece.status === 'Drehbereit' && readinessMissing(piece).length) piece.status = 'Skript fertig'; // kein unvollständiges Piece auf Drehbereit
            return ids.has(piece.id) ? { ...piece, id: uid() } : piece;
          });
          return { ...s, content: [...s.content, ...add] };
        });
      } catch { alert('Datei ist kein JSON-Array mit Content-Pieces.'); }
    };
    rd.readAsText(f);
  };
  const sel = (label, val, key, opts) => <Field label={label}><select value={val} onChange={e => setPf({ [key]: e.target.value })}><option>Alle</option>{opts.map(o => <option key={o}>{o}</option>)}</select></Field>;
  const stageList = (st) => all.filter(p => p.status === st).sort(byDate);
  const setStatus = (id, st) => update(s => ({ ...s, content: s.content.map(c => c.id === id ? { ...c, status: st, updated: todayISO() } : c) }));
  const focus = ui.focusId ? state.content.find(c => c.id === ui.focusId) : null;
  const today = todayISO();
  return (
    <section>
      <header className="head"><h1>Produktion</h1><Btn kind="primary" onClick={create}>+ Piece</Btn></header>
      <div className="row wrap" data-prod-nav>
        <Tag on={sec === 'uebersicht'} onClick={() => setUi({ prodSec: 'uebersicht', focusId: null })}>ÜBERSICHT</Tag>
        {STAGES.map(([k, label, st]) => <Tag key={k} on={sec === k} onClick={() => setUi({ prodSec: k, focusId: null })}>{label} {countOf(st)}</Tag>)}
      </div>
      <div className="row wrap" data-world-filter>{['Alle', ...WORLDS].map(w => <Tag key={w} on={pf.world === w} onClick={() => setPf({ world: w })}>{w}</Tag>)}</div>
      <div className="row wrap">{['Alle', ...TYPES].map(t => <Tag key={t} on={pf.fn === t} onClick={() => setPf({ fn: t })}>{t}</Tag>)}</div>
      <div className="grid2">
        {sel('Produktionsart', pf.prodType, 'prodType', PROD_TYPES)}
        {sel('Plattform', pf.platform, 'platform', PLATFORMS)}
        {sel('Format', pf.format, 'format', formats)}
        {sec === 'uebersicht' && sel('Status', pf.status, 'status', C_STATUS)}
      </div>

      {sec === 'uebersicht' && <>
        <div className="row wrap"><Tag on={ui.prodView === 'liste'} onClick={() => setUi({ prodView: 'liste' })}>Liste</Tag><Tag on={ui.prodView === 'board'} onClick={() => setUi({ prodView: 'board' })}>Board</Tag></div>
        {ui.prodView === 'board' ? <Board state={state} update={update} /> : <>
          <div className="stats" data-stage-counts style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
            {STAGES.map(([k, label, st]) => <div key={k} onClick={() => setUi({ prodSec: k, focusId: null })} style={{ cursor: 'pointer' }}><b>{countOf(st)}</b><small>{label}</small></div>)}
            <div><b>{countOf('Gepostet')}</b><small>GEPOSTET</small></div>
          </div>
          <p className="hint" data-count>{all.length} von {state.content.length} Pieces</p>
          <ul className="list">{all.slice().sort(byDate).map(p => <PieceRow key={p.id} p={p} onOpen={gotoContent} today={today} />)}</ul>
          {all.length === 0 && <p className="empty">Keine Pieces mit diesen Filtern.</p>}
          <div className="row end">
            <Btn small onClick={() => fileRef.current.click()}>JSON importieren</Btn><Btn small onClick={exportJSON}>JSON exportieren</Btn>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={e => e.target.files[0] && importJSON(e.target.files[0])} />
          </div>
        </>}
      </>}

      {['ideen', 'skripte', 'schneiden', 'bereit'].includes(sec) && (() => { const st = STAGES.find(x => x[0] === sec)[2], L = stageList(st); return (
        <>
          <p className="hint" data-count>{L.length} Pieces im Status „{st}“{sec === 'bereit' ? '. Gepostete Pieces findest du unter ANALYSE.' : ''}</p>
          <ul className="list">{L.map(p => <PieceRow key={p.id} p={p} onOpen={gotoContent} today={today} />)}</ul>
          {L.length === 0 && <p className="empty">Nichts in dieser Phase.</p>}
        </>); })()}

      {sec === 'drehen' && focus && focus.status === 'Drehbereit' && (
        <>
          <div className="row"><Btn small onClick={() => setUi({ focusId: null })}>← Alle Dreh-Karten</Btn></div>
          <ProdCard p={focus} gotoContent={gotoContent} onStatus={setStatus} />
        </>
      )}
      {sec === 'drehen' && focus && focus.status !== 'Drehbereit' && (() => { const nx = STAGES.find(x => x[2] === focus.status); return (
        <div className="sheet" data-focus-done>
          <h2>{focus.title}</h2>
          <p>Status jetzt: <b>{focus.status}</b>.</p>
          <div className="row wrap">
            {nx && <Btn kind="primary" onClick={() => setUi({ prodSec: nx[0], focusId: null })}>Weiter zu {nx[1]}</Btn>}
            <Btn small onClick={() => gotoContent(focus.id)}>Piece öffnen</Btn>
            <Btn small onClick={() => setUi({ focusId: null })}>Alle Dreh-Karten</Btn>
          </div>
        </div>); })()}
      {sec === 'drehen' && !focus && (() => {
        const L = all.filter(p => p.status === 'Drehbereit').sort((a, b) => (a.prodType === 'Neudreh' ? 0 : 1) - (b.prodType === 'Neudreh' ? 0 : 1) || byDate(a, b));
        const neu = L.filter(p => p.prodType === 'Neudreh').length;
        return (
          <>
            <p className="hint" data-count>{neu} Neudrehs · {L.length - neu} Recut/Bestand. „Drehbereit“ ist die Qualitätsfreigabe: Nur vollständige Pieces landen hier.</p>
            {L.length === 0 && <div className="sheet" data-empty>Keine drehbereiten Pieces. Ein Piece wird im Editor auf „Drehbereit“ gesetzt, sobald Hook, Shotlist und Sprechtext vollständig sind.</div>}
            <details className="sheet" data-rules><summary>Produktionsregeln für alle neuen Pieces</summary>
              <ol style={{ margin: '8px 0 0', paddingLeft: 20, lineHeight: 1.5 }}>
                <li>Kein gesprochenes „Heute zeige ich …“.</li>
                <li>Starker Bewegungscontent startet mit Bewegung in Frame 1.</li>
                <li>Humor braucht keine unkontrollierbaren Personen, Tiere oder Ereignisse.</li>
                <li>Kein künstliches Scheitern und kein künstliches „alt spielen“.</li>
                <li>OLI-Haltung kurz, konkret, trocken. Kein Motivationscoach-Ton.</li>
                <li>On-Screen-Hooks ab Frame 1, wenn sie die Idee tragen.</li>
                <li>Jeder Neudreh erhält 3–5 Sekunden sauberen Start und Ende ohne gesprochenen Text als Rohmaterial für spätere Recuts.</li>
                <li>Maximal 5 Hashtags in Captions; den Hook nicht einfach in der Caption wiederholen.</li>
                <li>Für W6/W7 alle Dateien vorab fertig exportieren und im Piece auf mindestens „Geschnitten“ setzen.</li>
              </ol>
            </details>
            {L.map((p, i) => <ProdCard key={p.id} p={p} idx={i} gotoContent={gotoContent} onStatus={setStatus} />)}
            <details className="sheet" data-drehplan open={!!ui.dpOpen} onToggle={e => { if (e.target.open !== !!ui.dpOpen) setUi({ dpOpen: e.target.open }); }}><summary>Master-Drehs (Drehplan) und Cuts</summary>
              {ui.dpOpen && <div style={{ overflowX: 'auto' }}><ShootPlanner state={state} update={update} gotoContent={gotoContent} gotoHooks={gotoHooks} /></div>}
            </details>
          </>);
      })()}
    </section>
  );
}

/* ---- ANALYSE: Übersicht · Posts · Muster (nur real eingetragene Daten, rein deskriptiv) ---- */
function perfRows(state, from, to) {
  const rows = []; let undated = 0;
  state.content.forEach(p => p.perf.forEach(e => {
    if (!(Number(e.views) > 0)) return;
    const d = e.date || p.publishDate || '';
    if (!d) { undated++; return; }
    if (d < from || d > to) return;
    rows.push({ p, e, d, world: p.world, fn: p.fn, entry: p.entry, audio: p.audio, prodType: p.prodType, format: p.format || '(ohne Format)', platform: e.platform, combo: [p.world, p.fn, p.entry, p.audio].join(' · ') });
  }));
  return { rows, undated };
}
// Gewichtete Quote: Σ Zähler / Σ Views, nur über Einträge mit erfasstem Zähler.
const ratioOf = (rows, key) => { const rs = rows.filter(r => r.e[key] !== '' && r.e[key] != null); const v = rs.reduce((a, r) => a + Number(r.e.views), 0); return v > 0 ? rs.reduce((a, r) => a + Number(r.e[key]), 0) / v : null; };
const avgOf = (rows, key) => { const vs = rows.map(r => r.e[key]).filter(x => x !== '' && x != null).map(Number); return vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : null; };
const medianOf = (rows, key) => { const vs = rows.map(r => Number(r.e[key])).filter(x => !isNaN(x)).sort((a, b) => a - b); if (!vs.length) return null; const m = Math.floor(vs.length / 2); return vs.length % 2 ? vs[m] : (vs[m - 1] + vs[m]) / 2; };
const fmtF = (x, d = 0) => x == null ? '–' : x.toFixed(d).replace('.', ',');
const COLS = [
  ['n', 'Posts', r => r.length],
  ['avgv', 'Ø Views', r => avgOf(r, 'views')],
  ['medv', 'Median Views', r => medianOf(r, 'views')],
  ['fol', 'Follower', r => ratioOf(r, 'newFollowers')],
  ['sav', 'Saves', r => ratioOf(r, 'saves')],
  ['sha', 'Shares', r => ratioOf(r, 'shares')],
  ['com', 'Komm.', r => ratioOf(r, 'comments')],
  ['watch', 'Ø Sek.', r => avgOf(r, 'avgWatch')],
  ['comp', 'Compl. %', r => avgOf(r, 'completion')],
];
const showCol = (k, v) => v == null ? '–' : k === 'n' ? fmtN(v) : (k === 'avgv' || k === 'medv') ? fmtN(Math.round(v)) : k === 'watch' ? fmtF(v, 1) : k === 'comp' ? fmtF(v, 0) : fmtP(v);
const DIMS = [['JOGA vs. OLI', 'world'], ['Funktion (REACH / DO / ME / US)', 'fn'], ['Einstieg', 'entry'], ['Audio', 'audio'], ['Produktionsart', 'prodType'], ['Format', 'format'], ['Plattform', 'platform'], ['Kombination (Welt · Funktion · Einstieg · Audio)', 'combo']];
function GroupTable({ title, rows, dim }) {
  const [sortKey, setSortKey] = useState('n');
  const groups = {};
  rows.forEach(r => { (groups[r[dim]] = groups[r[dim]] || []).push(r); });
  const data = Object.keys(groups).map(g => ({ g, vals: Object.fromEntries(COLS.map(([k, , f]) => [k, f(groups[g])])) }));
  data.sort((a, b) => (b.vals[sortKey] ?? -1) - (a.vals[sortKey] ?? -1));
  return (
    <div className="sheet" data-dim={dim}>
      <h2>{title}</h2>
      <div style={{ overflowX: 'auto' }}><table className="tbl">
        <thead><tr><th>Gruppe</th>{COLS.map(([k, l]) => <th key={k} onClick={() => setSortKey(k)} style={{ cursor: 'pointer', color: sortKey === k ? 'var(--accent)' : undefined }}>{l}</th>)}</tr></thead>
        <tbody>{data.map(d => <tr key={d.g}><td>{d.g}{d.vals.n < 3 && <small> *</small>}</td>{COLS.map(([k]) => <td key={k}>{showCol(k, d.vals[k])}</td>)}</tr>)}</tbody>
      </table></div>
    </div>
  );
}
function AnalyseView({ state, update, ui, setUi, gotoContent }) {
  const ar = ui.ar, tab = ui.ana;
  const presets = [{ key: 'plan', label: '7-Wochen-Test', from: PLAN_START, to: PLAN_END }];
  const setRange = (patch) => setUi({ ar: { ...ar, ...patch } });
  const { rows, undated } = perfRows(state, ar.from, ar.to);
  const inRange = state.content.filter(p => p.publishDate >= ar.from && p.publishDate <= ar.to);
  const posted = inRange.filter(p => p.status === 'Gepostet').length;
  const views = rows.reduce((a, r) => a + Number(r.e.views), 0);
  const weekRows = PLAN_WEEKS.map(w => ({ w, rs: rows.filter(r => r.d >= w.start && r.d <= w.end), planned: state.content.filter(p => p.publishDate >= w.start && p.publishDate <= w.end).length })).filter(x => x.w.end >= ar.from && x.w.start <= ar.to);
  return (
    <section>
      <header className="head"><h1>Analyse</h1><span className="meta" data-window>{fmtD(ar.from)}–{fmtD(ar.to)}</span></header>
      <div className="row wrap" data-ana-nav>{[['uebersicht', 'ÜBERSICHT'], ['posts', 'POSTS'], ['muster', 'MUSTER']].map(([k, l]) => <Tag key={k} on={tab === k} onClick={() => setUi({ ana: k })}>{l}</Tag>)}</div>
      <div className="sheet">
        <div className="row wrap" data-presets>{presets.map(pr => <Tag key={pr.key} on={ar.key === pr.key} onClick={() => setRange({ key: pr.key, from: pr.from, to: pr.to })}>{pr.label}</Tag>)}<Tag on={ar.key === 'custom'} onClick={() => setRange({ key: 'custom' })}>Eigener Zeitraum</Tag></div>
        <div className="grid2" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}><Field label="Von"><input style={{ minWidth: 0 }} type="date" value={ar.from} onChange={e => setRange({ key: 'custom', from: e.target.value })} /></Field><Field label="Bis"><input style={{ minWidth: 0 }} type="date" value={ar.to} onChange={e => setRange({ key: 'custom', to: e.target.value })} /></Field></div>
      </div>
      <p className="hint" data-summary>{new Set(rows.map(r => r.p.id)).size} Pieces mit Daten · {rows.length} Messwerte · Σ {fmtN(views)} Views{undated ? ' · ' + undated + ' Messwert(e) ohne Datum nicht eingerechnet' : ''}</p>

      {tab === 'uebersicht' && <>
        <div className="stats" data-kpis style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <div><b>{posted}/{inRange.length}</b><small>gepostet / geplant</small></div>
          <div><b>{fmtP(ratioOf(rows, 'newFollowers'))}</b><small>Follower / Views</small></div>
          <div><b>{fmtP(ratioOf(rows, 'saves'))}</b><small>Saves / Views</small></div>
          <div><b>{fmtP(ratioOf(rows, 'shares'))}</b><small>Shares / Views</small></div>
        </div>
        <div className="sheet" data-weeks><h2>Wochen</h2>
          <div style={{ overflowX: 'auto' }}><table className="tbl">
            <thead><tr><th>Woche</th><th>Geplant</th><th>Messwerte</th><th>Σ Views</th><th>Follower</th><th>Saves</th><th>Shares</th><th>Komm.</th></tr></thead>
            <tbody>{weekRows.map(({ w, rs, planned }) => <tr key={w.n} data-week={w.n}><td>W{w.n}</td><td>{planned}</td><td>{rs.length}</td><td>{rs.length ? fmtN(rs.reduce((a, r) => a + Number(r.e.views), 0)) : '–'}</td><td>{fmtP(ratioOf(rs, 'newFollowers'))}</td><td>{fmtP(ratioOf(rs, 'saves'))}</td><td>{fmtP(ratioOf(rs, 'shares'))}</td><td>{fmtP(ratioOf(rs, 'comments'))}</td></tr>)}</tbody>
          </table></div>
        </div>
        <details className="sheet" data-review><summary>Wochenreview (bisheriges Review, alle Daten erhalten)</summary><div style={{ overflowX: 'auto' }}><Review state={state} update={update} /></div></details>
      </>}

      {tab === 'posts' && (() => {
        // Gepostet, aber noch ohne Messwerte: hier beginnt die Kette Veröffentlichung → Analyse (sonst gäbe es keinen Weg zu den ersten Daten).
        const missing = state.content.filter(p => p.status === 'Gepostet' && !p.perf.some(e => Number(e.views) > 0) && (!p.publishDate || (p.publishDate >= ar.from && p.publishDate <= ar.to))).sort(byDate);
        return missing.length ? (
          <div className="sheet" data-missing-data><h2>Gepostet, noch ohne Daten ({missing.length})</h2>
            {missing.map(p => <div key={p.id} data-missing-row className="row between" onClick={() => gotoContent(p.id)} style={{ cursor: 'pointer', margin: '8px 0', ...WRAP }}>
              <span style={{ minWidth: 0 }}><WorldBadge w={p.world} /> {p.title}</span><span className="meta" style={{ flex: 'none' }}>{p.publishDate ? wdName(p.publishDate) + ' ' + fmtD(p.publishDate) : ''} · Daten eintragen ›</span>
            </div>)}
          </div>) : null;
      })()}
      {tab === 'posts' && (rows.length === 0 ? <p className="empty" data-empty>Noch keine Messwerte im Zeitraum. Trag Performance im Content-Piece ein (Schritt 6 · Ergebnis).</p>
        : <div className="sheet" data-posts><h2>Einzelperformance</h2><div style={{ overflowX: 'auto' }}><table className="tbl">
          <thead><tr><th>Datum</th><th>Piece</th><th>Plattform</th><th>Views</th><th>Follower</th><th>Saves</th><th>Shares</th><th>Komm.</th></tr></thead>
          <tbody>{rows.slice().sort((a, b) => a.d.localeCompare(b.d)).map(r => <tr key={r.e.id} data-post onClick={() => gotoContent(r.p.id)} style={{ cursor: 'pointer' }}><td>{fmtD(r.d)}</td><td>{r.p.title || '(ohne Titel)'}</td><td>{r.e.platform}</td><td>{fmtN(r.e.views)}</td><td>{fmtP(pct(r.e.newFollowers, r.e.views))}</td><td>{fmtP(pct(r.e.saves, r.e.views))}</td><td>{fmtP(pct(r.e.shares, r.e.views))}</td><td>{fmtP(pct(r.e.comments, r.e.views))}</td></tr>)}</tbody>
        </table></div></div>)}

      {tab === 'muster' && <>
        <p className="hint">Quoten = Σ Zähler / Σ Views, nur über Einträge mit erfasstem Zähler. * = weniger als 3 Posts: Unterschiede können Zufall sein. Die App benennt bewusst keinen Gewinner.</p>
        {rows.length === 0 ? <p className="empty" data-empty>Noch keine Messwerte im Zeitraum.</p> : DIMS.map(([t, d]) => <GroupTable key={d} title={t} rows={rows} dim={d} />)}
      </>}
    </section>
  );
}

/* ---- Bibliothek (Utility, kein Haupttab): Hooks und Moves ---- */
function BibliothekView({ state, update, sub, setSub, hookCtx, setHookCtx, onClose }) {
  return (
    <section>
      <header className="head"><h1>Bibliothek</h1><Btn small onClick={onClose}>Schließen</Btn></header>
      <div className="row wrap" data-lib-nav><Tag on={sub === 'hooks'} onClick={() => setSub('hooks')}>Hooks</Tag><Tag on={sub === 'moves'} onClick={() => setSub('moves')}>Moves</Tag></div>
      {sub === 'hooks' ? <Hooks state={state} update={update} ctx={hookCtx} setCtx={setHookCtx} /> : <Library state={state} update={update} />}
    </section>
  );
}

/* ---------- Drehplan ---------- */
const CUT_STATUS = ['geplant', 'gedreht', 'gepostet'];
// Vorschläge für Schnitte. Vorausgewählt: 1 Routine, 1 JOGA-Minute, 1 REACH-Version. Der Rest ist Angebot.
function proposeCuts(shoot, date) {
  const ms = shoot.moves, T = shoot.theme;
  const cuts = [
    { id: uid(), kind: 'Routine', type: 'DO', title: `Routine – ${T}`, moves: ms, date, on: true, why: 'Das Format mit der höchsten Save-Rate.' },
    { id: uid(), kind: 'REACH-Version', type: 'REACH', title: `${ms.length} Moves, damit du mit 70 noch ${SKILLS.includes(T) ? T : '…'}`, moves: ms, date: addDays(date, 1), on: true, why: 'Gleicher Dreh, Versprechens-Hook. Holt neue Leute.' },
  ];
  const pairs = []; for (let i = 0; i < ms.length; i += 2) pairs.push(ms.slice(i, i + 2));
  pairs.slice(0, 3).forEach((p, i) => cuts.push({ id: uid(), kind: '1 Minute JOGA', type: 'DO', title: `1 MINUTE JOGA – ${T.toUpperCase()}`, moves: p, date: addDays(date, i + 2), on: i === 0, why: i === 0 ? 'Die stärksten 1–2 Moves. Nur wenn sie allein tragen.' : 'Nur, wenn diese Moves eine eigene Minute wert sind.' }));
  if (shoot.goal === 'US') cuts.push({ id: uid(), kind: 'US-Frage', type: 'US', title: shoot.usQ || US_QUESTIONS[0], moves: ms.slice(0, 2), date: addDays(date, 3), on: true, why: 'Bewegung im Hintergrund, Frage im Vordergrund.' });
  cuts.push({ id: uid(), kind: 'Recut', type: 'REACH', title: 'Recut – andere Hook', moves: ms, date: addDays(date, 7), on: false, why: 'Eine Woche später, neue Hook, gleicher Schnitt. Reposts haben bei dir funktioniert.' });
  return cuts;
}

function ShootPlanner({ state, update, gotoHooks, gotoContent }) {
  const [draft, setDraft] = useState(null);
  const startDraft = () => setDraft({ id: uid(), theme: SKILLS[0], goal: 'DO', usQ: US_QUESTIONS[0], date: addDays(todayISO(), 1), moves: [], cuts: null });
  const fits = (m, theme) => m.skill === theme || m.area === theme || (m.benefit || '').toLowerCase().includes(theme.toLowerCase());
  const suggest = (theme, n = 5) => {
    const pool = state.moves.filter(m => m.src !== '22 Flows');
    const prim = pool.filter(m => fits(m, theme));
    const rest = pool.filter(m => !prim.includes(m));
    const pick = (arr, k) => arr.slice().sort(() => Math.random() - 0.5).slice(0, k);
    return [...pick(prim, Math.min(n, prim.length)), ...pick(rest, n - Math.min(n, prim.length))].map(m => m.id);
  };
  const toggle = (id) => setDraft(d => ({ ...d, moves: d.moves.includes(id) ? d.moves.filter(x => x !== id) : d.moves.length < 5 ? [...d.moves, id] : d.moves }));
  const propose = () => setDraft(d => ({ ...d, cuts: proposeCuts(d, d.date) }));
  const commit = () => { const cuts = draft.cuts.filter(c => c.on).map(({ on, why, ...c }) => ({ ...c, status: 'geplant', reelId: '' })); const { cuts: _c, ...rest } = draft; update(s => ({ ...s, shoots: [...s.shoots, { ...rest, cuts, created: todayISO() }] })); setDraft(null); };
  const setCut = (sid, cid, patch) => update(s => ({ ...s, shoots: s.shoots.map(sh => sh.id !== sid ? sh : { ...sh, cuts: sh.cuts.map(c => c.id === cid ? { ...c, ...patch } : c) }) }));
  const delShoot = (sid) => { if (confirm('Dreh und alle Schnitte löschen?')) update(s => ({ ...s, shoots: s.shoots.filter(x => x.id !== sid), content: s.content.map(p => p.shootId === sid ? { ...p, shootId: '', cutId: '' } : p) })); };
  const contentOf = (id) => id ? state.content.find(p => p.id === id) : null;
  const effStatus = (c) => { const p = contentOf(c.contentId); if (!p) return c.status; return p.status === 'Gepostet' ? 'gepostet' : (p.status === 'Gedreht' || p.status === 'Geschnitten') ? 'gedreht' : 'geplant'; };
  const CUT_FORMAT = { 'Routine': 'Routine / 1 Minute JOGA', '1 Minute JOGA': 'Routine / 1 Minute JOGA' };
  const toContent = (sh, c) => {
    const fmt = CUT_FORMAT[c.kind] || c.kind, r = ruleFor(fmt);
    const piece = newPiece({ world: 'JOGA', fn: c.type, format: fmt, title: c.title, hook: c.hook || c.title, status: c.status === 'gepostet' ? 'Gepostet' : c.status === 'gedreht' ? 'Gedreht' : 'Idee', prodType: c.kind === 'Recut' ? 'Recut' : 'Neudreh', entry: r ? r.entry : (c.kind === 'US-Frage' ? 'Text first' : 'Move first'), audio: r ? r.audio : 'Silent/Musik', moveIds: c.moves, shootId: sh.id, cutId: c.id, publishDate: c.date });
    update(s => ({ ...s, content: [...s.content, piece], shoots: s.shoots.map(x => x.id !== sh.id ? x : { ...x, cuts: x.cuts.map(k => k.id === c.id ? { ...k, contentId: piece.id } : k) }) }));
  };
  const newFromShoot = (sh) => { const piece = newPiece({ world: 'JOGA', fn: sh.goal || 'DO', shootId: sh.id, moveIds: sh.moves, prodType: 'Bestand', status: 'Idee', publishDate: '' }); update(s => ({ ...s, content: [...s.content, piece] })); gotoContent(piece.id); };
  const toBoard = (sh, c) => { const rid = uid(); const orig = c.kind === 'Recut' ? (sh.cuts.find(x => x.kind === 'Routine')?.reelId || '') : ''; update(s => ({ ...s, reels: [...s.reels, { id: rid, date: c.date, type: c.type, hook: c.hook || c.title, len: '', recutOf: orig, views: '', v3: '', saves: '', reacts: '', shares: '', comments: '', followers: '', notes: '' }], shoots: s.shoots.map(x => x.id !== sh.id ? x : { ...x, cuts: x.cuts.map(y => y.id === c.id ? { ...y, status: 'gepostet', reelId: rid } : y) }) })); };
  const mv = (id) => state.moves.find(m => m.id === id);
  const shoots = state.shoots.slice().sort((a, b) => b.date.localeCompare(a.date));
  const week = useMemo(() => { const days = Array.from({ length: 7 }, (_, i) => addDays(todayISO(), i)); return days.map(d => ({ d, cuts: state.shoots.flatMap(sh => sh.cuts.filter(c => c.date === d).map(c => ({ ...c, status: effStatus(c), sh }))) })); }, [state.shoots, state.content]);
  return (
    <section>
      <header className="head"><h1>Drehplan</h1><Btn kind="primary" onClick={startDraft}>+ Dreh</Btn></header>
      <p className="hint">Ein Dreh = Thema + Hauptziel + bis zu 5 Moves. Die App schlägt Schnitte vor, du wählst aus. Richtwert: 1 Routine, 1 JOGA-Minute, 1 REACH-Version.</p>
      {draft && (
        <div className="sheet">
          <div className="grid2">
            <Field label="Thema (Fähigkeit zuerst)"><select value={draft.theme} onChange={e => setDraft(d => ({ ...d, theme: e.target.value, moves: [], cuts: null }))}>
              <optgroup label="Fähigkeit / Alltagsziel">{SKILLS.map(a => <option key={a}>{a}</option>)}</optgroup>
              <optgroup label="Situation">{SITUATIONS.map(a => <option key={a}>{a}</option>)}</optgroup>
              <optgroup label="Körperbereich">{AREAS.map(a => <option key={a}>{a}</option>)}</optgroup>
            </select></Field>
            <Field label="Hauptziel des Drehs"><select value={draft.goal} onChange={e => setDraft(d => ({ ...d, goal: e.target.value, cuts: null }))}>{TYPES.map(t => <option key={t} value={t}>{t} – {TYPE_INFO[t]}</option>)}</select></Field>
          </div>
          <Field label="Erstes Reel am"><input type="date" value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value, cuts: null }))} /></Field>
          {draft.goal === 'US' && <Field label="US-Frage"><select value={draft.usQ} onChange={e => setDraft(d => ({ ...d, usQ: e.target.value, cuts: null }))}>{US_QUESTIONS.map(q => <option key={q}>{q}</option>)}</select></Field>}
          <div className="row"><Btn small onClick={() => setDraft(d => ({ ...d, moves: suggest(d.theme) }))}>5 Moves vorschlagen</Btn><span className="meta">{draft.moves.length}/5 gewählt</span></div>
          <ul className="picklist">
            {[...draft.moves.map(mv).filter(Boolean), ...state.moves.filter(m => m.src !== '22 Flows' && !draft.moves.includes(m.id) && fits(m, draft.theme)), ...state.moves.filter(m => m.src !== '22 Flows' && !draft.moves.includes(m.id) && !fits(m, draft.theme))].map(m => (
              <li key={m.id} className={draft.moves.includes(m.id) ? 'on' : ''} onClick={() => toggle(m.id)}>
                <span className="order">{draft.moves.includes(m.id) ? draft.moves.indexOf(m.id) + 1 : ''}</span>
                <span>{m.title}<small> {m.area}{m.len ? ' · ' + m.len : ''}</small></span>
              </li>
            ))}
          </ul>
          {draft.cuts && (
            <div className="proposals">
              <p className="hint">Vorschläge. Du entscheidest, was stark genug ist – lieber drei gute als fünf.</p>
              {draft.cuts.map(c => (
                <label key={c.id} className={`proposal ${c.on ? 'on' : ''}`}>
                  <input type="checkbox" checked={c.on} onChange={() => setDraft(d => ({ ...d, cuts: d.cuts.map(x => x.id === c.id ? { ...x, on: !x.on } : x) }))} />
                  <div><div><span className={`type type-${c.type}`}>{c.type}</span> <b>{c.kind}</b> <span className="meta">{fmtD(c.date)}</span></div>
                    <div className="meta">{c.moves.map(mv).filter(Boolean).map(m => m.title).join(' + ')}</div>
                    <div className="why">{c.why}</div></div>
                </label>
              ))}
            </div>
          )}
          <div className="row end">
            <Btn onClick={() => setDraft(null)}>Abbrechen</Btn>
            {!draft.cuts ? <Btn kind="primary" disabled={draft.moves.length < 2} onClick={propose}>Schnitte vorschlagen</Btn>
              : <Btn kind="primary" disabled={!draft.cuts.some(c => c.on)} onClick={commit}>{draft.cuts.filter(c => c.on).length} Schnitte anlegen</Btn>}
          </div>
        </div>
      )}
      <div className="week">
        {week.map(({ d, cuts }) => (
          <div key={d} className={`day ${cuts.length ? '' : 'free'}`}>
            <div className="dlabel">{['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][new Date(d + 'T00:00:00').getDay()]} {fmtD(d)}</div>
            {cuts.length ? cuts.map(c => <div key={c.id} className={`chip ${c.status}`}>{c.kind}</div>) : <div className="chip none">frei</div>}
          </div>
        ))}
      </div>
      {shoots.length === 0 && !draft && <p className="empty">Noch kein Dreh geplant. Leg den ersten an – Test 1 startet am {fmtD(state.goals.start)}.</p>}
      {shoots.map(sh => (
        <div key={sh.id} className="sheet">
          <div className="row between"><h2>{sh.theme} <small>ab {fmtD(sh.date)}{sh.goal ? ' · Ziel ' + sh.goal : ''}</small></h2><Btn small onClick={() => delShoot(sh.id)}>Löschen</Btn></div>
          <div className="meta">Moves: {sh.moves.map(mv).filter(Boolean).map(m => m.title).join(' · ')}</div>
          <ul className="cuts">
            {sh.cuts.map(c => (
              <li key={c.id} className={c.status}>
                <div className="row between">
                  <div><span className={`type type-${c.type}`}>{c.type}</span> <b>{c.kind}</b> <span className="meta">{fmtD(c.date)}</span></div>
                  {contentOf(c.contentId) ? <span className="meta" data-linked>Content: {contentOf(c.contentId).status}</span>
                    : <select value={c.status} onChange={e => setCut(sh.id, c.id, { status: e.target.value })}>{CUT_STATUS.map(s => <option key={s}>{s}</option>)}</select>}
                </div>
                <div className="meta">{c.moves.map(mv).filter(Boolean).map(m => m.title).join(' + ')}</div>
                <input value={c.hook || ''} placeholder={c.title} onChange={e => setCut(sh.id, c.id, { hook: e.target.value })} />
                <div className="row end">
                  <Btn small onClick={() => gotoHooks({ typ: c.type, thema: sh.theme, moves: c.moves.map(mv).filter(Boolean).map(m => m.title).join(', '), cutRef: { sid: sh.id, cid: c.id } })}>Hook-Impulse</Btn>
                  {contentOf(c.contentId) ? <Btn small onClick={() => gotoContent(c.contentId)}>Content öffnen</Btn> : <Btn small onClick={() => toContent(sh, c)}>→ Content</Btn>}
                  {c.reelId ? <span className="meta">im Board</span> : <Btn small kind="primary" onClick={() => toBoard(sh, c)}>Ins Board</Btn>}
                </div>
              </li>
            ))}
          </ul>
          {(() => { const extra = state.content.filter(p => p.shootId === sh.id && !sh.cuts.some(c => c.contentId === p.id)); return (
            <div data-master-pieces>
              {extra.length > 0 && <div className="meta" style={{ marginTop: 8 }}>Weitere Pieces aus diesem Master</div>}
              {extra.map(p => <div key={p.id} className="row between"><span><WorldBadge w={p.world} /> <b>{p.title || '(ohne Titel)'}</b> <span className="meta">{p.format || p.fn} · {p.status}</span></span><Btn small onClick={() => gotoContent(p.id)}>Öffnen</Btn></div>)}
              <div className="row"><Btn small onClick={() => newFromShoot(sh)}>+ Piece aus diesem Dreh</Btn></div>
            </div>); })()}
        </div>
      ))}
    </section>
  );
}

/* ---------- Hooks ---------- */
function Hooks({ state, update, ctx, setCtx }) {
  const [typ, setTyp] = useState(ctx?.typ || 'DO');
  const [thema, setThema] = useState(ctx?.thema || AREAS[0]);
  const [moves, setMoves] = useState(ctx?.moves || '');
  const [notiz, setNotiz] = useState('');
  const [roll, setRoll] = useState(0);
  const [ki, setKi] = useState({ lines: [], loading: false, err: '' });
  useEffect(() => { if (ctx) { setTyp(ctx.typ); setThema(ctx.thema); setMoves(ctx.moves || ''); } }, [ctx]);
  const pats = PATTERNS[typ];
  const pat = pats[roll % pats.length];
  const ask = async (type) => { setKi({ lines: [], loading: true, err: '' }); try { const lines = await api.ki(type, { typ, thema, moves, notiz }); setKi({ lines, loading: false, err: '' }); } catch (e) { setKi({ lines: [], loading: false, err: e.message }); } };
  const keep = (line) => update(s => ({ ...s, hookNotes: [{ id: uid(), line, typ, thema, date: todayISO() }, ...s.hookNotes].slice(0, 200) }));
  const useForCut = (line) => { if (!ctx?.cutRef) return; update(s => ({ ...s, shoots: s.shoots.map(sh => sh.id !== ctx.cutRef.sid ? sh : { ...sh, cuts: sh.cuts.map(c => c.id === ctx.cutRef.cid ? { ...c, hook: line } : c) }) })); setCtx(null); };
  return (
    <section>
      <header className="head"><h1>Hooks</h1><span className="meta">Rohmaterial. Die Zeile schreibst du.</span></header>
      <div className="row wrap">{TYPES.map(t => <Tag key={t} on={typ === t} onClick={() => { setTyp(t); setRoll(0); }}>{t}</Tag>)}</div>
      <p className="hint">{TYPE_INFO[typ]}. Gemessen an: {TYPE_METRIC[typ] === 'saves' ? 'Saves' : TYPE_METRIC[typ] === 'followers' ? 'Follower' : 'Kommentare'}.</p>
      <div className="grid2">
        <Field label="Thema"><select value={thema} onChange={e => setThema(e.target.value)}>{[...SKILLS, ...SITUATIONS, ...AREAS].map(a => <option key={a}>{a}</option>)}</select></Field>
        <Field label="Moves im Video"><input value={moves} onChange={e => setMoves(e.target.value)} placeholder="optional" /></Field>
      </div>
      <div className="pattern">
        <div className="meta">Muster {roll % pats.length + 1}/{pats.length} · {pat.name}</div>
        <div className="form">{pat.form}</div>
        <div className="ex">Belegt: {pat.ex}</div>
        <div className="row"><Btn small onClick={() => setRoll(r => r + 1)}>Nächstes Muster</Btn><Btn small onClick={() => keep(pat.form.replace('[NUTZEN]', thema.toUpperCase()).replace('[SITUATION]', thema.toUpperCase()))}>Als Notiz merken</Btn></div>
      </div>
      <Field label="Notiz für die KI (optional)"><input value={notiz} onChange={e => setNotiz(e.target.value)} placeholder="z. B. heute steif, Wohnzimmer, Regen" /></Field>
      <div className="row">
        <Btn kind="primary" onClick={() => ask('hookImpuls')} disabled={ki.loading}>{ki.loading ? 'Denkt …' : 'KI-Impulse'}</Btn>
        {typ === 'DO' && <Btn onClick={() => ask('minuteTitel')} disabled={ki.loading}>Minuten-Titel</Btn>}
      </div>
      {ki.err && <div className="warn">{ki.err}</div>}
      {ki.lines.length > 0 && (
        <ul className="impulses">{ki.lines.map((l, i) => (
          <li key={i}><span>{l}</span><div className="row">{ctx?.cutRef && <Btn small kind="primary" onClick={() => useForCut(l)}>Für Schnitt</Btn>}<Btn small onClick={() => keep(l)}>Merken</Btn></div></li>
        ))}</ul>
      )}
      {state.hookNotes.length > 0 && (
        <details className="sheet" open><summary>Gemerkt ({state.hookNotes.length})</summary>
          <ul className="notes-list">{state.hookNotes.map(n => (
            <li key={n.id}><span className={`type type-${n.typ}`}>{n.typ}</span> {n.line} <small>{n.thema}</small><button className="x" onClick={() => update(s => ({ ...s, hookNotes: s.hookNotes.filter(x => x.id !== n.id) }))}>×</button></li>
          ))}</ul>
        </details>
      )}
    </section>
  );
}

/* ---------- App ---------- */
function PinGate({ onDone }) {
  const [pin, setPin] = useState('');
  return (
    <div className="gate">
      <div className="logo">JOGA</div>
      <p>Content-Board. PIN eingeben.</p>
      <input type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && onDone(pin)} autoFocus />
      <Btn kind="primary" onClick={() => onDone(pin)}>Öffnen</Btn>
    </div>
  );
}

function App() {
  const [tab, setTabRaw] = useState('heute');
  const [openContent, setOpenContent] = useState(null);
  const [lib, setLib] = useState(null); // null | 'hooks' | 'moves'
  const [ui, setUiRaw] = useState(() => ({
    planWeek: weekIdxOf(todayISO()), planView: 'wochen',
    prodSec: 'uebersicht', prodView: 'liste', pf: { world: 'Alle', fn: 'Alle', prodType: 'Alle', platform: 'Alle', format: 'Alle', status: 'Alle' },
    ana: 'uebersicht', ar: { key: 'plan', from: PLAN_START, to: PLAN_END },
  }));
  const setUi = (patch) => setUiRaw(u => ({ ...u, ...patch }));
  const setTab = (t) => { setOpenContent(null); setLib(null); setTabRaw(t); window.scrollTo(0, 0); };
  const gotoContent = (id) => { setLib(null); setOpenContent(id); window.scrollTo(0, 0); };
  // Direkt ins Drehbriefing (PRODUKTION → DREHEN, genau diese Karte)
  const gotoBriefing = (id) => { setLib(null); setOpenContent(null); setTabRaw('produktion'); setUiRaw(u => ({ ...u, prodSec: 'drehen', focusId: id })); window.scrollTo(0, 0); };
  const [state, setState] = useState(null);
  const [sync, setSync] = useState('lädt');
  const [needPin, setNeedPin] = useState(false);
  const [hookCtx, setHookCtx] = useState(null);
  const dirty = useRef(false);
  const timer = useRef(null);

  const load = async () => {
    setSync('lädt');
    try { const remote = await api.load(); setState(migrateState(remote && remote.reels ? { ...emptyState(), ...remote } : emptyState())); setSync('gespeichert'); setNeedPin(false); }
    catch (e) { if (e.message === 'PIN') { setNeedPin(true); setSync('PIN'); } else { const local = localStorage.getItem('joga_state'); setState(migrateState(local ? { ...emptyState(), ...JSON.parse(local) } : emptyState())); setSync('offline'); } }
  };
  useEffect(() => { load(); }, []);

  const update = (fn) => setState(s => { const n = typeof fn === 'function' ? fn(s) : fn; dirty.current = true; localStorage.setItem('joga_state', JSON.stringify(n)); return n; });
  useEffect(() => {
    if (!state || !dirty.current) return;
    setSync('ungespeichert');
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => { try { await api.save(state); dirty.current = false; setSync('gespeichert'); } catch (e) { setSync(e.message === 'PIN' ? 'PIN' : 'offline'); } }, 1200);
  }, [state]);

  if (needPin) return <PinGate onDone={(p) => { localStorage.setItem(PIN_KEY, p); load(); }} />;
  if (!state) return <div className="gate"><div className="logo">JOGA</div><p>{sync}</p></div>;

  // Vier Hauptpunkte. Board, Review, Drehplan, Hooks, Moves und Oli sind eingeordnet, nicht gelöscht.
  const tabs = [['heute', 'HEUTE'], ['plan', '7-WOCHEN-PLAN'], ['produktion', 'PRODUKTION'], ['analyse', 'ANALYSE']];
  const detailOpen = openContent && state.content.some(c => c.id === openContent);
  return (
    <div className="app">
      <div className="topbar">
        <span className="logo small">JOGA</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`sync ${sync}`}>{sync}{sync === 'offline' ? ' – lokal gespeichert' : ''}</span>
          <button className="btn btn-sm" data-lib-btn onClick={() => { setOpenContent(null); setLib(lib ? null : 'hooks'); }} style={{ borderColor: lib ? 'var(--accent)' : undefined, color: lib ? 'var(--accent)' : undefined }}>Bibliothek</button>
        </span>
      </div>
      <main>
        {lib ? <BibliothekView state={state} update={update} sub={lib} setSub={setLib} hookCtx={hookCtx} setHookCtx={setHookCtx} onClose={() => setLib(null)} />
          : detailOpen ? <ContentDetail key={openContent} id={openContent} state={state} update={update} onClose={() => setOpenContent(null)} gotoContent={gotoContent} />
          : <>
            {tab === 'heute' && <HeuteView state={state} update={update} gotoContent={gotoContent} gotoBriefing={gotoBriefing} />}
            {tab === 'plan' && <PlanView state={state} gotoContent={gotoContent} ui={ui} setUi={setUi} />}
            {tab === 'produktion' && <ProduktionView state={state} update={update} ui={ui} setUi={setUi} gotoContent={gotoContent} gotoHooks={(c) => { setHookCtx(c); setLib('hooks'); }} />}
            {tab === 'analyse' && <AnalyseView state={state} update={update} ui={ui} setUi={setUi} gotoContent={gotoContent} />}
          </>}
      </main>
      <nav className="tabs" data-main-nav>{tabs.map(([k, l]) => <button key={k} data-nav={k} className={tab === k ? 'on' : ''} style={{ fontSize: 10.5, padding: '12px 2px 10px', letterSpacing: '.02em' }} onClick={() => setTab(k)}>{l}</button>)}</nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
