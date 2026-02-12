/**
 * Decorative Indian-inspired pattern elements
 * Used as ornamental dividers, borders, and background accents
 */

export function RangoliDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-60" />
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-brand-gold opacity-80">
        <path d="M16 2L18.5 8.5L25 6L20 12L26 14L20 16L26 18L20 20L25 26L18.5 23.5L16 30L13.5 23.5L7 26L12 20L6 18L12 16L6 14L12 12L7 6L13.5 8.5L16 2Z" fill="currentColor" />
        <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.6" />
      </svg>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-60" />
    </div>
  );
}

export function PaisleyCorner({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg 
      width="80" height="80" viewBox="0 0 80 80" fill="none" 
      className={`text-brand-gold/20 ${flip ? 'scale-x-[-1]' : ''} ${className}`}
    >
      <path d="M0 0C0 0 20 5 35 20C50 35 55 55 40 65C25 75 10 60 15 45C20 30 35 30 40 40C45 50 35 55 30 50" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.4" />
      <circle cx="25" cy="15" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="15" cy="25" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function MandalaBorder({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg width="100%" height="12" viewBox="0 0 400 12" preserveAspectRatio="none" className="text-brand-gold/30">
        <pattern id="indian-border" x="0" y="0" width="40" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 6C5 2 10 0 15 0C20 0 20 6 25 6C30 6 30 0 35 0C40 0 40 6 40 6" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M0 6C5 10 10 12 15 12C20 12 20 6 25 6C30 6 30 12 35 12C40 12 40 6 40 6" stroke="currentColor" strokeWidth="1" fill="none" />
          <circle cx="20" cy="6" r="1.5" fill="currentColor" />
        </pattern>
        <rect width="400" height="12" fill="url(#indian-border)" />
      </svg>
    </div>
  );
}

export function LotusIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3C12 3 9 8 9 12C9 16 12 19 12 19C12 19 15 16 15 12C15 8 12 3 12 3Z" fill="currentColor" opacity="0.7" />
      <path d="M12 7C12 7 6 10 6 14C6 18 12 19 12 19C12 19 4 16 5 12C6 8 12 7 12 7Z" fill="currentColor" opacity="0.5" />
      <path d="M12 7C12 7 18 10 18 14C18 18 12 19 12 19C12 19 20 16 19 12C18 8 12 7 12 7Z" fill="currentColor" opacity="0.5" />
      <path d="M12 9C12 9 3 12 3 15C3 18 12 19 12 19C12 19 1 15 3 12C5 9 12 9 12 9Z" fill="currentColor" opacity="0.3" />
      <path d="M12 9C12 9 21 12 21 15C21 18 12 19 12 19C12 19 23 15 21 12C19 9 12 9 12 9Z" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function DiyaIcon({ className = '', size = 20 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <ellipse cx="10" cy="15" rx="7" ry="3" fill="currentColor" opacity="0.6" />
      <path d="M5 15C5 12 7 10 10 10C13 10 15 12 15 15" fill="currentColor" opacity="0.4" />
      <path d="M10 10C10 10 9 6 10 3C11 6 10 10 10 10Z" fill="currentColor" opacity="0.8" />
      <circle cx="10" cy="3" r="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
