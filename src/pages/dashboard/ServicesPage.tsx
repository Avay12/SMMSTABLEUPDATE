import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useServices, getPlatform, type SmmService } from "@/lib/smm-api";
import { Loader2, RefreshCw, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";

const platformLogos: Record<string, string> = {
  Instagram: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg",
  TikTok: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg",
  YouTube: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg",
  Facebook: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg",
  "X (Twitter)": "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/x.svg",
  Telegram: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg",
  Spotify: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/spotify.svg",
  Twitch: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitch.svg",
  Discord: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg",
  LinkedIn: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg",
  Threads: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/threads.svg",
  Snapchat: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/snapchat.svg",
  Kick: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/kick.svg",
};

const formatAvgTime = (mins?: string | number) => {
  if (!mins) return "";
  const num = parseInt(mins.toString(), 10);
  if (isNaN(num) || num <= 0) return "";
  if (num < 60) return `${num} min${num !== 1 ? 's' : ''}`;
  const hours = Math.floor(num / 60);
  const m = num % 60;
  return `${hours} hr${hours !== 1 ? 's' : ''}${m > 0 ? ` ${m} min` : ''}`;
};

const ServicesPage = () => {
  const { data: services, isLoading, error, refetch } = useServices();
  const { formatCurrency } = useCurrency();
  
  const [search, setSearch] = useState("");
  const [activePlatform, setActivePlatform] = useState("All");
  const [visibleCount, setVisibleCount] = useState(50);
  const navigate = useNavigate();

  const platformCounts = useMemo(() => {
    if (!services) return new Map<string, number>();
    const counts = new Map<string, number>();
    for (const s of services) {
      const p = getPlatform(s.category);
      counts.set(p, (counts.get(p) || 0) + 1);
    }
    return counts;
  }, [services]);

  const filtered = useMemo(() => {
    if (!services) return [];
    const result = services.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.service.toString().includes(search) ||
        s.category.toLowerCase().includes(search.toLowerCase());
      const matchPlatform =
        activePlatform === "All" || getPlatform(s.category) === activePlatform;
      return matchSearch && matchPlatform;
    });
    // Sort recommended first
    return result.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
  }, [services, search, activePlatform]);

  // Reset visible count when filters change
  useMemo(() => {
    setVisibleCount(50);
  }, [search, activePlatform]);

  const handleOrder = (service: SmmService) => {
    navigate("/dashboard", { state: { selectedService: service } });
  };

  // Simple infinite scroll trigger
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 200;
    if (bottom && visibleCount < filtered.length) {
      setVisibleCount(prev => prev + 50);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] overflow-y-auto pr-2 pb-10" onScroll={handleScroll}>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl sm:text-2xl font-bold">Services</h1>
        <Button variant="ghost" size="icon" onClick={() => refetch()} className="h-10 w-10 active:scale-[0.95]">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Browse all available services{services ? ` (${services.length})` : ""}
      </p>

      {/* Platform filter - grid layout, no horizontal overflow */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
        <button
          onClick={() => setActivePlatform("All")}
          className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-[0.95] min-h-[44px] ${
            activePlatform === "All"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          All
        </button>
        {Object.entries(platformLogos).map(([name, url]) => {
          const count = platformCounts.get(name) || 0;
          if (count === 0 && services) return null;
          return (
            <button
              key={name}
              onClick={() => setActivePlatform(name === activePlatform ? "All" : name)}
              className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl transition-all active:scale-[0.95] min-h-[44px] ${
                activePlatform === name
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "hover:bg-secondary bg-secondary/50"
              }`}
            >
              <img src={url} alt={name} className="h-4 w-4 shrink-0" />
              <span className="text-xs font-medium truncate">{name.replace(" (Twitter)", "")}</span>
            </button>
          );
        })}
      </div>

      <Input
        placeholder="Search by ID, name, or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-secondary border-border mb-4 h-11"
      />

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading services...</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-destructive text-sm">Failed to load services. Please try again.</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm rounded-xl border border-border bg-card">
              No services found.
            </div>
          )}

          {/* Mobile: compact cards. Desktop: table rows */}
          <div className="space-y-2 sm:space-y-0">
            {/* Desktop header */}
            <div className="hidden sm:grid grid-cols-[60px_1fr_90px_70px_90px_100px_80px] gap-3 px-4 py-2.5 text-xs text-muted-foreground font-medium border-b border-border bg-card rounded-t-xl">
              <span>ID</span>
              <span>Service</span>
              <span>Rate/1K</span>
              <span>Min</span>
              <span>Max</span>
              <span>Avg Time</span>
              <span></span>
            </div>

            <div className="sm:rounded-b-xl sm:border sm:border-t-0 sm:border-border sm:bg-card sm:overflow-hidden pb-4">
              {filtered.slice(0, visibleCount).map((s, idx) => {
                const platform = getPlatform(s.category);
                const platformIcon = platformLogos[platform];
                return (
                <div key={`${s.service}-${idx}`}>
                  {/* Mobile card */}
                  <div className={`sm:hidden rounded-xl border bg-card p-3 mb-2 ${s.recommended ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {platformIcon && <img src={platformIcon} alt={platform} className="h-4 w-4 shrink-0" />}
                        {s.recommended && <Star className="h-3.5 w-3.5 text-primary fill-primary shrink-0" />}
                        <span className="font-medium text-sm leading-snug break-words">{s.name}</span>
                      </div>
                      <span className="text-[10px] bg-muted rounded px-1.5 py-0.5 font-mono shrink-0">{s.service}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs mb-2.5 flex-wrap">
                      <span className="text-primary font-semibold">{formatCurrency(parseFloat(s.rate))}/1K</span>
                      <span className="text-muted-foreground">Min {s.min.toLocaleString()}</span>
                      <span className="text-muted-foreground">Max {s.max.toLocaleString()}</span>
                      {s.average_time && <span className="text-muted-foreground text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded">Avg: {formatAvgTime(s.average_time)}</span>}
                    </div>
                    <Button
                      size="sm"
                      className="w-full rounded-lg h-10 text-sm gap-1.5 active:scale-[0.97]"
                      onClick={() => handleOrder(s)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" /> Order Now
                    </Button>
                  </div>
                  {/* Desktop row */}
                  <div className={`hidden sm:grid grid-cols-[60px_1fr_90px_70px_90px_100px_80px] gap-3 px-4 py-3 text-sm border-b border-border/50 hover:bg-secondary/50 transition-colors items-center ${s.recommended ? 'bg-primary/5' : ''}`}>
                    <span className="text-muted-foreground font-mono text-xs">{s.service}</span>
                    <span className="font-medium truncate flex items-center gap-1.5">
                      {platformIcon && <img src={platformIcon} alt={platform} className="h-4 w-4 shrink-0" />}
                      {s.recommended && <Star className="h-3.5 w-3.5 text-primary fill-primary shrink-0" />}
                      {s.name}
                    </span>
                    <span className="text-primary font-medium">{formatCurrency(parseFloat(s.rate))}</span>
                    <span className="text-muted-foreground text-xs">{s.min.toLocaleString()}</span>
                    <span className="text-muted-foreground text-xs">{s.max.toLocaleString()}</span>
                    <span className="text-muted-foreground text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded truncate">{s.average_time ? formatAvgTime(s.average_time) : '-'}</span>
                    <Button
                      size="sm"
                      className="h-8 rounded-lg text-xs gap-1 active:scale-[0.97]"
                      onClick={() => handleOrder(s)}
                    >
                      <ShoppingCart className="h-3 w-3" /> Order
                    </Button>
                  </div>
                </div>
                );
              })}
              {visibleCount < filtered.length && (
                <div className="py-6 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ServicesPage;
