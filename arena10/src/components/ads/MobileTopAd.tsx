// ============================================================
// ARENA 10 — Bandeau Publicitaire Mobile Supérieur (Top Sponsor)
// Style compact inspiré de Flashscore & Sofascore Mobile
// ============================================================

import React, { useState } from 'react'
import { AFFILIATE_PARTNERS } from '../../config/affiliates'
import { Lightning, ArrowSquareOut, X } from '@phosphor-icons/react'

export function MobileTopAd() {
  const [closed, setClosed] = useState(false)
  const p1 = AFFILIATE_PARTNERS['1xbet']

  if (closed) return null

  return (
    <div className="mobile-top-ad-banner" role="banner" aria-label="Offre partenaire mobile">
      <div className="mobile-ad-left">
        <span className="mobile-ad-tag">PUB 18+</span>
        <div className="mobile-ad-brand">
          <b>{p1.name}</b>
          <span className="mobile-ad-bonus">
            <Lightning size={12} weight="fill" color="#38bdf8" />
            Bonus 130 €
          </span>
        </div>
        <div className="mobile-ad-code">
          Code : <strong>{p1.promoCode}</strong>
        </div>
      </div>

      <div className="mobile-ad-right">
        <a
          href={p1.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mobile-ad-cta"
        >
          <span>Parier</span>
          <ArrowSquareOut size={13} weight="bold" />
        </a>
        <button
          type="button"
          className="mobile-ad-close"
          onClick={() => setClosed(true)}
          aria-label="Fermer la publicité"
          title="Fermer"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}

