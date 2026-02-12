export function MeshBackground() {
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0" 
      aria-hidden="true"
    >
      {/* Warm saffron-orange blob (Right side) */}
      <div 
        className="absolute -top-[5%] right-0 w-[60%] h-[70%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at 60% 40%, hsl(28, 95%, 70%) 0%, hsl(35, 90%, 75%) 40%, transparent 70%)',
          filter: 'blur(50px)',
          opacity: 0.9
        }}
      />

      {/* Deep maroon blob (Left side) */}
      <div 
        className="absolute -top-[5%] -left-[5%] w-[55%] h-[60%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at 40% 40%, hsl(348, 70%, 45%) 0%, hsl(348, 60%, 55%) 40%, transparent 70%)',
          filter: 'blur(55px)',
          opacity: 0.7
        }}
      />

      {/* Gold blob (Center-bottom) */}
      <div 
        className="absolute top-[20%] left-[15%] w-[65%] h-[55%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at 50% 50%, hsl(43, 96%, 65%) 0%, hsl(40, 90%, 72%) 40%, transparent 70%)',
          filter: 'blur(60px)',
          opacity: 0.8
        }}
      />

      {/* Deep red accent (Top center) */}
      <div 
        className="absolute top-[5%] left-[25%] w-[40%] h-[30%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at center, hsl(0, 75%, 50%) 0%, transparent 60%)',
          filter: 'blur(50px)',
          opacity: 0.5
        }}
      />

      {/* Emerald green accent (Right edge) */}
      <div 
        className="absolute top-[35%] right-0 w-[25%] h-[35%] rounded-full"
        style={{ 
          background: 'radial-gradient(ellipse at center, hsl(160, 60%, 45%) 0%, transparent 60%)',
          filter: 'blur(45px)',
          opacity: 0.4
        }}
      />

      {/* Warm cream base overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(35, 30%, 96%) 85%)'
        }}
      />
    </div>
  );
}
