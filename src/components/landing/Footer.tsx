import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer aria-label="Site footer" className="border-t border-border py-8 md:py-10 px-5 md:px-6">
      <div className="mx-auto max-w-7xl flex flex-col items-center gap-5 md:flex-row md:justify-between md:gap-4">
        <button onClick={scrollToTop} className="flex items-center gap-2.5 cursor-pointer active:scale-[0.97] transition-transform">
          <img src={logo} alt="Smmstable" className="h-8 w-8 rounded-full" />
          <span className="font-display font-bold tracking-tight">
            <span className="text-foreground">Smm</span><span className="text-gradient-premium">stable</span>
          </span>
        </button>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Link to="/services" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">Services & Pricing</Link>
          <Link to="/how-to-use" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">How It Works</Link>
          <Link to="/api" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">API Docs</Link>
          <Link to="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">About Us</Link>
          <Link to="/auth?mode=signup" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">Sign Up</Link>
          <Link to="/support" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">Support</Link>
          <a href="mailto:support@smmstable.com" className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">Email</a>
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
