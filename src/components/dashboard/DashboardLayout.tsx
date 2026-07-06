import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Globe, Clock, HelpCircle, Code, MessageSquare, Settings, Headphones, Trophy, Info, LogOut, Plus, Menu, X, Shield, DollarSign, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslation } from "react-i18next";
import DashboardHeader from "./DashboardHeader";
import DepositBonusPopup from "./DepositBonusPopup";
import logo from "@/assets/logo.png";

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, isAdmin, signOut } = useAuth();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("dashboard"), end: true },
    { to: "/dashboard/services", icon: Globe, label: t("services") },
    { to: "/dashboard/add-funds", icon: DollarSign, label: t("addFunds") },
    { to: "/dashboard/orders", icon: Clock, label: t("orderHistory") },
    { to: "/dashboard/how-to-use", icon: HelpCircle, label: t("howToUse") },
    { to: "/dashboard/api", icon: Code, label: t("apiPortal") },
    { to: "/dashboard/feedback", icon: MessageSquare, label: t("feedback") },
    { to: "/dashboard/settings", icon: Settings, label: t("settings") },
    { to: "/dashboard/support", icon: Headphones, label: t("support") },
    { to: "/dashboard/loyalty", icon: Trophy, label: t("loyaltyTier") },
    { to: "/dashboard/about", icon: Info, label: t("aboutUs") },
    ...(isAdmin ? [{ to: "/dashboard/admin", icon: Shield, label: t("adminPanel") }] : []),
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <>
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-6">
          <img src={logo} alt="Smmstable" className="h-8 w-8 rounded-full" />
          <span className="font-bold tracking-tight text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-foreground">Smm</span><span className="text-gradient-premium">stable</span>
          </span>
        </div>

        <Link to="/dashboard/add-funds" className="block rounded-xl bg-gradient-to-br from-secondary to-muted p-4 mb-6 hover:from-muted hover:to-secondary transition-all duration-300 group" onClick={onNav}>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{t("balance")}</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-bold">{formatCurrency(profile?.balance || 0)}</span>
            <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center group-hover:glow-violet-sm transition-shadow duration-300">
              <Plus className="h-3.5 w-3.5 text-primary-foreground" />
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNav}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3.5 text-sm transition-all duration-200 active:scale-[0.97] min-h-[44px] ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 space-y-0.5 mt-auto">
        <a
          href="https://t.me/smmstable"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-sm w-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors active:scale-[0.97] min-h-[44px]"
        >
          <Send className="h-[18px] w-[18px]" /> {t("telegram")}
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-sm w-full text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.97] min-h-[44px]"
        >
          <LogOut className="h-[18px] w-[18px]" /> {t("logout")}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sticky top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-card/95 backdrop-blur-lg flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Smmstable" className="h-7 w-7 rounded-full" />
          <span className="font-bold text-sm tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-foreground">Smm</span><span className="text-gradient-premium">stable</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <DashboardHeader />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground active:scale-[0.92] transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Toggle sidebar">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
          <aside className="md:hidden fixed inset-y-0 left-0 w-[280px] flex flex-col border-r border-border bg-card z-50 animate-slide-in-left">
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      <main className="flex-1 md:ml-60 w-full overflow-x-hidden">
        {/* Desktop header bar */}
        <div className="hidden md:flex items-center justify-end px-8 py-4 border-b border-border bg-card/50">
          <DashboardHeader />
        </div>
        <div className="px-4 py-6 pt-[4.5rem] md:px-8 md:py-8 md:pt-8 max-w-6xl w-full animate-page-in">
          <Outlet />
        </div>
        <DepositBonusPopup />
      </main>
    </div>
  );
};

export default DashboardLayout;
