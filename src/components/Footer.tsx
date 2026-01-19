export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-6 px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-xs">R</span>
          </div>
          <span className="text-sm font-semibold">Reel Studio</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <button className="hover:text-foreground transition-colors">Privacy</button>
          <button className="hover:text-foreground transition-colors">Terms</button>
          <button className="hover:text-foreground transition-colors">Support</button>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2025 Reel Studio
        </p>
      </div>
    </footer>
  );
}
