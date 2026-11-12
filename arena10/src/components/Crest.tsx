// ============================================================
// ARENA 10 — Composant Crest (Logos officiels des clubs de football)
// ============================================================

import React, { useState } from 'react'
import rawLogos from '../teamLogos.json'

const logosMap: Record<string, string> = rawLogos as Record<string, string>

// ── COULEURS DES CLUBS POUR ACCENTS ET BORDURES ───────────────
const CLUB_COLORS: Record<string, string> = {
  ARS: '#d92332', CHE: '#174b8b', LIV: '#b91c2b', MCI: '#6bb8d8', MNC: '#6bb8d8',
  RMA: '#d8b95b', SEV: '#d92d39', BAR: '#a71930', VAL: '#e7a52b',
  INT: '#1d3d81', JUV: '#111111', BAY: '#d62836', BVB: '#e5c52e',
  PSG: '#183b7a', OM:  '#55a9c9', ASM: '#d9263d', OL:  '#d52b38',
  ATL: '#cb2f38', VIL: '#f1d337', TOT: '#1f1f1f', MUN: '#d41b2c',
  LEV: '#e53030', LEI: '#1b4f92', MIL: '#ac1a2a', NAP: '#007fb0',
  EVE: '#003399', COV: '#4cb5e6', LEE: '#ffcd00', HUL: '#f59a23',
  NEW: '#241f20', FUL: '#ffffff', NFO: '#dd0000', BHA: '#0057b8',
  BRE: '#e30613', CRY: '#1b458f', IPS: '#004494', BOU: '#da291c',
  SUN: '#eb172b', AVL: '#670e36', TOU: '#572b84', STR: '#009fe3',
  HSV: '#005ca9', BMG: '#000000', ALA: '#0055a5', VEN: '#ff7700',
  UDI: '#000000', ASR: '#8e1f2f', LAZ: '#87d8f7',
}

// ── ALIASES POUR CODES COURTS & NOMS EN FRANÇAIS ─────────────
const LOGO_ALIASES: Record<string, string> = {
  MCI: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
  BAY: 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
  BVB: 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
  OM:  'https://a.espncdn.com/i/teamlogos/soccer/500/176.png',
  ASM: 'https://a.espncdn.com/i/teamlogos/soccer/500/174.png',
  OL:  'https://a.espncdn.com/i/teamlogos/soccer/500/167.png',
  ATL: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',
  LEI: 'https://a.espncdn.com/i/teamlogos/soccer/500/11420.png',
  RMA: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
  BAR: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
  PSG: 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
  ARS: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
  CHE: 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png',
  LIV: 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png',
  MUN: 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
  TOT: 'https://a.espncdn.com/i/teamlogos/soccer/500/367.png',
  INT: 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
  JUV: 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png',
  MIL: 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
  NAP: 'https://a.espncdn.com/i/teamlogos/soccer/500/114.png',
  SEV: 'https://a.espncdn.com/i/teamlogos/soccer/500/243.png',
  VAL: 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png',
  VIL: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png',
  LEV: 'https://a.espncdn.com/i/teamlogos/soccer/500/131.png',
  // ── CLUBS COUPE D'EUROPE (CHAMPIONS LEAGUE & EUROPA LEAGUE) ──
  PORTO: 'https://a.espncdn.com/i/teamlogos/soccer/500/437.png',
  'FC PORTO': 'https://a.espncdn.com/i/teamlogos/soccer/500/437.png',
  BENFICA: 'https://a.espncdn.com/i/teamlogos/soccer/500/438.png',
  SPORTING: 'https://a.espncdn.com/i/teamlogos/soccer/500/439.png',
  'SPORTING CP': 'https://a.espncdn.com/i/teamlogos/soccer/500/439.png',
  FENERBAHCE: 'https://a.espncdn.com/i/teamlogos/soccer/500/440.png',
  GALATASARAY: 'https://a.espncdn.com/i/teamlogos/soccer/500/432.png',
  BESIKTAS: 'https://a.espncdn.com/i/teamlogos/soccer/500/443.png',
  PSV: 'https://a.espncdn.com/i/teamlogos/soccer/500/148.png',
  'PSV EINDHOVEN': 'https://a.espncdn.com/i/teamlogos/soccer/500/148.png',
  FEYENOORD: 'https://a.espncdn.com/i/teamlogos/soccer/500/140.png',
  AJAX: 'https://a.espncdn.com/i/teamlogos/soccer/500/139.png',
  'AJAX AMSTERDAM': 'https://a.espncdn.com/i/teamlogos/soccer/500/139.png',
  BRUGGE: 'https://a.espncdn.com/i/teamlogos/soccer/500/490.png',
  'CLUB BRUGGE': 'https://a.espncdn.com/i/teamlogos/soccer/500/490.png',
  ANDERLECHT: 'https://a.espncdn.com/i/teamlogos/soccer/500/436.png',
  CELTIC: 'https://a.espncdn.com/i/teamlogos/soccer/500/314.png',
  RANGERS: 'https://a.espncdn.com/i/teamlogos/soccer/500/315.png',
  ATALANTA: 'https://a.espncdn.com/i/teamlogos/soccer/500/107.png',
  ROMA: 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png',
  'AS ROMA': 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png',
  LAZIO: 'https://a.espncdn.com/i/teamlogos/soccer/500/112.png',
  BETIS: 'https://a.espncdn.com/i/teamlogos/soccer/500/244.png',
  'REAL BETIS': 'https://a.espncdn.com/i/teamlogos/soccer/500/244.png',
  SOCIEDAD: 'https://a.espncdn.com/i/teamlogos/soccer/500/89.png',
  'REAL SOCIEDAD': 'https://a.espncdn.com/i/teamlogos/soccer/500/89.png',
  BILBAO: 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png',
  'ATHLETIC BILBAO': 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png',
  'AEK ATHENS': 'https://a.espncdn.com/i/teamlogos/soccer/500/292.png',
  AEK: 'https://a.espncdn.com/i/teamlogos/soccer/500/292.png',
  OLYMPIACOS: 'https://a.espncdn.com/i/teamlogos/soccer/500/435.png',
  'SLAVIA PRAGUE': 'https://a.espncdn.com/i/teamlogos/soccer/500/487.png',
  'SPARTA PRAGUE': 'https://a.espncdn.com/i/teamlogos/soccer/500/488.png',
  SALZBURG: 'https://a.espncdn.com/i/teamlogos/soccer/500/1739.png',
  'RB SALZBURG': 'https://a.espncdn.com/i/teamlogos/soccer/500/1739.png',
  HOFFENHEIM: 'https://a.espncdn.com/i/teamlogos/soccer/500/7911.png',
  'TSG HOFFENHEIM': 'https://a.espncdn.com/i/teamlogos/soccer/500/7911.png',
  FRANKFURT: 'https://a.espncdn.com/i/teamlogos/soccer/500/125.png',
  'EINTRACHT FRANKFURT': 'https://a.espncdn.com/i/teamlogos/soccer/500/125.png',
  NICE: 'https://a.espncdn.com/i/teamlogos/soccer/500/237.png',
  'OGC NICE': 'https://a.espncdn.com/i/teamlogos/soccer/500/237.png',
  BREST: 'https://a.espncdn.com/i/teamlogos/soccer/500/6836.png',
  'STADE BRESTOIS': 'https://a.espncdn.com/i/teamlogos/soccer/500/6836.png',
  LENS: 'https://a.espncdn.com/i/teamlogos/soccer/500/171.png',
  'RC LENS': 'https://a.espncdn.com/i/teamlogos/soccer/500/171.png',
  LILLE: 'https://a.espncdn.com/i/teamlogos/soccer/500/166.png',
  LOSC: 'https://a.espncdn.com/i/teamlogos/soccer/500/166.png',
  MONACO: 'https://a.espncdn.com/i/teamlogos/soccer/500/174.png',
  COMO: 'https://a.espncdn.com/i/teamlogos/soccer/500/2665.png',
  FERENCVAROS: 'https://a.espncdn.com/i/teamlogos/soccer/500/2388.png',
  BRAGA: 'https://a.espncdn.com/i/teamlogos/soccer/500/3817.png',
  MIDTJYLLAND: 'https://a.espncdn.com/i/teamlogos/soccer/500/3180.png',
  'BODO/GLIMT': 'https://a.espncdn.com/i/teamlogos/soccer/500/6064.png',
  'MACCABI TEL AVIV': 'https://a.espncdn.com/i/teamlogos/soccer/500/448.png',
  TWENTE: 'https://a.espncdn.com/i/teamlogos/soccer/500/137.png',
  'FC TWENTE': 'https://a.espncdn.com/i/teamlogos/soccer/500/137.png',
  MALMO: 'https://a.espncdn.com/i/teamlogos/soccer/500/343.png',
  'MALMO FF': 'https://a.espncdn.com/i/teamlogos/soccer/500/343.png',
  PLZEN: 'https://a.espncdn.com/i/teamlogos/soccer/500/3860.png',
  'VIKTORIA PLZEN': 'https://a.espncdn.com/i/teamlogos/soccer/500/3860.png',
  // ── SÉLECTIONS NATIONALES UEFA NATIONS LEAGUE ──
  FRA: 'https://a.espncdn.com/i/teamlogos/countries/500/fra.png',
  FRANCE: 'https://a.espncdn.com/i/teamlogos/countries/500/fra.png',
  ITA: 'https://a.espncdn.com/i/teamlogos/countries/500/ita.png',
  ITALIE: 'https://a.espncdn.com/i/teamlogos/countries/500/ita.png',
  ITALY: 'https://a.espncdn.com/i/teamlogos/countries/500/ita.png',
  ESP: 'https://a.espncdn.com/i/teamlogos/countries/500/esp.png',
  ESPAGNE: 'https://a.espncdn.com/i/teamlogos/countries/500/esp.png',
  SPAIN: 'https://a.espncdn.com/i/teamlogos/countries/500/esp.png',
  ENG: 'https://a.espncdn.com/i/teamlogos/countries/500/eng.png',
  ANGLETERRE: 'https://a.espncdn.com/i/teamlogos/countries/500/eng.png',
  ENGLAND: 'https://a.espncdn.com/i/teamlogos/countries/500/eng.png',
  GER: 'https://a.espncdn.com/i/teamlogos/countries/500/ger.png',
  ALLEMAGNE: 'https://a.espncdn.com/i/teamlogos/countries/500/ger.png',
  GERMANY: 'https://a.espncdn.com/i/teamlogos/countries/500/ger.png',
  BEL: 'https://a.espncdn.com/i/teamlogos/countries/500/bel.png',
  BELGIQUE: 'https://a.espncdn.com/i/teamlogos/countries/500/bel.png',
  BELGIUM: 'https://a.espncdn.com/i/teamlogos/countries/500/bel.png',
  POR: 'https://a.espncdn.com/i/teamlogos/countries/500/por.png',
  PORTUGAL: 'https://a.espncdn.com/i/teamlogos/countries/500/por.png',
  NED: 'https://a.espncdn.com/i/teamlogos/countries/500/ned.png',
  'PAYS-BAS': 'https://a.espncdn.com/i/teamlogos/countries/500/ned.png',
  NETHERLANDS: 'https://a.espncdn.com/i/teamlogos/countries/500/ned.png',
  CRO: 'https://a.espncdn.com/i/teamlogos/countries/500/cro.png',
  CROATIE: 'https://a.espncdn.com/i/teamlogos/countries/500/cro.png',
  CROATIA: 'https://a.espncdn.com/i/teamlogos/countries/500/cro.png',
  DEN: 'https://a.espncdn.com/i/teamlogos/countries/500/den.png',
  DANEMARK: 'https://a.espncdn.com/i/teamlogos/countries/500/den.png',
  DENMARK: 'https://a.espncdn.com/i/teamlogos/countries/500/den.png',
  SUI: 'https://a.espncdn.com/i/teamlogos/countries/500/sui.png',
  SUISSE: 'https://a.espncdn.com/i/teamlogos/countries/500/sui.png',
  SWITZERLAND: 'https://a.espncdn.com/i/teamlogos/countries/500/sui.png',
  POL: 'https://a.espncdn.com/i/teamlogos/countries/500/pol.png',
  POLOGNE: 'https://a.espncdn.com/i/teamlogos/countries/500/pol.png',
  POLAND: 'https://a.espncdn.com/i/teamlogos/countries/500/pol.png',
  TUR: 'https://a.espncdn.com/i/teamlogos/countries/500/tur.png',
  TURQUIE: 'https://a.espncdn.com/i/teamlogos/countries/500/tur.png',
  TÜRKIYE: 'https://a.espncdn.com/i/teamlogos/countries/500/tur.png',
  CZE: 'https://a.espncdn.com/i/teamlogos/countries/500/cze.png',
  'RÉP. TCHÈQUE': 'https://a.espncdn.com/i/teamlogos/countries/500/cze.png',
  CZECHIA: 'https://a.espncdn.com/i/teamlogos/countries/500/cze.png',
  AUT: 'https://a.espncdn.com/i/teamlogos/countries/500/aut.png',
  AUTRICHE: 'https://a.espncdn.com/i/teamlogos/countries/500/aut.png',
  AUSTRIA: 'https://a.espncdn.com/i/teamlogos/countries/500/aut.png',
  SRB: 'https://a.espncdn.com/i/teamlogos/countries/500/srb.png',
  SERBIE: 'https://a.espncdn.com/i/teamlogos/countries/500/srb.png',
  SERBIA: 'https://a.espncdn.com/i/teamlogos/countries/500/srb.png',
  NOR: 'https://a.espncdn.com/i/teamlogos/countries/500/nor.png',
  NORVÈGE: 'https://a.espncdn.com/i/teamlogos/countries/500/nor.png',
  NORWAY: 'https://a.espncdn.com/i/teamlogos/countries/500/nor.png',
  SWE: 'https://a.espncdn.com/i/teamlogos/countries/500/swe.png',
  SUÈDE: 'https://a.espncdn.com/i/teamlogos/countries/500/swe.png',
  SWEDEN: 'https://a.espncdn.com/i/teamlogos/countries/500/swe.png',
  SCO: 'https://a.espncdn.com/i/teamlogos/countries/500/sco.png',
  ÉCOSSE: 'https://a.espncdn.com/i/teamlogos/countries/500/sco.png',
  SCOTLAND: 'https://a.espncdn.com/i/teamlogos/countries/500/sco.png',
  WAL: 'https://a.espncdn.com/i/teamlogos/countries/500/wal.png',
  'PAYS DE GALLES': 'https://a.espncdn.com/i/teamlogos/countries/500/wal.png',
  WALES: 'https://a.espncdn.com/i/teamlogos/countries/500/wal.png',
  UKR: 'https://a.espncdn.com/i/teamlogos/countries/500/ukr.png',
  UKRAINE: 'https://a.espncdn.com/i/teamlogos/countries/500/ukr.png',
  GRE: 'https://a.espncdn.com/i/teamlogos/countries/500/gre.png',
  GRÈCE: 'https://a.espncdn.com/i/teamlogos/countries/500/gre.png',
  GREECE: 'https://a.espncdn.com/i/teamlogos/countries/500/gre.png',
  HUN: 'https://a.espncdn.com/i/teamlogos/countries/500/hun.png',
  HONGRIE: 'https://a.espncdn.com/i/teamlogos/countries/500/hun.png',
  HUNGARY: 'https://a.espncdn.com/i/teamlogos/countries/500/hun.png',
  ROU: 'https://a.espncdn.com/i/teamlogos/countries/500/rou.png',
  ROUMANIE: 'https://a.espncdn.com/i/teamlogos/countries/500/rou.png',
  ROMANIA: 'https://a.espncdn.com/i/teamlogos/countries/500/rou.png',
  ALB: 'https://a.espncdn.com/i/teamlogos/countries/500/alb.png',
  ALBANIE: 'https://a.espncdn.com/i/teamlogos/countries/500/alb.png',
  ALBANIA: 'https://a.espncdn.com/i/teamlogos/countries/500/alb.png',
  FIN: 'https://a.espncdn.com/i/teamlogos/countries/500/fin.png',
  FINLANDE: 'https://a.espncdn.com/i/teamlogos/countries/500/fin.png',
  FINLAND: 'https://a.espncdn.com/i/teamlogos/countries/500/fin.png',
  IRL: 'https://a.espncdn.com/i/teamlogos/countries/500/irl.png',
  IRLANDE: 'https://a.espncdn.com/i/teamlogos/countries/500/irl.png',
  IRELAND: 'https://a.espncdn.com/i/teamlogos/countries/500/irl.png',
  SVK: 'https://a.espncdn.com/i/teamlogos/countries/500/svk.png',
  SLOVAQUIE: 'https://a.espncdn.com/i/teamlogos/countries/500/svk.png',
  SLOVAKIA: 'https://a.espncdn.com/i/teamlogos/countries/500/svk.png',
  SVN: 'https://a.espncdn.com/i/teamlogos/countries/500/svn.png',
  SLOVÉNIE: 'https://a.espncdn.com/i/teamlogos/countries/500/svn.png',
  SLOVENIA: 'https://a.espncdn.com/i/teamlogos/countries/500/svn.png',
  ISR: 'https://a.espncdn.com/i/teamlogos/countries/500/isr.png',
  ISRAËL: 'https://a.espncdn.com/i/teamlogos/countries/500/isr.png',
  ISRAEL: 'https://a.espncdn.com/i/teamlogos/countries/500/isr.png',
  GEO: 'https://a.espncdn.com/i/teamlogos/countries/500/geo.png',
  GÉORGIE: 'https://a.espncdn.com/i/teamlogos/countries/500/geo.png',
  GEORGIA: 'https://a.espncdn.com/i/teamlogos/countries/500/geo.png',
  BIH: 'https://a.espncdn.com/i/teamlogos/countries/500/bih.png',
  BOSNIE: 'https://a.espncdn.com/i/teamlogos/countries/500/bih.png',
  ISL: 'https://a.espncdn.com/i/teamlogos/countries/500/isl.png',
  ISLANDE: 'https://a.espncdn.com/i/teamlogos/countries/500/isl.png',
  ICELAND: 'https://a.espncdn.com/i/teamlogos/countries/500/isl.png',
  BUL: 'https://a.espncdn.com/i/teamlogos/countries/500/bul.png',
  BULGARIE: 'https://a.espncdn.com/i/teamlogos/countries/500/bul.png',
  BULGARIA: 'https://a.espncdn.com/i/teamlogos/countries/500/bul.png',
  ARM: 'https://a.espncdn.com/i/teamlogos/countries/500/fifa.armenia.png',
  ARMÉNIE: 'https://a.espncdn.com/i/teamlogos/countries/500/fifa.armenia.png',
  ARMENIA: 'https://a.espncdn.com/i/teamlogos/countries/500/fifa.armenia.png',
  CYP: 'https://a.espncdn.com/i/teamlogos/countries/500/cyp.png',
  CHYPRE: 'https://a.espncdn.com/i/teamlogos/countries/500/cyp.png',
  CYPRUS: 'https://a.espncdn.com/i/teamlogos/countries/500/cyp.png',
  MNE: 'https://a.espncdn.com/i/teamlogos/countries/500/mne.png',
  MONTÉNÉGRO: 'https://a.espncdn.com/i/teamlogos/countries/500/mne.png',
  MONTENEGRO: 'https://a.espncdn.com/i/teamlogos/countries/500/mne.png',
  KOS: 'https://a.espncdn.com/i/teamlogos/countries/500/kos.png',
  KOSOVO: 'https://a.espncdn.com/i/teamlogos/countries/500/kos.png',
  KAZ: 'https://a.espncdn.com/i/teamlogos/countries/500/kaz.png',
  KAZAKHSTAN: 'https://a.espncdn.com/i/teamlogos/countries/500/kaz.png',
  LUX: 'https://a.espncdn.com/i/teamlogos/countries/500/lux.png',
  LUXEMBOURG: 'https://a.espncdn.com/i/teamlogos/countries/500/lux.png',
}

export function getClubLogoUrl(identifier: string): string | null {
  if (!identifier) return null

  const keyUpper = identifier.toUpperCase().trim()
  if (LOGO_ALIASES[keyUpper]) return LOGO_ALIASES[keyUpper]
  if (logosMap[keyUpper]) return logosMap[keyUpper]

  const keyLower = identifier.toLowerCase().trim()
  if (logosMap[keyLower]) return logosMap[keyLower]

  // Normalisation sans accents (ex: "alavés" -> "alaves")
  const norm = keyLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (logosMap[norm]) return logosMap[norm]

  // Recherche partielle dans le dictionnaire
  for (const [k, url] of Object.entries(logosMap)) {
    if (k.length > 2 && (norm.includes(k) || k.includes(norm))) {
      return url
    }
  }

  return null
}

export interface CrestProps {
  name: string
  size?: number
  className?: string
  style?: React.CSSProperties
  showBorder?: boolean
  noCircle?: boolean
}

export function Crest({ name, size = 30, className = '', style = {}, showBorder = true, noCircle = false }: CrestProps) {
  const [hasError, setHasError] = useState(false)
  const logoUrl = getClubLogoUrl(name)

  const upperKey = (name || '').toUpperCase().slice(0, 3)
  const clubColor = CLUB_COLORS[upperKey] || '#66758b'

  const pad = Math.max(2, Math.round(size * 0.12))

  const containerStyle: React.CSSProperties = noCircle
    ? {
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        borderRadius: 0,
        padding: 0,
        overflow: 'visible',
        position: 'relative',
        ...style,
      }
    : {
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: 'radial-gradient(circle at 35% 35%, #18283e 0%, #0d1726 100%)',
        border: showBorder ? '1.5px solid rgba(255, 255, 255, 0.42)' : 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        position: 'relative',
        padding: pad,
        boxSizing: 'border-box',
        ...style,
      }

  if (logoUrl && !hasError) {
    return (
      <div className={`crest crest-with-logo${noCircle ? ' crest-no-circle' : ''} ${className}`} style={containerStyle} title={name}>
        <img
          src={logoUrl}
          alt={name}
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: noCircle
              ? 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.65))'
              : 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.6))',
          }}
          loading="lazy"
        />
      </div>
    )
  }

  // Fallback avec initiales et couleur officielle du club
  return (
    <div
      className={`crest crest-fallback${noCircle ? ' crest-no-circle' : ''} ${className}`}
      style={{
        ...containerStyle,
        background: noCircle ? `${clubColor}22` : `radial-gradient(circle at 35% 35%, ${clubColor}33 0%, #0d1726 100%)`,
        border: noCircle ? `1px solid ${clubColor}55` : (showBorder ? '1.5px solid rgba(255, 255, 255, 0.35)' : 'none'),
        borderRadius: noCircle ? 4 : '50%',
        color: '#ffffff',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800,
        fontSize: Math.max(8, Math.floor(size * 0.38)),
        letterSpacing: 0.5,
      }}
      title={name}
    >
      {upperKey}
    </div>
  )
}

export default Crest

