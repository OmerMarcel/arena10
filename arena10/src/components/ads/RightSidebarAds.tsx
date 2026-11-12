// ============================================================
// ARENA 10 — Colonne Publicitaire & Affiliation Latérale Droite
// Style officiel inspiré de Sofascore & Flashscore (1xBet, Bet365, etc.)
// ============================================================

import React, { useState } from 'react'
import { AFFILIATE_PARTNERS } from '../../config/affiliates'
import { ArrowSquareOut, Lightning, ShieldCheck, Copy, Check, Star } from '@phosphor-icons/react'

export function RightSidebarAds() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const p1 = AFFILIATE_PARTNERS['1xbet']
  const p2 = AFFILIATE_PARTNERS['bet365']

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  return (
    <aside className="right-ad-rail" aria-label="Partenaires & Offres de paris">
      {/* ══ 1. BANNIÈRE PRINCIPALE 1XBET (Style Sofascore) ══ */}
      <div className="ad-card ad-card-primary">
        <div className="ad-meta-header">
          <span className="ad-badge">PUBLICITÉ</span>
          <span className="ad-age-pill">18+</span>
        </div>

        <div className="ad-brand-row">
          <div className="ad-brand-title">
            <span className="ad-brand-name">{p1.name}</span>
            <small className="ad-brand-sub">PARTENAIRE OFFICIEL</small>
          </div>
          <div className="ad-rating">
            <Star size={13} weight="fill" color="#eab308" />
            <span>{p1.rating}</span>
          </div>
        </div>

        <div className="ad-visual-block ad-visual-1xbet">
          <div className="ad-tagline">{p1.tagline}</div>
          <div className="ad-offer-badge">
            <Lightning size={14} weight="fill" />
            <span>OFFRE EXCLUSIVE ARENA 10</span>
          </div>
          <h4 className="ad-offer-text">{p1.bonusText}</h4>
        </div>

        <div className="ad-promo-box">
          <div className="ad-promo-label">Code Promo exclusif :</div>
          <div className="ad-promo-code-row">
            <span className="ad-code-value">{p1.promoCode}</span>
            <button
              type="button"
              className="ad-copy-btn"
              onClick={() => copyCode(p1.promoCode)}
              title="Copier le code"
            >
              {copiedCode === p1.promoCode ? (
                <>
                  <Check size={13} color="#22c55e" weight="bold" />
                  <span style={{ color: '#22c55e' }}>Copié !</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>
        </div>

        <a
          href={p1.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="ad-cta-btn ad-cta-1xbet"
        >
          <span>Profiter de l'offre</span>
          <ArrowSquareOut size={16} weight="bold" />
        </a>

        <div className="ad-terms">
          *Réservé aux nouveaux inscrits. Dépôt min. 1 €. Voir conditions sur le site partenaire.
        </div>
      </div>

      {/* ══ 2. BANNIÈRE SECONDAIRE BET365 (Style Flashscore Skyscraper) ══ */}
      <div className="ad-card ad-card-bet365">
        <div className="ad-meta-header">
          <span className="ad-badge">PUBLICITÉ</span>
          <span className="ad-badge-live">COTES BOOSTÉES</span>
        </div>

        <div className="ad-bet365-header">
          <div className="ad-bet365-logo">
            <b style={{ color: '#ffffff', fontSize: 20, letterSpacing: -0.5 }}>bet</b>
            <span style={{ color: '#ffdf1b', fontSize: 20, fontWeight: 800 }}>365</span>
          </div>
          <span className="ad-bet365-tag">NEVER ORDINARY</span>
        </div>

        <div className="ad-bet365-body">
          <p className="ad-bet365-headline">
            {p2.bonusText}
          </p>
          <div className="ad-bet365-features">
            <div className="ad-feature-item">
              <ShieldCheck size={14} weight="fill" color="#ffdf1b" />
              <span>Streaming HD de plus de 100 000 événements</span>
            </div>
            <div className="ad-feature-item">
              <ShieldCheck size={14} weight="fill" color="#ffdf1b" />
              <span>Paiement anticipé si votre équipe a 2 buts d'avance</span>
            </div>
          </div>
        </div>

        <a
          href={p2.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="ad-cta-btn ad-cta-bet365"
        >
          <span>Parier sur bet365</span>
          <ArrowSquareOut size={16} weight="bold" />
        </a>
      </div>

      {/* ══ 3. MENTION LÉGALE JEU RESPONSABLE (Conformité Sofascore) ══ */}
      <div className="ad-legal-card">
        <div className="ad-legal-title">
          <span>JOUER COMPORTE DES RISQUES</span>
        </div>
        <p className="ad-legal-text">
          Endettement, dépendance, isolement. Appelez le <strong>09 74 75 13 13</strong> (appel non surtaxé). Interdit aux mineurs de moins de 18 ans.
        </p>
      </div>
    </aside>
  )
}

