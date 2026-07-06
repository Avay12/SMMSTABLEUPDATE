import logo from "@/assets/logo.png";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border py-8 md:py-10 px-5 md:px-6">
      <div className="mx-auto max-w-7xl flex flex-col items-center gap-5 md:flex-row md:justify-between md:gap-4">
        <button onClick={scrollToTop} className="flex items-center gap-2.5 cursor-pointer active:scale-[0.97] transition-transform">
          <img src={logo} alt="Smmstable" className="h-8 w-8 rounded-full" />
          <span className="font-display font-bold tracking-tight">
            <span className="text-foreground">Smm</span><span className="text-gradient-premium">stable</span>
          </span>
        </button>
        <div className="flex flex-wrap items-center justify-center gap-5 md:gap-6">
          <a href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">Features</a>
          <a href="#services" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">Services</a>
          <a href="#how-it-works" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">How It Works</a>
          <a href="mailto:support@smmstable.com" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">support@smmstable.com</a>
          <a href="tel:+16414358478" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">+1 (641) 435-8478</a>
          <a href="https://t.me/smmstable" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">Telegram</a>
          <a href="https://instagram.com/smmstable" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">Instagram</a>
          <a href="https://facebook.com/smmstable" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">Facebook</a>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1">
          <p className="text-xs text-muted-foreground">© 2026 Smmstable. All rights reserved.</p>
          <p className="text-[10px] text-muted-foreground/60 italic">built with late-night coffee ☕ and zero sleep</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
