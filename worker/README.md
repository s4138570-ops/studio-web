# Jev proxy (Cloudflare Worker)

Lets the public site call the TypeSafe "Jev" API without exposing the API key.

1. `cd worker && npx wrangler login`
2. `npx wrangler secret put TYPESAFE_API_KEY` (paste the key when prompted; never commit it)
3. Edit `ALLOWED_ORIGIN` in `wrangler.toml` if the site is hosted elsewhere
4. `npx wrangler deploy` and copy the printed `https://jev-proxy.<you>.workers.dev` URL
5. Put that URL in `JEV_PROXY_URL` at the top of `../api.js`

Then, from any page script: `await jev.noul('some text', 'Is this about billing?')`.
