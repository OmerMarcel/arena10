// ============================================================
// ARENA 10 — Utilitaires de formatage des équipes & Responsivité
// ============================================================

const SHORT_NAMES: Record<string, string> = {
  // Premier League
  'brighton & hove albion': 'Brighton',
  'brighton and hove albion': 'Brighton',
  'borussia mönchengladbach': "M'gladbach",
  'borussia monchengladbach': "M'gladbach",
  'nottingham forest': "Nott'm Forest",
  'wolverhampton wanderers': 'Wolves',
  'wolverhampton': 'Wolves',
  'tottenham hotspur': 'Tottenham',
  'manchester united': 'Man United',
  'manchester city': 'Man City',
  'coventry city': 'Coventry',
  'leeds united': 'Leeds',
  'hull city': 'Hull',
  'newcastle united': 'Newcastle',
  'ipswich town': 'Ipswich',
  'afc bournemouth': 'Bournemouth',
  'sheffield united': 'Sheffield Utd',
  'west bromwich albion': 'West Brom',
  'luton town': 'Luton',

  // Ligue 1
  'paris saint-germain': 'Paris SG',
  'olympique de marseille': 'Marseille',
  'olympique lyonnais': 'Lyon',
  'as monaco': 'Monaco',
  'stade brestois 29': 'Brest',
  'stade brestois': 'Brest',
  'stade rennais': 'Rennes',
  'stade de reims': 'Reims',
  'as saint-étienne': 'Saint-Étienne',
  'as saint-etienne': 'Saint-Étienne',

  // LaLiga
  'atlético de madrid': 'Atlético',
  'atletico de madrid': 'Atlético',
  'atlético madrid': 'Atlético',
  'atletico madrid': 'Atlético',
  'athletic club': 'Athletic',
  'deportivo alavés': 'Alavés',
  'deportivo alaves': 'Alavés',
  'celta de vigo': 'Celta Vigo',
  'rayo vallecano': 'Rayo',
  'real betis': 'Betis',
  'real sociedad': 'R. Sociedad',

  // Bundesliga
  'bayer 04 leverkusen': 'Leverkusen',
  'bayer leverkusen': 'Leverkusen',
  'borussia dortmund': 'Dortmund',
  'eintracht frankfurt': 'Frankfurt',
  'rb leipzig': 'Leipzig',
  'vfb stuttgart': 'Stuttgart',
  'tsg hoffenheim': 'Hoffenheim',
  'werder bremen': 'Bremen',
  'fc augsburg': 'Augsburg',
  'hamburg sv': 'Hamburg',

  // Serie A
  'internazionale': 'Inter',
  'inter milan': 'Inter',
  'ac milan': 'Milan',
  'hellas verona': 'Verona',

  // Europe
  'ferencvárosi tc': 'Ferencváros',
  'ferencvaros': 'Ferencváros',
  'red bull salzburg': 'Salzburg',
  'rb salzburg': 'Salzburg',
  'sporting cp': 'Sporting',
  'sporting lisbon': 'Sporting',
}

/**
 * Raccourcit les noms d'équipes trop longs pour éviter les cassures de layout sur mobile
 * @param name  Nom complet de l'équipe (ex: "Brighton & Hove Albion")
 * @param maxLen Longueur maximale acceptée
 */
export function formatTeamName(name: string, maxLen = 14): string {
  if (!name) return ''
  const clean = name.trim()
  const lower = clean.toLowerCase()

  if (SHORT_NAMES[lower]) return SHORT_NAMES[lower]

  // Normaliser sans accents
  const norm = lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (SHORT_NAMES[norm]) return SHORT_NAMES[norm]

  // Remplacement de suffixes/préfixes fréquents
  let simplified = clean
    .replace(/^AFC\s+/i, '')
    .replace(/\s+FC$/i, '')
    .replace(/^FC\s+/i, '')
    .replace(/\s+City$/i, '')
    .replace(/\s+United$/i, ' Utd')
    .trim()

  if (SHORT_NAMES[simplified.toLowerCase()]) {
    return SHORT_NAMES[simplified.toLowerCase()]
  }

  if (simplified.length > maxLen) {
    const parts = simplified.split(' ')
    if (parts.length > 1 && parts[0].length <= maxLen) {
      return parts[0]
    }
    return simplified.slice(0, maxLen - 1) + '…'
  }

  return simplified
}

