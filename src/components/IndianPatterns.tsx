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

export function IndianFlagIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      {/* Saffron stripe */}
      <rect x="2" y="4" width="20" height="5.33" rx="1" fill="#FF9933" />
      {/* White stripe */}
      <rect x="2" y="9.33" width="20" height="5.33" fill="#FFFFFF" />
      {/* Green stripe */}
      <rect x="2" y="14.67" width="20" height="5.33" rx="1" fill="#138808" />
      {/* Ashoka Chakra */}
      <circle cx="12" cy="12" r="2.4" fill="none" stroke="#000080" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="0.5" fill="#000080" />
      {/* 24 spokes */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        const x2 = 12 + 2.2 * Math.sin(angle);
        const y2 = 12 - 2.2 * Math.cos(angle);
        return <line key={i} x1="12" y1="12" x2={x2} y2={y2} stroke="#000080" strokeWidth="0.25" />;
      })}
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
