/* ---------- Stundenwerkstatt (STUNDEN) ---------- */
function WerkstattView({ state, update }) {
  const [view, setView] = useState('reihe');
  const [selected, setSelected] = useState('0');
  const [variantId, setVariantId] = useState('');
  const [cmp, setCmp] = useState(['0', '1']);
  const lessons = state.werkstatt;
  const lesson = lessons.find(l => l.id === selected) || lessons[0];
  const variant = lesson.variants.find(v => v.id === variantId) || lesson.variants[0];
  // Änderungen laufen über eine Kopie des Werkstatt-Zustands; gespeichert wird mit dem restlichen App-Zustand.
  const mut = (fn) => update(s => { const w = WK.clone(s.werkstatt); fn(w); return { ...s, werkstatt: w }; });
  const mutV = (fn) => mut(w => { const l = w.find(x => x.id === lesson.id); fn(l, l.variants.find(v => v.id === variant.id) || l.variants[0]); });
  const open = (id) => { setSelected(id); setVariantId(''); setView('stunde'); window.scrollTo(0, 0); };
  const apply = (r) => { update(s => ({ ...s, werkstatt: r.lessons })); setSelected(r.selected); setVariantId(r.variant); };

  const card = (l, label) => (
    <div className="card wk-card" key={l.id} onClick={() => open(l.id)}>
      <div className="card-top"><span className="chip none">{label}</span><span className="chip none">{l.badge}</span></div>
      <b>{l.title}</b>
      <p className="hint">{l.data[1]}</p>
      <p className="hint">{WK.openCount(l)} offen · {l.variants.length} Varianten</p>
    </div>
  );

  const Reihe = () => (
    <>
      <p className="hint">Vom Pincha-Lab zur nächsten sinnvollen Aufgabe. Der Starter-Flow hat seinen eigenen Einstieg.</p>
      {lessons.filter(l => l.index < 5).map((l, i) => card(l, i + 1))}
      <h3 className="wk-h">Starter-Flow · eigener Zweig</h3>
      {lessons.filter(l => l.index === 5).map(l => card(l, 'S'))}
      <h3 className="wk-h">Was trägt. Was klemmt.</h3>
      {WK.edges.map(([t, d], i) => (
        <div key={t} className={`pattern ${[1, 2, 3].includes(i) ? 'wk-risk' : ''}`}><b>{t}</b><p>{d}</p></div>
      ))}
      <Btn kind="primary" onClick={() => setView('vergleich')}>Stunden vergleichen</Btn>
    </>
  );

  const Vergleich = () => {
    const [a, b] = cmp.map(id => lessons.find(l => l.id === id) || lessons[0]);
    const trav = Math.abs(a.index - b.index) === 1 ? WK.edges[Math.max(a.index, b.index)] : (a.index === 5 || b.index === 5) ? WK.edges[5] : null;
    const rows = [...WK.fields.map((f, i) => [f, l => l.data[i]]),
      ['Offene Entscheidungen', l => l.decisions.filter(d => !d.done).map(d => d.text).join(' · ') || 'Keine offenen Entscheidungen'],
      ['Varianten und Planzeiten', l => l.variants.map(v => `${v.name} · ${WK.clock(WK.total(v))}`).join(' / ')]];
    return (
      <>
        <p className="hint">Zwei Stunden nebeneinander. Änderungen aus der Stundenansicht erscheinen hier.</p>
        <div className="grid2">{[0, 1].map(i => (
          <Field key={i} label={['Erste Stunde', 'Zweite Stunde'][i]}>
            <select value={cmp[i]} onChange={e => setCmp(c => c.map((x, j) => j === i ? e.target.value : x))}>{lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select>
          </Field>))}
        </div>
        {trav && <div className="pattern"><b>{trav[0]}</b><p>{trav[1]}</p></div>}
        {rows.map(([f, get]) => (
          <div className="card slim wk-cmp" key={f}>
            <div className="hint">{f}</div>
            <div className="grid2"><div><b className="wk-who">{a.title}</b><p>{get(a)}</p></div><div><b className="wk-who">{b.title}</b><p>{get(b)}</p></div></div>
          </div>))}
      </>
    );
  };

  const Stunde = () => {
    let elapsed = 0;
    const isStarter = lesson.index === 5;
    const missing = isStarter ? WK.manuscript.modules.filter(m => !variant.phases.some(p => p.id === m.id)) : [];
    const sum = WK.total(variant);
    const off = variant.target && sum !== variant.target * 60;
    return (
      <>
        <div className="row wrap">
          <Btn small onClick={() => apply(WK.duplicateLesson(lessons, lesson.id))}>Stunde duplizieren</Btn>
          <Btn small kind="primary" onClick={() => apply(WK.addVariant(lessons, lesson.id, variant.id))}>Variante anlegen</Btn>
        </div>
        <h2 className="wk-title">{lesson.title}</h2>
        <p className="hint">{lesson.data[1]} · Quelle: {WK.sources[lesson.index]}</p>
        <div className="row wrap">{lesson.variants.map(v => <Tag key={v.id} on={v.id === variant.id} onClick={() => setVariantId(v.id)}>{v.name}</Tag>)}</div>
        <div className="sheet">
          <div className="row between"><b>Planzeit {WK.clock(sum)}{variant.target ? ` / ${variant.target}:00` : ''}</b><span className={`chip ${off ? 'gedreht' : 'none'}`}>{variant.phases.length} {isStarter ? 'Module' : 'Phasen'}</span></div>
          <div className="wk-timeline">{variant.phases.map((p, i) => <span key={i} style={{ flex: p.sec }} />)}</div>
          <div className="grid2">
            <Field label="Variantenname"><input value={variant.name} onChange={e => mutV((l, v) => { v.name = e.target.value; })} /></Field>
            <Field label="Zieldauer in Minuten"><input type="number" inputMode="numeric" min="0" max="120" value={variant.target} onChange={e => mutV((l, v) => { v.target = Math.max(0, Math.min(120, Math.trunc(Number(e.target.value) || 0))); })} /></Field>
          </div>
          {missing.length > 0 && (
            <Field label="Modul aus dem Starter-Baukasten ergänzen">
              <select value="" onChange={e => e.target.value && mutV((l, v) => WK.addModule(v, e.target.value))}>
                <option value="">Modul wählen</option>{missing.map(m => <option key={m.id} value={m.id}>{m.name} · {WK.clock(m.sec)}</option>)}
              </select>
            </Field>)}
        </div>
        {variant.phases.map((p, i) => {
          const start = WK.clock(elapsed); elapsed += Number(p.sec) || 0;
          return (
            <details className="card wk-phase" key={`${variant.id}-${p.id ?? ''}-${i}`}>
              <summary><span className="wk-time">{start}</span> {p.name} · {WK.clock(p.sec)} {p.group && <span className="chip none">{p.group}</span>} {p.review && <span className="chip gedreht">Prüfen</span>}</summary>
              {p.take && <p className="hint"><b>{p.take}</b></p>}
              {p.review && <p className="wk-review">{p.review}</p>}
              <div className="grid2">
                <Field label="Phasenname"><input value={p.name} onChange={e => mutV((l, v) => { v.phases[i].name = e.target.value; })} /></Field>
                <Field label="Planzeit in Sekunden"><input type="number" inputMode="numeric" min="0" max="7200" value={p.sec} onChange={e => mutV((l, v) => { v.phases[i].sec = Math.max(0, Math.min(7200, Math.trunc(Number(e.target.value) || 0))); })} /></Field>
              </div>
              <Field label="Konkrete Änderung oder Übergang"><textarea rows={3} value={p.note} onChange={e => mutV((l, v) => { v.phases[i].note = e.target.value; })} /></Field>
              <details className="wk-text"><summary>Ablauf und Ansagen bearbeiten</summary>
                <Field label="Phasentext"><textarea className="wk-manu" rows={12} value={p.text} onChange={e => mutV((l, v) => { v.phases[i].text = e.target.value; })} /></Field>
              </details>
              {isStarter && <Btn small onClick={() => mutV((l, v) => { v.phases.splice(i, 1); })}>Aus Variante nehmen</Btn>}
            </details>
          );
        })}
        <div className="sheet">
          <h3 className="wk-h">Entscheidungen</h3>
          {lesson.decisions.map((d, i) => (
            <div key={i} className="wk-dec">
              <Field label={`Entscheidung ${i + 1}`}><textarea rows={2} value={d.text} onChange={e => mutV(l => { l.decisions[i].text = e.target.value; })} /></Field>
              <Field label="Status"><select value={d.done ? 'done' : 'open'} onChange={e => mutV(l => { l.decisions[i].done = e.target.value === 'done'; })}><option value="open">Offen</option><option value="done">Entschieden</option></select></Field>
            </div>))}
          <Btn small onClick={() => mutV(l => { l.decisions.push({ text: '', done: false }); })}>Entscheidung ergänzen</Btn>
        </div>
        <div className="sheet">
          <h3 className="wk-h">Stundenprofil</h3>
          <Field label="Stundenname"><input value={lesson.title} onChange={e => mutV(l => { l.title = e.target.value; })} /></Field>
          {WK.fields.map((f, i) => <Field key={f} label={f}><textarea rows={2} value={lesson.data[i] ?? ''} onChange={e => mutV(l => { l.data[i] = e.target.value; })} /></Field>)}
        </div>
      </>
    );
  };

  const [msg, setMsg] = useState('');
  const doExport = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(lessons, null, 1)], { type: 'application/json' }));
    a.download = `joga-werkstatt-sicherung-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const doImport = (text) => {
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.lessons) ? parsed.lessons : null;
      const valid = arr && arr.length && arr.every(x => x && x.id && Array.isArray(x.variants) && x.variants.length && Array.isArray(x.decisions) && Array.isArray(x.data));
      if (!valid) throw new Error('Das ist keine Werkstatt-Sicherung.');
      update(s => ({ ...s, werkstatt: WK.normalize(arr) })); setSelected(arr[0].id); setVariantId(''); setMsg('Sicherung importiert.');
    } catch (e) { setMsg('Import fehlgeschlagen: ' + e.message); }
  };
  const Sicherung = () => (
    <details className="sheet">
      <summary>Sicherung · Export und Import</summary>
      <p className="hint">Gespeichert wird mit dem restlichen App-Zustand. Mit der Sicherung lassen sich Änderungen aus der alten Stundenwerkstatt übernehmen. Ein Import ersetzt den aktuellen Stand.</p>
      <div className="row wrap">
        <Btn small onClick={doExport}>Exportieren</Btn>
        <label className="btn btn-sm">Datei importieren<input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = () => doImport(String(r.result)); r.readAsText(f); } e.target.value = ''; }} /></label>
      </div>
      {msg && <p className="hint">{msg}</p>}
    </details>
  );
  return (
    <div className="wk">
      <div className="row wrap">{[['reihe', 'Reihe'], ['vergleich', 'Vergleich'], ['stunde', 'Stunde']].map(([k, l]) => <Tag key={k} on={view === k} onClick={() => setView(k)}>{l}</Tag>)}</div>
      {view === 'reihe' ? Reihe() : view === 'vergleich' ? Vergleich() : Stunde()}
      {view === 'stunde' && Sicherung()}
    </div>
  );
}
