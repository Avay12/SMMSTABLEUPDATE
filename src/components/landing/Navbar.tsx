import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import logo from "@/assets/logo.png";
import { useCurrency } from "@/contexts/CurrencyContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currencies, currentCurrency, setCurrency } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    
    const handler = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
    };
    document.addEventListener("mousedown", handler);
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-border/60 bg-background/90 backdrop-blur-xl shadow-sm" : "bg-background/60 backdrop-blur-lg"}`}>
      <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-5 md:px-6">
        <button onClick={scrollToTop} className="flex items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform">
          <img src={logo} alt="Smmstable" className="h-8 w-8 rounded-full" />
          <span className="text-lg md:text-xl font-display font-bold tracking-tight">
            <span className="text-foreground">Smm</span><span className="text-gradient-premium">stable</span>
          </span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* Currency selector */}
          <div ref={currencyRef} className="relative">
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className="h-9 px-3 rounded-xl flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {currentCurrency.code} ({currentCurrency.symbol})
            </button>
            {currencyOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-lg z-50 py-1 scrollbar-hide">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-secondary transition-colors min-h-[40px] ${
                      currentCurrency.code === c.code ? "text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    <span>{c.code}</span>
                    {currentCurrency.code === c.code && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/auth?mode=login">
            <Button variant="ghost" size="sm" className="text-muted-foreground">Sign In</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button size="sm" className="rounded-xl px-5 bg-gradient-primary hover:opacity-90 glow-violet-sm">Get Started</Button>
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 -mr-2 text-foreground active:scale-[0.92] transition-transform" aria-label="Toggle menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Full-screen mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-50 bg-background animate-fade-in">
          <div className="flex flex-col h-full px-6 pt-8 pb-10">
            <nav className="flex flex-col gap-2 flex-1">
              <a href="#features" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-foreground py-4 border-b border-border/50 active:bg-secondary/60 rounded-lg px-2 transition-colors">Features</a>
              <a href="#services" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-foreground py-4 border-b border-border/50 active:bg-secondary/60 rounded-lg px-2 transition-colors">Services</a>
              <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-foreground py-4 border-b border-border/50 active:bg-secondary/60 rounded-lg px-2 transition-colors">How It Works</a>
              <a href="https://t.me/smmstable" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-foreground py-4 border-b border-border/50 active:bg-secondary/60 rounded-lg px-2 transition-colors">Telegram</a>
            </nav>
            <div className="flex flex-col gap-3 pt-6">
              <Link to="/auth?mode=signup" onClick={() => setMobileOpen(false)} className="block">
                <Button className="w-full h-14 text-base rounded-xl active:scale-[0.97] font-semibold">Get Started</Button>
              </Link>
              <Link to="/auth?mode=login" onClick={() => setMobileOpen(false)} className="block">
                <Button variant="outline" className="w-full h-14 text-base rounded-xl active:scale-[0.97] font-semibold">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
