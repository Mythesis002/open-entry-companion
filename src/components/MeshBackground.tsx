export function MeshBackground() {
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0" 
      aria-hidden="true"
    >
      {/* Main Cyan blob (Right side) */}
      <div 
        className="absolute -top-[5%] right-0 w-[60%] h-[70%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at 60% 40%, hsl(192, 100%, 72%) 0%, hsl(198, 90%, 80%) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Pink-Rose blob (Left side) */}
      <div 
        className="absolute -top-[5%] -left-[5%] w-[55%] h-[60%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at 40% 40%, hsl(335, 90%, 82%) 0%, hsl(345, 80%, 87%) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Lavender-Purple blob (Center-bottom) */}
      <div 
        className="absolute top-[20%] left-[15%] w-[65%] h-[55%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at 50% 50%, hsl(265, 80%, 84%) 0%, hsl(275, 70%, 88%) 40%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Warm yellow-cream accent (Top center) */}
      <div 
        className="absolute top-[5%] left-[25%] w-[40%] h-[30%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at center, hsl(48, 100%, 85%) 0%, transparent 60%)',
          filter: 'blur(45px)',
          opacity: 0.9
        }}
      />

      {/* Soft teal glow (Right edge) */}
      <div 
        className="absolute top-[35%] right-0 w-[25%] h-[35%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at center, hsl(175, 75%, 80%) 0%, transparent 60%)',
          filter: 'blur(45px)',
          opacity: 0.8
        }}
      />

      {/* Light base overlay for consistency */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(220, 20%, 98%) 85%)'
        }}
      />
    </div>
  );
}
