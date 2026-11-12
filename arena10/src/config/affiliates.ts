// ============================================================
// ARENA 10 — Configuration des Liens d'Affiliation & Régies Publicitaires
// Remplacez les liens par vos propres identifiants partenaires / trackers
// ============================================================

export interface AffiliatePartner {
  id: string
  name: string
  logo: string
  bonusText: string
  promoCode: string
  rating: number
  affiliateUrl: string
  color: string
  tagline: string
}

export const AFFILIATE_PARTNERS: Record<string, AffiliatePartner> = {
  '1xbet': {
    id: '1xbet',
    name: '1xBet',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/1xBet_Logo.svg',
    bonusText: '100% jusqu\'à 130 € sur votre 1er dépôt',
    promoCode: 'ARENA10',
    rating: 4.8,
    // Remplacez cette URL par votre lien d'affilié obtenu sur 1xpartners.com
    affiliateUrl: 'https://1xbet.com/?tag=ARENA10',
    color: '#1a569b',
    tagline: 'Leader mondial des paris sportifs & streaming live',
  },
  'bet365': {
    id: 'bet365',
    name: 'bet365',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Bet365_Logo.svg',
    bonusText: 'Jusqu\'à 100 € de crédits de pari offerts',
    promoCode: 'ARENA365',
    rating: 4.9,
    // Remplacez cette URL par votre lien d'affilié obtenu sur bet365affiliates.com
    affiliateUrl: 'https://bet365.com/?affiliate=ARENA10',
    color: '#007354',
    tagline: 'Never Ordinary · Cotes boostées & diffusion HD',
  },
  'unibet': {
    id: 'unibet',
    name: 'Unibet',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Unibet_2019_logo.svg',
    bonusText: '100 € remboursés en freebets sur votre 1er pari',
    promoCode: 'ARENAUNI',
    rating: 4.7,
    affiliateUrl: 'https://unibet.com/?affiliate=ARENA10',
    color: '#0e7039',
    tagline: 'Pariez en direct avec les meilleures cotes football',
  },
  'betclic': {
    id: 'betclic',
    name: 'Betclic',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Betclic_2019_logo.svg',
    bonusText: '100 € de bonus de bienvenue immédiat',
    promoCode: 'ARENACLIC',
    rating: 4.7,
    affiliateUrl: 'https://betclic.com/?affiliate=ARENA10',
    color: '#e21b22',
    tagline: 'Retraits instantanés & paris sur 40+ sports',
  },
}

