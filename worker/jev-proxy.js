// Cloudflare Worker: keeps TYPESAFE_API_KEY server-side.
// Browser -> POST {PROXY_URL}  { model?, state, questions }  -> api.typesafe.ai /v1/systemone
const UPSTREAM = 'https://api.typesafe.ai/v1/systemone';
const MODELS = ['jev-latest', 'jev-preview'];
const MAX_STATE = 4000;
const MAX_QUESTIONS = 5;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
    const ok = allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': ok ? origin : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!ok) return json({ error: 'origin not allowed' }, 403);
    if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405);
    if (!env.TYPESAFE_API_KEY) return json({ error: 'proxy not configured' }, 500);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'invalid JSON' }, 400); }

    const { model = 'jev-latest', state, questions } = body || {};
    if (!MODELS.includes(model)) return json({ error: 'unknown model' }, 400);
    if (typeof state !== 'string' || !state || state.length > MAX_STATE) return json({ error: 'invalid state' }, 400);
    if (!questions || typeof questions !== 'object' || Object.keys(questions).length === 0 ||
        Object.keys(questions).length > MAX_QUESTIONS) return json({ error: 'invalid questions' }, 400);

    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.TYPESAFE_API_KEY}` },
      body: JSON.stringify({ model, state, questions }),
    });
    if (!upstream.ok) return json({ error: 'upstream error', status: upstream.status }, 502);
    return json(await upstream.json());
  },
};
