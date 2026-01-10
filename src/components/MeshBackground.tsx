export function MeshBackground() {
  return (
    <div 
      className="absolute inset-0 overflow-hidden -z-10 pointer-events-none select-none" 
      aria-hidden="true"
    >
      {/* Color Blob 1: Soft Cyan-Blue (Top Right) */}
      <div 
        className="mesh-blob -top-[10%] -right-[5%] w-[45%] h-[45%] bg-mesh-cyan/40"
      />

      {/* Color Blob 2: Warm Amber-Yellow (Center Top) */}
      <div 
        className="mesh-blob top-[5%] left-[15%] w-[40%] h-[35%] bg-mesh-amber/40 opacity-70"
        style={{ animationDelay: '1.5s' }}
      />

      {/* Color Blob 3: Vibrant Pink-Purple (Middle Left) */}
      <div 
        className="mesh-blob top-[25%] -left-[10%] w-[50%] h-[50%] bg-mesh-fuchsia/30 blur-[160px]"
        style={{ animationDelay: '3s' }}
      />

      {/* Color Blob 4: Soft Lavender-Indigo (Bottom Right) */}
      <div 
        className="mesh-blob bottom-0 -right-[10%] w-[55%] h-[55%] bg-mesh-indigo/40 blur-[140px]"
        style={{ animationDelay: '0.5s' }}
      />

      {/* Sub-layer for extra blending depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-card/20 via-transparent to-card/30 backdrop-blur-[20px]" />
    </div>
  );
}
