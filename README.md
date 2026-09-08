# STROBE — Piattaforma Lead Geolocalizzati (0€/mese)

Raccolta richieste → qualifica AI (Gemini free) → geo-match PostGIS → notifica Telegram/Email → waterfall 15 min → valutazione.

## Stack gratuito
- **AI**: Gemini `gemini-3.1-flash-lite-preview` (unico modello free che risponde 200 su questa chiave; `gemini-2.5-flash` ritirato → 404) + fallback keyword se chiave assente
- **DB/Geo**: Supabase Free Tier + PostGIS (`kbwaolqwdhswgkicbzmx`)
- **Cron**: Vercel Cron ogni 5 min (`vercel.json`)
- **Notifiche**: Telegram Bot API + Resend (3.000 email/mese free)

## Avvio
```bash
cp .env.example .env.local   # compila GEMINI_API_KEY, RESEND_API_KEY, TELEGRAM_BOT_TOKEN
npm install
psql < supabase-schema.sql   # oppure applica via Management API
npm run dev
```

## Flusso
1. `/` — form: testo libero + GPS (`navigator.geolocation`) o città/CAP (Nominatim) + privacy
2. `POST /api/leads` — qualifica → `match_smart_partners()` → assegna miglior partner → notifica anonima
3. Partner accetta via `/partner?lead=…` o pulsante Telegram → contatti sbloccati
4. `GET /api/cron/check-timeouts` — scaduti >15 min → riassegna al successivo (excluded)
5. `/valuta/[id]` — cliente valuta → rating partner aggiornato (media)

## API
| Route | Metodo | Note |
|---|---|---|
| `/api/qualify-lead` | POST {prompt} | Gemini + fallback |
| `/api/match-partner` | POST {lat,lon,service,urgency,excluded} | RPC PostGIS |
| `/api/leads` | POST/GET | crea lead + dispatch |
| `/api/leads/accept` | POST {leadId,partnerId} | sblocca contatti |
| `/api/leads/rate` | POST {leadId,rating} | aggiorna rating |
| `/api/partners` | GET/POST/PATCH | CRUD partner |
| `/api/cron/check-timeouts` | GET ?secret= | waterfall (Vercel Cron) |
| `/api/telegram/webhook` | POST | callback Accetta |

## Scoring
`final_score = (100-distanza_km)*0.4 + (rating*10)*0.4 + (10-leads_today)*0.2` — solo partner attivi, sotto carico max, con servizio e dentro `coverage_radius_km`.

## Note tecniche
- PostgREST restituisce `GEOGRAPHY` in **EWKB hex** → parser `parseEwkbPoint` nel cron (non WKT/GeoJSON).
- Management API Supabase: serve header `User-Agent: Mozilla/5.0` o 403 Cloudflare.
- Email `from` riusa dominio verificato `shop-brianza.com` su Resend.

## Logiche di progetto (perché è fatto così)
1. **Notifica anonimizzata**: il partner vede guasto/urgenza/distanza ma NON i contatti finché non accetta → privacy GDPR + anti-scavalcamento (il cliente non viene contattato da chi non si impegna).
2. **Waterfall 15 min con excluded[]**: ogni tentativo scaduto esclude quel partner nel giro dopo → niente loop sullo stesso inattivo, niente lead persi.
3. **Rating a media mobile** (`(vecchio+nuovo)/2`): semplice, anti-spike da singola recensione; con volumi alti si passa a media pesata.
4. **Degrado grazioso**: Telegram/Resend assenti → il lead viene comunque assegnato e gestito da dashboard (notifiche = best-effort, mai bloccanti).
5. **Cron ogni 5 min, timeout 15 min**: il ritardo max di riassegnazione è 5 min; granularità minore costerebbe esecuzioni Vercel senza benefici.

## Produzione (live 2026-09-06)
- Sito: https://smart-lead-routing.vercel.app
- Repo: https://github.com/donaldkevin765-maker/smart-lead-routing
- Waterfall: GitHub Actions ogni 5 min (Vercel Hobby = solo cron giornalieri) + rete sicurezza giornaliera Vercel.

## Da completare (richiedono azione umana)
1. **Telegram**: nessun token sul PC → crearlo con @BotFather su Telegram (`/newbot`), poi `TELEGRAM_BOT_TOKEN` in `.env.local` + env Vercel + webhook: `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://smart-lead-routing.vercel.app/api/telegram/webhook`. Senza: notifiche solo via dashboard (degrado previsto).
2. **Resend**: la chiave trovata sul PC risulta invalida → generarne una nuova su resend.com/api-keys, poi `RESEND_API_KEY` in `.env.local` + env Vercel. Senza: email saltate, lead comunque assegnati (degrado previsto).
