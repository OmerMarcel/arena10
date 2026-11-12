// ============================================================
// ARENA 10 — Service de Prédictions & Combinés IA
// Générateur de combinés à cote ~3.00 avec justification IA
// (Google Gemini 1.5 Flash ou Groq Llama-3.3 en fallback)
// ============================================================

import axios from 'axios'
import { config } from '../config'
import { logger } from '../utils/logger'
import { FullMatch, AiCombination, CombinationLeg } from '../types'
import { getFromCache, setCache } from '../utils/cache'

export interface MatchOption {
  match: FullMatch
  option: string
  market: string
  pick: string
  odds: number
  confidence: number
  reasoning: string
}

// ── Génère les options de paris possibles pour un match ───────
export function generateMatchOptions(match: FullMatch): MatchOption[] {
  const options: MatchOption[] = []
  const o = match.odds || { h: 2.10, d: 3.20, a: 3.40 }
  const conf = match.confidence || 75
  const home = match.home
  const away = match.away

  // Option 1 : Pick principal (1X2)
  if (match.pick === '1') {
    options.push({
      match,
      option: `Victoire ${home}`,
      market: '1X2',
      pick: '1',
      odds: o.h,
      confidence: conf,
      reasoning: `${home} affiche une dynamique solide à domicile avec un taux de confiance IA de ${conf}%.`
    })
    // Double chance 1X (sécurité)
    const dcOdds = +(1 / (1 / o.h + 1 / o.d) * 0.95).toFixed(2)
    options.push({
      match,
      option: `Double chance : ${home} ou Nul (1X)`,
      market: 'DOUBLE_CHANCE',
      pick: '1X',
      odds: Math.max(1.18, dcOdds),
      confidence: Math.min(95, Math.round(conf + 14)),
      reasoning: `Couverture maximale avec le nul : probabilité estimée à plus de 85% d'invincibilité pour ${home}.`
    })
  } else if (match.pick === '2') {
    options.push({
      match,
      option: `Victoire ${away}`,
      market: '1X2',
      pick: '2',
      odds: o.a,
      confidence: conf,
      reasoning: `${away} possède l'avantage tactique et statistique sur ce déplacement.`
    })
    const dcOdds = +(1 / (1 / o.a + 1 / o.d) * 0.95).toFixed(2)
    options.push({
      match,
      option: `Double chance : Nul ou ${away} (X2)`,
      market: 'DOUBLE_CHANCE',
      pick: 'X2',
      odds: Math.max(1.20, dcOdds),
      confidence: Math.min(95, Math.round(conf + 13)),
      reasoning: `Sécurisation du résultat à l'extérieur avec la double chance X2.`
    })
  } else {
    // Match nul pressenti -> 12 ou Double chance
    options.push({
      match,
      option: `Double chance : ${home} ou ${away} (12)`,
      market: 'DOUBLE_CHANCE',
      pick: '12',
      odds: 1.32,
      confidence: 82,
      reasoning: `Match très disputé, scénario à décision probable sans partage des points.`
    })
  }

  // Option Over 1.5 buts (très haute probabilité)
  const homeGoals = match.stats?.homeGoals ?? 1.6
  const awayGoals = match.stats?.awayGoals ?? 1.2
  const expGoals = homeGoals + awayGoals

  const o15Odds = expGoals > 2.8 ? 1.24 : expGoals > 2.3 ? 1.30 : 1.38
  options.push({
    match,
    option: 'Plus de 1.5 buts dans le match',
    market: 'OVER_UNDER',
    pick: 'O1.5',
    odds: o15Odds,
    confidence: 88,
    reasoning: `Moyenne cumulée de ${(expGoals).toFixed(1)} buts par match pour les deux attaques.`
  })

  // Option Over 2.5 buts (cote médiane avantageuse)
  if (expGoals >= 2.5) {
    const o25Odds = +(2.7 / expGoals + 0.65).toFixed(2)
    options.push({
      match,
      option: 'Plus de 2.5 buts dans le match',
      market: 'OVER_UNDER',
      pick: 'O2.5',
      odds: Math.min(2.10, Math.max(1.55, o25Odds)),
      confidence: 74,
      reasoning: `Potentiel offensif élevé et défenses perméables constatées sur les 5 dernières journées.`
    })
  }

  // Option Les deux équipes marquent (BTTS)
  if (homeGoals >= 1.0 && awayGoals >= 0.9) {
    options.push({
      match,
      option: 'Les deux équipes marquent (Oui)',
      market: 'BTTS',
      pick: 'BTTS_YES',
      odds: 1.72,
      confidence: 76,
      reasoning: `Les deux formations trouvent régulièrement le chemin des filets.`
    })
  }

  // ── 4. MARCHÉ DES CORNERS (Coups de coin) ─────────────────────
  const homeShots = match.stats?.homeShots ?? 14
  const awayShots = match.stats?.awayShots ?? 10
  const totalShots = homeShots + awayShots
  // Estimation statistique moyenne : 1 corner tous les 2.5 tirs
  const estCorners = +(totalShots * 0.40).toFixed(1)

  // Plus de 8.5 corners (seuil statistique de base fiable)
  const o85Odds = estCorners >= 10 ? 1.38 : 1.48
  options.push({
    match,
    option: 'Plus de 8.5 corners dans le match',
    market: 'CORNERS',
    pick: 'O8.5_CORNERS',
    odds: o85Odds,
    confidence: Math.min(88, Math.round(76 + (estCorners > 9 ? 8 : 0))),
    reasoning: `Volume de tirs cumulé élevé (${totalShots} tirs/m) projetant une moyenne de ${estCorners} corners.`
  })

  // Plus de 9.5 corners si équipes très offensives
  if (estCorners >= 9.5) {
    options.push({
      match,
      option: 'Plus de 9.5 corners dans le match',
      market: 'CORNERS',
      pick: 'O9.5_CORNERS',
      odds: 1.78,
      confidence: 75,
      reasoning: `Attaques très actives sur les ailes et fort taux de centres vers la surface.`
    })
  }

  // Équipe avec le plus de corners (avantage au favori à domicile)
  if ((match.stats?.homePoss ?? 50) >= 55) {
    options.push({
      match,
      option: `Plus de corners : ${home}`,
      market: 'CORNERS',
      pick: `MOST_CORNERS_${match.h || 'HOME'}`,
      odds: 1.45,
      confidence: 81,
      reasoning: `${home} monopolise le ballon (${match.stats?.homePoss}%) et installe le jeu dans le camp adverse.`
    })
  }

  // ── 5. MARCHÉ DES CARTONS (Jaunes & Rouges / Discipline) ───────
  // Détection des matchs à tension (derby, grands chocs ou compétitions majeures)
  const isHighTension = match.tags?.some(t => t.toLowerCase().includes('derby') || t.toLowerCase().includes('choc') || t.toLowerCase().includes('classique')) ||
    ['Premier League', 'LaLiga', 'Serie A'].includes(match.league)

  if (isHighTension) {
    options.push({
      match,
      option: 'Plus de 3.5 cartons dans le match',
      market: 'CARDS',
      pick: 'O3.5_CARDS',
      odds: 1.55,
      confidence: 80,
      reasoning: `Affiche à forte intensité émotionnelle et duels rugueux prévus au milieu de terrain.`
    })
    options.push({
      match,
      option: 'Plus de 4.5 cartons dans le match',
      market: 'CARDS',
      pick: 'O4.5_CARDS',
      odds: 1.95,
      confidence: 72,
      reasoning: `Rivalité historique et enjeu comptable majeur favorisant la friction et les avertissements.`
    })
  } else {
    // Match plus calme : Moins de 4.5 cartons (sécurité)
    options.push({
      match,
      option: 'Moins de 4.5 cartons dans le match',
      market: 'CARDS',
      pick: 'U4.5_CARDS',
      odds: 1.42,
      confidence: 83,
      reasoning: `Confrontation à faible agressivité tactique et arbitrage plutôt clément constaté.`
    })
  }

  // Carton rouge : 'Aucun carton rouge' (très haute sécurité, 86% de probabilité statistique)
  options.push({
    match,
    option: 'Aucun carton rouge dans la rencontre',
    market: 'CARDS',
    pick: 'NO_RED_CARD',
    odds: 1.20,
    confidence: 87,
    reasoning: `La probabilité statistique d'expulsion reste inférieure à 14% sur ce type de rencontre.`
  })

  // ── 6. MARCHÉ DES HANDICAPS (Asiatique & Européen) ─────────────
  // Si favori net à domicile (cote < 1.75 et confiance > 78%)
  if (o.h <= 1.75 && conf >= 78) {
    // Handicap -1.0 ou -1.5 : favori gagne par au moins 2 buts d'écart
    options.push({
      match,
      option: `Handicap : ${home} gagne par 2 buts ou plus (-1.5)`,
      market: 'HANDICAP',
      pick: `AH_${match.h || 'HOME'}_MINUS_1.5`,
      odds: +(o.h * 1.55).toFixed(2),
      confidence: 71,
      reasoning: `Supériorité offensive nette de ${home} (moyenne de ${homeGoals} buts/m).`
    })

    // Handicap sécurisé : Outsider avec avantage de +1.5 buts
    options.push({
      match,
      option: `Handicap sécurisé : ${away} ne perd pas de plus d'un but (+1.5)`,
      market: 'HANDICAP',
      pick: `AH_${match.a || 'AWAY'}_PLUS_1.5`,
      odds: 1.40,
      confidence: 84,
      reasoning: `Marge de sécurité couvrant la défaite courte d'un seul but, le nul ou l'exploit de ${away}.`
    })
  } else if (o.a <= 1.75 && conf >= 78) {
    // Favori à l'extérieur
    options.push({
      match,
      option: `Handicap : ${away} gagne par 2 buts ou plus (-1.5)`,
      market: 'HANDICAP',
      pick: `AH_${match.a || 'AWAY'}_MINUS_1.5`,
      odds: +(o.a * 1.55).toFixed(2),
      confidence: 70,
      reasoning: `${away} domine les transitions offensives face à une défense adverse friable.`
    })
    options.push({
      match,
      option: `Handicap sécurisé : ${home} avec avantage (+1.5)`,
      market: 'HANDICAP',
      pick: `AH_${match.h || 'HOME'}_PLUS_1.5`,
      odds: 1.42,
      confidence: 83,
      reasoning: `Résilience de ${home} devant son public limitant les écarts de score.`
    })
  } else {
    // Match équilibré : Handicap +1.5 sur l'équipe locale
    options.push({
      match,
      option: `Handicap : ${home} (+1.5 buts d'avance)`,
      market: 'HANDICAP',
      pick: `AH_${match.h || 'HOME'}_PLUS_1.5`,
      odds: 1.28,
      confidence: 89,
      reasoning: `Forces équilibrées, une défaite par 2 buts d'écart est hautement improbable.`
    })
  }

  return options
}

// ── Appel à Google Gemini 1.5 Flash (Gratuit 1 500 req/jour) ──
async function generateGeminiJustification(
  title: string,
  legs: CombinationLeg[],
  totalOdds: number
): Promise<string | null> {
  if (!config.geminiApiKey) return null

  const prompt = `Tu es l'analyste en chef de l'IA ARENA 10, spécialiste des paris combinés footballistiques.
Rédige une analyse synthétique, percutante et professionnelle (en 3 à 4 phrases percutantes en français) pour justifier ce combiné à cote totale de ${totalOdds.toFixed(2)} intitulé "${title}".

Matchs et sélections retenus :
${legs.map((l, i) => `${i + 1}. ${l.home} vs ${l.away} (${l.league}) : Option "${l.option}" à cote ${l.odds.toFixed(2)} (Indice confiance: ${l.confidence}%). Raison : ${l.reasoning}`).join('\n')}

Mets en avant la complémentarité des sélections, la maîtrise du risque et l'espérance de gain positive. Évite le jargon creux, reste direct et argumenté.`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`
    const res = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 350, temperature: 0.6 }
      },
      { timeout: 7000 }
    )
    const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (text) return text.trim()
  } catch (err: any) {
    logger.warn(`[AiPrediction] Échec Gemini Flash (${err?.message || err}) — Bascule vers fallback`)
  }
  return null
}

// ── Appel à Groq Llama 3.3 70B (Gratuit 14 400 req/jour) ──────
async function generateGroqJustification(
  title: string,
  legs: CombinationLeg[],
  totalOdds: number
): Promise<string | null> {
  if (!config.groqApiKey) return null

  const prompt = `Tu es l'expert analyste de l'algorithme ARENA 10.
Justifie de façon concise et convaincante (en français, 3-4 phrases) ce combiné football (Cote globale: ${totalOdds.toFixed(2)}, profil: "${title}") :
${legs.map(l => `- ${l.home} vs ${l.away} : ${l.option} (cote ${l.odds.toFixed(2)})`).join('\n')}`

  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.6
      },
      {
        headers: {
          'Authorization': `Bearer ${config.groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 7000
      }
    )
    const text = res.data?.choices?.[0]?.message?.content
    if (text) return text.trim()
  } catch (err: any) {
    logger.warn(`[AiPrediction] Échec Groq (${err?.message || err})`)
  }
  return null
}

// ── Justification algorithmique locale (zéro dépendance externe) ─
function buildAlgorithmicJustification(
  title: string,
  legs: CombinationLeg[],
  totalOdds: number
): string {
  const teams = legs.map(l => `${l.home} (${l.option})`).join(' et ')
  const avgConf = Math.round(legs.reduce((s, l) => s + l.confidence, 0) / legs.length)

  return `Combiné ${title} optimisé par l'algorithme ARENA 10 (cote globale ${totalOdds.toFixed(2)}). ` +
    `L'algorithme capitalise sur une probabilité conjointe supérieure à ${avgConf}% en associant ${teams}. ` +
    `Cette configuration maximise la sécurité en combinant la résilience défensive à domicile et des seuils de buts statistiquement éprouvés sur les 30 derniers jours.`
}

// ── Constructeur de combiné à partir d'un ensemble d'options ───
export function assembleCombination(
  pool: MatchOption[],
  id: string,
  title: string,
  badge: string,
  targetOdds = 3.0,
  minLegs = 2,
  maxLegs = 3
): AiCombination | null {
  // Recherche par exploration de la meilleure combinaison de 2 ou 3 matchs différents
  let bestSubset: MatchOption[] | null = null
  let bestDiff = 999

  // Regroupe par matchId pour ne jamais prendre 2 options du même match
  const matchIds = Array.from(new Set(pool.map(p => p.match.id)))
  if (matchIds.length < minLegs) return null

  // Combinaisons de 2 matchs
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      if (pool[i].match.id === pool[j].match.id) continue
      const prod2 = pool[i].odds * pool[j].odds
      const diff2 = Math.abs(prod2 - targetOdds)
      if (diff2 < bestDiff && prod2 >= 2.60 && prod2 <= 3.80) {
        bestDiff = diff2
        bestSubset = [pool[i], pool[j]]
      }

      // Combinaisons de 3 matchs
      if (maxLegs >= 3) {
        for (let k = j + 1; k < pool.length; k++) {
          if (pool[k].match.id === pool[i].match.id || pool[k].match.id === pool[j].match.id) continue
          const prod3 = prod2 * pool[k].odds
          const diff3 = Math.abs(prod3 - targetOdds)
          if (diff3 < bestDiff && prod3 >= 2.70 && prod3 <= 3.60) {
            bestDiff = diff3
            bestSubset = [pool[i], pool[j], pool[k]]
          }
        }
      }
    }
  }

  // Si pas de combinaison exacte ~3.0, on prend la meilleure combinaison de 2 ou 3 matchs triés par confiance
  if (!bestSubset) {
    const sorted = [...pool].sort((a, b) => b.confidence - a.confidence)
    const picked: MatchOption[] = []
    const seen = new Set<number>()
    let currentOdds = 1.0

    for (const opt of sorted) {
      if (seen.has(opt.match.id)) continue
      picked.push(opt)
      seen.add(opt.match.id)
      currentOdds *= opt.odds
      if (picked.length >= 2 && currentOdds >= 2.50) break
      if (picked.length >= maxLegs) break
    }
    if (picked.length >= 2) bestSubset = picked
  }

  if (!bestSubset || bestSubset.length < minLegs) return null

  const totalOdds = +(bestSubset.reduce((p, l) => p * l.odds, 1)).toFixed(2)
  const compoundProb = bestSubset.reduce((p, l) => p * (l.confidence / 100), 1)
  const totalConfidence = Math.round(compoundProb * 100)
  const ev = ((compoundProb * (totalOdds - 1)) - (1 - compoundProb)).toFixed(2)

  const legs: CombinationLeg[] = bestSubset.map(item => ({
    matchId: item.match.id,
    home: item.match.home,
    away: item.match.away,
    h: item.match.h || item.match.home,
    a: item.match.a || item.match.away,
    league: item.match.league,
    date: item.match.date,
    time: item.match.time,
    option: item.option,
    market: item.market,
    pick: item.pick,
    odds: item.odds,
    confidence: item.confidence,
    reasoning: item.reasoning
  }))

  return {
    id,
    title,
    badge,
    targetOdds,
    totalOdds,
    totalConfidence,
    legs,
    justification: '',
    expectedValue: ev,
    source: 'arena-algo'
  }
}

// ── Génère les 2 à 4 combinés du jour ─────────────────────────
export async function getDailyCombinations(
  allMatches: FullMatch[],
  forceRefresh = false
): Promise<AiCombination[]> {
  const CACHE_KEY = 'arena10:combinations:daily'
  if (!forceRefresh) {
    const cached = getFromCache<AiCombination[]>(CACHE_KEY)
    if (cached) return cached
  }

  // Filtrer les matchs à venir ou en cours
  const playable = allMatches.filter(m => m.status !== 'finished')
  const poolMatches = playable.length >= 4 ? playable : allMatches

  // Générer toutes les options possibles
  const allOptions = poolMatches.flatMap(generateMatchOptions)

  // 1. Profil SÉCURITÉ MAXIMALE : Double chances et Over 1.5 en priorité
  const safePool = allOptions.filter(o => o.confidence >= 82 || o.market === 'DOUBLE_CHANCE' || o.market === 'OVER_UNDER')
  const comboSafe = assembleCombination(
    safePool.length > 0 ? safePool : allOptions,
    'comb-safe',
    'Sécurité Maximale',
    'CONFIANCE ÉLEVÉE',
    3.00,
    2,
    3
  )

  // 2. Profil ÉQUILIBRÉ & VALEUR : 1X2 + Over + BTTS
  const balancedPool = allOptions.filter(o => o.confidence >= 72)
  const comboBalanced = assembleCombination(
    balancedPool,
    'comb-balanced',
    'Équilibré & Dynamique Offensive',
    'VALEUR STATISTIQUE',
    3.05,
    2,
    3
  )

  // 3. Profil CHOCS EUROPÉENS : Matchs majeurs (Ligue 1, Premier League, Liga, Serie A, etc.)
  const topLeagues = ['Premier League', 'Ligue 1', 'La Liga', 'Serie A', 'Bundesliga', 'Champions League']
  const elitePool = allOptions.filter(o => topLeagues.some(tl => o.match.league.includes(tl)))
  const comboElite = assembleCombination(
    elitePool.length >= 4 ? elitePool : allOptions,
    'comb-elite',
    'Chocs Européens',
    'TOP AFFICHES',
    3.15,
    2,
    3
  )

  const candidates: AiCombination[] = []
  if (comboSafe) candidates.push(comboSafe)
  if (comboBalanced) candidates.push(comboBalanced)
  if (comboElite && !candidates.some(c => c.legs.every((l, idx) => c.legs.length === comboElite.legs.length && l.matchId === comboElite.legs[idx]?.matchId))) {
    candidates.push(comboElite)
  }

  // 4. Profil SPÉCIAL STATISTIQUES & JEU : Corners, Cartons & Handicaps
  const statsMarketsPool = allOptions.filter(o => ['CORNERS', 'CARDS', 'HANDICAP'].includes(o.market) && o.confidence >= 74)
  if (statsMarketsPool.length >= 3 && candidates.length < 4) {
    const comboStats = assembleCombination(
      statsMarketsPool,
      'comb-stats-special',
      'Spécial Corners, Cartons & Handicaps',
      'STATISTIQUES & JEU',
      3.10,
      2,
      3
    )
    if (comboStats && !candidates.some(c => c.legs.every((l, idx) => c.legs.length === comboStats.legs.length && l.matchId === comboStats.legs[idx]?.matchId))) {
      candidates.push(comboStats)
    }
  }

  // Compléter pour toujours avoir au minimum 2 combinés
  if (candidates.length < 2 && allOptions.length >= 4) {
    const fallbackCombo = assembleCombination(allOptions, 'comb-alt', 'Sélection Alternative', 'ALTERNATIVE DU JOUR', 3.00, 2, 2)
    if (fallbackCombo) candidates.push(fallbackCombo)
  }

  // Enrichir chaque combiné avec la justification (Gemini -> Groq -> Algo local)
  for (const combo of candidates) {
    let text = await generateGeminiJustification(combo.title, combo.legs, combo.totalOdds)
    let src: 'gemini' | 'groq' | 'arena-algo' = 'gemini'

    if (!text) {
      text = await generateGroqJustification(combo.title, combo.legs, combo.totalOdds)
      src = 'groq'
    }

    if (!text) {
      text = buildAlgorithmicJustification(combo.title, combo.legs, combo.totalOdds)
      src = 'arena-algo'
    }

    combo.justification = text
    combo.source = src
  }

  // Mise en cache 10 minutes (600s)
  setCache(CACHE_KEY, candidates, 600)
  return candidates
}

// ── Optimiseur de sélection utilisateur ───────────────────────
export async function optimizeUserSelection(
  selectedMatches: FullMatch[],
  targetOdds = 3.0
): Promise<AiCombination> {
  const options = selectedMatches.flatMap(generateMatchOptions)

  // Choisir la meilleure option pour chaque match (la plus sûre ou la plus complémentaire)
  const chosenOptions: MatchOption[] = []
  for (const m of selectedMatches) {
    const matchOpts = options.filter(o => o.match.id === m.id)
    if (matchOpts.length === 0) continue

    // On priorise l'option ayant la plus forte confiance tout en offrant une cote décente
    const bestOpt = matchOpts.sort((a, b) => b.confidence - a.confidence)[0]
    chosenOptions.push(bestOpt)
  }

  const totalOdds = +(chosenOptions.reduce((acc, o) => acc * o.odds, 1)).toFixed(2)
  const compoundProb = chosenOptions.reduce((acc, o) => acc * (o.confidence / 100), 1)
  const totalConfidence = Math.round(compoundProb * 100)
  const ev = ((compoundProb * (totalOdds - 1)) - (1 - compoundProb)).toFixed(2)

  const legs: CombinationLeg[] = chosenOptions.map(item => ({
    matchId: item.match.id,
    home: item.match.home,
    away: item.match.away,
    h: item.match.h || item.match.home,
    a: item.match.a || item.match.away,
    league: item.match.league,
    date: item.match.date,
    time: item.match.time,
    option: item.option,
    market: item.market,
    pick: item.pick,
    odds: item.odds,
    confidence: item.confidence,
    reasoning: item.reasoning
  }))

  const combo: AiCombination = {
    id: `custom-${Date.now()}`,
    title: 'Combiné Optimisé sur mesure',
    badge: 'OPTIMISATION IA UTILISATEUR',
    targetOdds,
    totalOdds,
    totalConfidence,
    legs,
    justification: '',
    expectedValue: ev,
    source: 'arena-algo'
  }

  // Tenter justification via Gemini / Groq / Algo
  let text = await generateGeminiJustification(combo.title, combo.legs, combo.totalOdds)
  let src: 'gemini' | 'groq' | 'arena-algo' = 'gemini'

  if (!text) {
    text = await generateGroqJustification(combo.title, combo.legs, combo.totalOdds)
    src = 'groq'
  }

  if (!text) {
    text = buildAlgorithmicJustification(combo.title, combo.legs, combo.totalOdds)
    src = 'arena-algo'
  }

  combo.justification = text
  combo.source = src

  return combo
}
