// Browser client for the Jev (TypeSafe System One) API, via the Cloudflare Worker proxy.
// The API key never reaches the browser. After deploying worker/, paste its URL here.
const JEV_PROXY_URL = '';

async function jevAsk({ state, questions, model = 'jev-latest' }) {
  if (!JEV_PROXY_URL) throw new Error('JEV_PROXY_URL is not set in api.js (deploy worker/ first)');
  const res = await fetch(JEV_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, state, questions }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Jev request failed (${res.status})`);
  return data; // { model, answers, usage }
}

const jevOne = async (state, question, opts = {}) =>
  (await jevAsk({ state, questions: { answer: question }, ...opts })).answers.answer;

window.jev = {
  ask: jevAsk,
  // yes/no -> { noul: 0-1 }
  noul: (state, instructions, opts) => jevOne(state, { type: 'noul', instructions }, opts),
  // one of several named options -> { choice, confidence, probabilities }
  choice: (state, criteria, instructions, opts) => jevOne(state, { type: 'choice', criteria, instructions }, opts),
  // rating on an ordered rubric -> { score, confidence, legend, probabilities }
  score: (state, criteria, instructions, opts) => jevOne(state, { type: 'score', criteria, instructions }, opts),
};
