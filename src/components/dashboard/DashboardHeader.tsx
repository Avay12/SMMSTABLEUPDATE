import { useState, useEffect, useRef } from "react";
import { Bell, Sun, Moon, Globe, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { languageNames } from "@/i18n";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/contexts/CurrencyContext";

const DashboardHeader = () => {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { currencies, currentCurrency, setCurrency } = useCurrency();
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const langRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await apiClient.get('/notifications');
      if (data) {
        setNotifications(data);
        const unread = data.filter((n: any) => !n.isRead);
        setUnreadCount(unread.length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (!user) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Polling as fallback
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    try {
      await apiClient.post("/notifications/read-all");
    } catch (err) {
      console.error(err);
    }
    localStorage.setItem("lastBroadcastRead", new Date().toISOString());
    setUnreadCount(0);
    fetchNotifications();
  };

  const langs = Object.entries(languageNames);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title={theme === "dark" ? t("lightMode") : t("darkMode")}
      >
        {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </button>

      {/* Currency selector */}
      <div ref={currencyRef} className="relative">
        <button
          onClick={() => { setCurrencyOpen(!currencyOpen); setLangOpen(false); setNotifOpen(false); }}
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium text-sm"
          title={t("currency") || "Currency"}
        >
          {currentCurrency.symbol}
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

      {/* Language selector */}
      <div ref={langRef} className="relative">
        <button
          onClick={() => { setLangOpen(!langOpen); setCurrencyOpen(false); setNotifOpen(false); }}
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={t("language")}
        >
          <Globe className="h-[18px] w-[18px]" />
        </button>
        {langOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-lg z-50 py-1 scrollbar-hide">
            {langs.map(([code, name]) => (
              <button
                key={code}
                onClick={() => { i18n.changeLanguage(code); setLangOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-secondary transition-colors min-h-[40px] ${
                  i18n.language === code ? "text-primary font-medium" : "text-foreground"
                }`}
              >
                <span>{name}</span>
                {i18n.language === code && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notification bell */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); setCurrencyOpen(false); }}
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
          title={t("notifications")}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-h-96 overflow-y-auto rounded-xl border border-border bg-card shadow-lg z-50 scrollbar-hide">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold">{t("notifications")}</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                  {t("markAllRead")}
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">{t("noNotifications")}</div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => {
                  const lastBroadcastRead = localStorage.getItem("lastBroadcastRead") || "1970-01-01";
                  const isUnread = n.is_broadcast
                    ? new Date(n.createdAt) > new Date(lastBroadcastRead)
                    : !n.read;
                  return (
                    <div key={n.id} className={`px-4 py-3 ${isUnread ? "bg-primary/5" : ""}`}>
                      <div className="flex items-start gap-2">
                        {isUnread && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{n.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 break-words">{n.message}</div>
                          <div className="text-[10px] text-muted-foreground/60 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
