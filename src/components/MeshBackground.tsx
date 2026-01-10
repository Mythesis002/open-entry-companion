export function MeshBackground() {
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0" 
      aria-hidden="true"
    >
      {/* Main Cyan blob (Right side) */}
      <div 
        className="absolute -top-[5%] right-0 w-[55%] h-[65%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at 60% 40%, hsl(192, 95%, 85%) 0%, hsl(198, 85%, 90%) 35%, transparent 65%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Pink-Rose blob (Left side) */}
      <div 
        className="absolute -top-[5%] -left-[5%] w-[50%] h-[55%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at 40% 40%, hsl(335, 85%, 90%) 0%, hsl(345, 75%, 93%) 35%, transparent 65%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Lavender-Purple blob (Center-bottom) */}
      <div 
        className="absolute top-[25%] left-[20%] w-[60%] h-[50%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at 50% 50%, hsl(265, 75%, 92%) 0%, hsl(275, 65%, 95%) 35%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Warm yellow-cream accent (Top center) */}
      <div 
        className="absolute top-[5%] left-[30%] w-[35%] h-[25%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at center, hsl(48, 100%, 92%) 0%, transparent 55%)',
          filter: 'blur(50px)',
          opacity: 0.8
        }}
      />

      {/* Soft teal glow (Right edge) */}
      <div 
        className="absolute top-[35%] right-0 w-[20%] h-[30%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at center, hsl(175, 70%, 88%) 0%, transparent 55%)',
          filter: 'blur(50px)',
          opacity: 0.6
        }}
      />

      {/* Light base overlay for consistency */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(220, 20%, 98%) 80%)'
        }}
      />
    </div>
  );
}
