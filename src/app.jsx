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
const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
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
const emptyState = () => ({ v: 1, goals: GOALS_DEFAULT, reels: BASELINE, reviews: {}, moves: SEED_MOVES, shoots: [], hookNotes: [] });

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

function ShootPlanner({ state, update, gotoHooks }) {
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
  const delShoot = (sid) => { if (confirm('Dreh und alle Schnitte löschen?')) update(s => ({ ...s, shoots: s.shoots.filter(x => x.id !== sid) })); };
  const toBoard = (sh, c) => { const rid = uid(); const orig = c.kind === 'Recut' ? (sh.cuts.find(x => x.kind === 'Routine')?.reelId || '') : ''; update(s => ({ ...s, reels: [...s.reels, { id: rid, date: c.date, type: c.type, hook: c.hook || c.title, len: '', recutOf: orig, views: '', v3: '', saves: '', reacts: '', shares: '', comments: '', followers: '', notes: '' }], shoots: s.shoots.map(x => x.id !== sh.id ? x : { ...x, cuts: x.cuts.map(y => y.id === c.id ? { ...y, status: 'gepostet', reelId: rid } : y) }) })); };
  const mv = (id) => state.moves.find(m => m.id === id);
  const shoots = state.shoots.slice().sort((a, b) => b.date.localeCompare(a.date));
  const week = useMemo(() => { const days = Array.from({ length: 7 }, (_, i) => addDays(todayISO(), i)); return days.map(d => ({ d, cuts: state.shoots.flatMap(sh => sh.cuts.filter(c => c.date === d).map(c => ({ ...c, sh }))) })); }, [state.shoots]);
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
                  <select value={c.status} onChange={e => setCut(sh.id, c.id, { status: e.target.value })}>{CUT_STATUS.map(s => <option key={s}>{s}</option>)}</select>
                </div>
                <div className="meta">{c.moves.map(mv).filter(Boolean).map(m => m.title).join(' + ')}</div>
                <input value={c.hook || ''} placeholder={c.title} onChange={e => setCut(sh.id, c.id, { hook: e.target.value })} />
                <div className="row end">
                  <Btn small onClick={() => gotoHooks({ typ: c.type, thema: sh.theme, moves: c.moves.map(mv).filter(Boolean).map(m => m.title).join(', '), cutRef: { sid: sh.id, cid: c.id } })}>Hook-Impulse</Btn>
                  {c.reelId ? <span className="meta">im Board</span> : <Btn small kind="primary" onClick={() => toBoard(sh, c)}>Ins Board</Btn>}
                </div>
              </li>
            ))}
          </ul>
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
  const [tab, setTab] = useState('board');
  const [state, setState] = useState(null);
  const [sync, setSync] = useState('lädt');
  const [needPin, setNeedPin] = useState(false);
  const [hookCtx, setHookCtx] = useState(null);
  const dirty = useRef(false);
  const timer = useRef(null);

  const load = async () => {
    setSync('lädt');
    try { const remote = await api.load(); setState(remote && remote.reels ? { ...emptyState(), ...remote } : emptyState()); setSync('gespeichert'); setNeedPin(false); }
    catch (e) { if (e.message === 'PIN') { setNeedPin(true); setSync('PIN'); } else { const local = localStorage.getItem('joga_state'); setState(local ? JSON.parse(local) : emptyState()); setSync('offline'); } }
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

  const tabs = [['board', 'Board'], ['review', 'Review'], ['plan', 'Drehplan'], ['hooks', 'Hooks'], ['lib', 'Moves']];
  return (
    <div className="app">
      <div className="topbar"><span className="logo small">JOGA</span><span className={`sync ${sync}`}>{sync}{sync === 'offline' ? ' – lokal gespeichert' : ''}</span></div>
      <main>
        {tab === 'board' && <Board state={state} update={update} />}
        {tab === 'review' && <Review state={state} update={update} />}
        {tab === 'plan' && <ShootPlanner state={state} update={update} gotoHooks={(c) => { setHookCtx(c); setTab('hooks'); }} />}
        {tab === 'hooks' && <Hooks state={state} update={update} ctx={hookCtx} setCtx={setHookCtx} />}
        {tab === 'lib' && <Library state={state} update={update} />}
      </main>
      <nav className="tabs">{tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
