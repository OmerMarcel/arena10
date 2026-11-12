// ============================================================
// ARENA 10 — Icônes SVG sport personnalisées (style Sofascore/Flashscore)
// Inline SVGs football-specific pour une identité visuelle pro
// ============================================================

import React from 'react'

interface IconProps {
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

/** Ballon de football (style Sofascore) */
export function FootballIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
      <polygon points="12,5 14.5,8 13,11 11,11 9.5,8" fill={color} opacity="0.9" />
      <polygon points="6,10 8.5,8.5 9.5,11 7.5,13.5 5,12.5" fill={color} opacity="0.7" />
      <polygon points="18,10 15.5,8.5 14.5,11 16.5,13.5 19,12.5" fill={color} opacity="0.7" />
      <polygon points="8,18 9.5,15.5 11,16 11,19" fill={color} opacity="0.8" />
      <polygon points="16,18 14.5,15.5 13,16 13,19" fill={color} opacity="0.8" />
      <polygon points="7.5,13.5 9.5,13 11,16 9.5,15.5" fill={color} opacity="0.6" />
      <polygon points="16.5,13.5 14.5,13 13,16 14.5,15.5" fill={color} opacity="0.6" />
    </svg>
  )
}

/** Trophée (style Sofascore) */
export function TrophyIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <path d="M6 2h12v8a6 6 0 01-12 0V2z" fill={color} opacity="0.9" />
      <path d="M6 5H3a2 2 0 002 2h1" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M18 5h3a2 2 0 01-2 2h-1" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M12 16v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <rect x="8" y="20" width="8" height="2" rx="1" fill={color} />
    </svg>
  )
}

/** Stade (silhouette) */
export function StadiumIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <ellipse cx="12" cy="10" rx="10" ry="5" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M2 10v6c0 2.76 4.48 5 10 5s10-2.24 10-5v-6" stroke={color} strokeWidth="1.5" fill="none" />
      <ellipse cx="12" cy="10" rx="5" ry="2.5" fill={color} opacity="0.3" />
      <line x1="12" y1="7.5" x2="12" y2="12.5" stroke={color} strokeWidth="1" />
      <line x1="7" y1="10" x2="17" y2="10" stroke={color} strokeWidth="1" />
    </svg>
  )
}

/** Maillot football */
export function JerseyIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} style={style} aria-hidden="true">
      <path d="M9 2C9 2 8 4 6 4L2 6l2 5 3-1v10h10V10l3 1 2-5-4-2c-2 0-3-2-3-2a3 3 0 01-6 0z" opacity="0.9" />
    </svg>
  )
}

/** Indicateur LIVE animé (point pulsant) */
export function LiveDotIcon({ size = 8, color = '#ef4444', className, style }: IconProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 0 0 ${color}`,
        animation: 'livePulse 1.4s ease-in-out infinite',
        ...style,
      }}
      aria-label="En direct"
    />
  )
}

/** Carte rouge */
export function RedCardIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 14 18" fill="none" className={className} style={style} aria-hidden="true">
      <rect x="1" y="1" width="12" height="16" rx="2" fill="#dc2626" />
    </svg>
  )
}

/** Carte jaune */
export function YellowCardIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 14 18" fill="none" className={className} style={style} aria-hidden="true">
      <rect x="1" y="1" width="12" height="16" rx="2" fill="#eab308" />
    </svg>
  )
}

/** But / filet de football */
export function GoalIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden="true">
      <rect x="2" y="4" width="20" height="14" rx="1" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M2 7h20M2 10h20M2 13h20M8 4v14M14 4v14" stroke={color} strokeWidth="0.8" opacity="0.5" />
      <path d="M2 18h20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4 18v2M20 18v2" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/** Éclair / énergie (remplace Zap de Lucide) */
export function BoltIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} style={style} aria-hidden="true">
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  )
}

