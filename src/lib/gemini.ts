import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Qualification } from './types';
import { SERVICE_CATALOG } from './types';

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY mancante');
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
}

async function loadServiceSlugs(): Promise<string[]> {
  try {
    const { getSupabaseServer } = await import('./supabase');
    const sb = getSupabaseServer();
    const { data } = await sb.from('services').select('slug').eq('is_active', true);
    const slugs = (data || []).map((r) => (r as { slug: string }).slug);
    return slugs.length ? slugs : [...SERVICE_CATALOG];
  } catch {
    return [...SERVICE_CATALOG];
  }
}

// LOGICA FALLBACK: mai bloccare la raccolta lead per guasto AI — keyword locali.
function fallbackQualify(prompt: string): Qualification {
  const lower = prompt.toLowerCase();
  let service = 'generico';
  for (const s of SERVICE_CATALOG) {
    if (lower.includes(s)) {
      service = s;
      break;
    }
  }
  if (/palestra|piscina|personal/.test(lower) && service === 'generico') service = 'palestra';
  if (/parrucchiere|estetista|massaggi|pulizie|trasloco|giardino/.test(lower) && service === 'generico') {
    if (/parrucchiere/.test(lower)) service = 'parrucchiere';
    else if (/estetista/.test(lower)) service = 'estetista';
    else if (/massaggi/.test(lower)) service = 'massaggi';
    else if (/pulizie/.test(lower)) service = 'pulizie';
    else if (/trasloc/.test(lower)) service = 'traslochi';
    else if (/giardino/.test(lower)) service = 'giardinaggio';
  }
  if (/caldaia|perdita|allag|rottura|acqua|gas|scossa|corto|bloccato|urgen|subito/.test(lower)) {
    if (service === 'generico' && /caldaia/.test(lower)) service = 'caldaia';
    if (service === 'generico' && /acqua|perdita|tubo|rubinetto|scarico/.test(lower)) service = 'idraulica';
    if (service === 'generico' && /corrente|presa|interruttore|luce/.test(lower)) service = 'elettricista';
    if (service === 'generico' && /clima|condizionatore|aria/.test(lower)) service = 'climatizzazione';
  }
  // NUOVI VERTICALI — keyword deterministiche (stessa logica: mai bloccare la raccolta lead)
  if (service === 'generico') {
    if (/cane|cagnolone|tolettatura|pet |veterinario|dog|gatto/.test(lower)) {
      if (/tolettatura|taglio pelo|pulizia cane/.test(lower)) service = 'toelettatura';
      else if (/veterinario|vaccino|gatto malato/.test(lower)) service = 'veterinario';
      else if (/addestra|educazione cane/.test(lower)) service = 'addestratore-cani';
      else if (/passeggiat|dog walker/.test(lower)) service = 'passeggiate-cani';
      else service = 'pet-sitting';
    }
    if (service === 'generico' && /pc|computer|portatile|windows|mac lento|formatta/.test(lower)) service = 'assistenza-pc';
    if (service === 'generico' && /telefono|smartphone|schermo rotto|batteria spenta/.test(lower)) service = 'riparazione-smartphone';
    if (service === 'generico' && /wifi|modem|router|rete|internet lento/.test(lower)) service = 'installazione-reti';
    if (service === 'generico' && /recupero dati|hard disk|disco rigido/.test(lower)) service = 'recupero-dati';
    if (service === 'generico' && /babysitter|baby sitter|tata|bambino piccolo/.test(lower)) service = 'babysitter';
    if (service === 'generico' && /ripetizioni|scuola|compiti|medie|elementari/.test(lower)) service = 'ripetizioni';
    if (service === 'generico' && /festa compleanno|animazione|baby dance/.test(lower)) service = 'animazione-feste';
    if (service === 'generico' && /personal shop|stile|abbigliamento consiglio/.test(lower)) service = 'personal-shopper';
    if (service === 'generico' && /consegna spesa|spesa a domicilio|supermercato/.test(lower)) service = 'consegna-spesa';
    if (service === 'generico' && /acquisto online|amazon|ordine online/.test(lower)) service = 'acquisti-online';
    if (service === 'generico' && /meccanic|auto in officina|freni|frizione|revisione/.test(lower)) service = 'meccanica-auto';
    if (service === 'generico' && /gommista|gomme|pneumatici/.test(lower)) service = 'gommista';
    if (service === 'generico' && /lavaggio auto|lustrare auto/.test(lower)) service = 'lavaggio-auto';
    if (service === 'generico' && /anziano|nonno|nonna|badante/.test(lower)) service = 'assistenza-anziani';
    if (service === 'generico' && /accompagnamento|visite mediche anziano/.test(lower)) service = 'accompagnamento-anziani';
    // Bancario
    if (service === 'generico' && /mutuo|surroga|prima casa/.test(lower)) service = 'mutui';
    if (service === 'generico' && /assicurazion|polizza|rc auto/.test(lower)) service = 'assicurazioni';
    if (service === 'generico' && /prestito|finanziamento|cessione del quinto/.test(lower)) service = 'prestiti';
    if (service === 'generico' && /consulente finanziario|investiment|risparmio|pensione complementare/.test(lower)) service = 'consulenza-finanziaria';
    if (service === 'generico' && /banca|filiale|conto corrente|bancomat|assegno/.test(lower)) service = 'banca';
  }
  const urgency: Qualification['urgency'] = /urgen|subito|perdita|allag|gas|scossa|bloccato|rottura/.test(lower)
    ? 'high'
    : /domani|settimana|preventivo|installazione|manutenzione/.test(lower)
      ? 'low'
      : 'medium';
  const words = prompt.split(/\s+/).slice(0, 12).join(' ');
  return { service, urgency, summary: words };
}

export async function qualifyLead(prompt: string): Promise<Qualification> {
  if (!process.env.GEMINI_API_KEY) return fallbackQualify(prompt);
  try {
    const slugs = await loadServiceSlugs();
    const model = getModel();
    const systemPrompt =
      `Sei un qualificatore esperto di lead. Analizza la richiesta ed estrai un JSON valido ` +
      `(senza markdown codeblock) con esattamente queste chiavi: ` +
      `"service" (una tra: ${slugs.join(', ')}, oppure 'generico'), ` +
      `"urgency" ('low'|'medium'|'high'), "summary" (max 12 parole). ` +
      `Richiesta utente: "${prompt.replace(/"/g, "'")}"`;
    const result = await model.generateContent(systemPrompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text) as Qualification;
    if (!parsed.service || !parsed.urgency || !parsed.summary) throw new Error('JSON incompleto');
    return parsed;
  } catch {
    return fallbackQualify(prompt);
  }
}
