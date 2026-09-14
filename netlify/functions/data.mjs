// Speichert den kompletten App-Zustand als ein JSON-Dokument in Netlify Blobs.
// Zugriff nur mit PIN (Umgebungsvariable APP_PIN). Ohne APP_PIN ist die Function offen – nicht empfohlen.
import { getStore } from '@netlify/blobs';

const KEY = 'state.json';

export default async (req) => {
  const pin = process.env.APP_PIN;
  const sent = req.headers.get('x-joga-pin') || '';
  if (pin && sent !== pin) {
    return new Response(JSON.stringify({ error: 'PIN falsch' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }
  const store = getStore('joga-content');

  if (req.method === 'GET') {
    const raw = await store.get(KEY);
    return new Response(raw || 'null', { status: 200, headers: { 'content-type': 'application/json' } });
  }

  if (req.method === 'PUT') {
    const body = await req.text();
    try { JSON.parse(body); } catch { return new Response(JSON.stringify({ error: 'Kein gültiges JSON' }), { status: 400 }); }
    await store.set(KEY, body);
    return new Response(JSON.stringify({ ok: true, savedAt: new Date().toISOString() }), { status: 200, headers: { 'content-type': 'application/json' } });
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: '/api/data' };
