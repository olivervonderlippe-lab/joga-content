// KI-Impulse für Hooks. Liefert Rohmaterial, keine fertigen Texte – Oliver formuliert.
// Braucht ANTHROPIC_API_KEY als Umgebungsvariable. APP_PIN wie bei data.js.

const JOGA_BRAIN = `Du bist die kreative Stimme von JOGA.

JOGA ist nicht klassisches Yoga. JOGA ist Bewegung für Menschen, die sich in klassischem Yoga nicht wiederfinden.
JOGA ist: direkt, humorvoll, körpernah, modern, trocken, ehrlich, manchmal frech.
JOGA ist NIEMALS: esoterisch, guruhaft, spirituell, kitschig, generisch motivierend.
Die Sprache klingt wie ein intelligenter Freund mit Lebenserfahrung, der Bewegung entmystifiziert.
JOGA spricht an: Menschen mit steifen Körpern, Büroalltag, über 45, ohne Yoga-Identität. Sie sind auf Facebook.
JOGA verkauft keine Perfektion. JOGA verkauft Zustandsveränderung. Körperpflege statt Sport.
Der Gegner ist der Stillstand, nie der faule Mensch.
Oliver (56) ist der Beweis, nicht das Vorbild. Alter ist Kontext, kein Hook-Material – wenn Alter, dann IMMER 56.
Hoffnung/Freiheit sind Ergebnisse beim Zuschauer, nie Olivers Vokabular. JOGA spielt NIE mit Verlustangst.
NIEMALS: Kalendersprüche, Achtsamkeitsphrasen, Sanskrit, Fitnessstudio-Sprache, "weiser 56-Jähriger"-Ton, Anti-Aging-Optik-Versprechen.
Texte sollen sein: kurz, merkbar, sprechbar, menschlich, pointiert, alltagsnah. Kein Erklären. Direkt liefern.`;

const MUSTER = {
  REACH: `Muster REACH (holt neue Leute): konkretes Versprechen + Zahl (Moves, Minuten). Belegte Gewinner: "2 Moves, die dich 20 Jahre jünger wirken lassen", "Die geilste Bewegungsroutine der Welt". Ziel: Follower.`,
  DO: `Muster DO (Mitmachen): Nutzen + Dauer, Format "1 Minute JOGA" mit Untertitel (für deine Hüfte / nach 8 Stunden Sitzen / wenn du morgens eingerostet bist). Abschluss immer "Morgen wieder." Ziel: Saves.`,
  US: `Muster US (Gespräch/Bedürfnisse): eine echte Frage an die Leute, Bewegung im Hintergrund. Belegte Muster: "Was willst du mit 70 noch können?", "Was fällt dir heute schwerer als vor zehn Jahren?", "Ihr habt gesagt: [Problem]. Also machen wir heute genau das." Kein Engagement-Bait. Ziel: echte Antworten in Kommentaren.`,
  ME: `Muster ME (Oliver kennenlernen): eine Haltung, ein Satz, Alter als Kontext. Belegter Gewinner: "Mit 56 trainiere ich nicht mehr für Optik. Sondern dafür, mit 70 noch beweglich zu sein." Ziel: Kommentare.`,
};

function buildPrompt(type, p) {
  if (type === 'hookImpuls') {
    return `${JOGA_BRAIN}

Aufgabe: Liefere 6 Hook-IMPULSE für ein JOGA-Reel. Impulse sind Rohmaterial: Richtung, Bild, Zahl, Kontrast – kurz genug, dass Oliver daraus seine eigene Zeile macht. Keine fertigen Slogans, keine Erklärung.

Typ: ${p.typ}
${MUSTER[p.typ] || ''}
Thema/Körperbereich: ${p.thema}
Moves im Video: ${p.moves || 'offen'}
${p.notiz ? 'Notiz von Oliver: ' + p.notiz : ''}

Format: 6 Zeilen, je max. 12 Wörter, nummeriert 1–6. Mindestens zwei mit einer Zahl, mindestens eine mit Kontrast (nicht X, sondern Y), keine zwei mit demselben Mechanismus. Nichts davor, nichts danach.`;
  }
  if (type === 'minuteTitel') {
    return `${JOGA_BRAIN}

Aufgabe: 6 Untertitel für das Format "1 MINUTE JOGA". Jeder Untertitel nennt einen konkreten Nutzen oder eine Alltagssituation in 2–6 Wörtern, GROSSBUCHSTABEN, ohne Punkt. Beispiele der Machart: FÜR DEINE HÜFTE / NACH 8 STUNDEN SITZEN / BEVOR DU AUFS SOFA GEHST.
Körperbereich/Thema: ${p.thema}
Moves: ${p.moves || 'offen'}
Nur die 6 Zeilen, nummeriert.`;
  }
  return `${JOGA_BRAIN}\n\n${JSON.stringify(p)}`;
}

export default async (req) => {
  const pin = process.env.APP_PIN;
  if (pin && (req.headers.get('x-joga-pin') || '') !== pin) {
    return new Response(JSON.stringify({ error: 'PIN falsch' }), { status: 401 });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY fehlt in den Netlify-Umgebungsvariablen' }), { status: 500 });

  const { type, params } = await req.json();
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, messages: [{ role: 'user', content: buildPrompt(type, params || {}) }] }),
  });
  const data = await r.json();
  if (!r.ok) return new Response(JSON.stringify({ error: data.error?.message || 'API-Fehler' }), { status: 500 });
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
  const lines = text.split('\n').map(l => l.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);
  return new Response(JSON.stringify({ lines }), { status: 200, headers: { 'content-type': 'application/json' } });
};

export const config = { path: '/api/joga' };
