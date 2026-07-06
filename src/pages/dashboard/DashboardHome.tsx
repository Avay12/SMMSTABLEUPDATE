import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, CheckCircle, Trophy, Loader2, Plus, ChevronRight, Send, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/contexts/CurrencyContext";

import { toast } from "@/hooks/use-toast";
import { useServices, getPlatform, getPlatforms, type SmmService } from "@/lib/smm-api";
import { apiClient } from "@/lib/apiClient";

import { useLocation, useNavigate } from "react-router-dom";

const platformIcons: Record<string, string> = {
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
  "Website Traffic": "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlechrome.svg",
};

type Step = "idle" | "platform" | "service" | "details";

const DashboardHome = () => {
  const { data: services, isLoading } = useServices();
  const { user, profile, refreshProfile } = useAuth();
  const { formatCurrency } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const orderRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("idle");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selected, setSelected] = useState<SmmService | null>(null);
  const [quantity, setQuantity] = useState("10");
  const [link, setLink] = useState("");
  const [placing, setPlacing] = useState(false);
  const [search, setSearch] = useState("");

  // Accept service selection from navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state?.selectedService) {
      const svc = state.selectedService;
      setSelected(svc);
      setSelectedPlatform(getPlatform(svc.category));
      setQuantity(svc.min.toString());
      setStep("details");
      navigate(".", { replace: true, state: {} });
      setTimeout(() => {
        orderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.state]);

  const platformList = useMemo(() => {
    if (!services) return [];
    const counts = new Map<string, number>();
    for (const s of services) {
      const p = getPlatform(s.category);
      counts.set(p, (counts.get(p) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!services || !selectedPlatform) return [];
    return services.filter((s) => {
      const matchPlatform = getPlatform(s.category) === selectedPlatform;
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.service.toString().includes(search);
      return matchPlatform && matchSearch;
    });
  }, [services, selectedPlatform, search]);

  const markedRate = selected ? parseFloat(selected.rate).toFixed(2) : "0";
  const cost = selected ? ((parseFloat(selected.rate) / 1000) * parseInt(quantity || "0")).toFixed(4) : "0.0000";

  const placeOrder = async () => {
    if (!user || !selected || !link) {
      toast({ title: "Error", description: "Fill in all fields", variant: "destructive" });
      return;
    }
    const qty = parseInt(quantity || "0");
    if (qty < selected.min || qty > selected.max) {
      toast({ title: "Invalid quantity", description: `Quantity must be between ${selected.min.toLocaleString()} and ${selected.max.toLocaleString()}.`, variant: "destructive" });
      return;
    }
    const orderCost = parseFloat(cost);
    const balance = profile?.balance ?? 0;
    if (balance < orderCost) {
      toast({ title: "Insufficient funds", description: `You need ${formatCurrency(orderCost)} but only have ${formatCurrency(balance)}.`, variant: "destructive" });
      return;
    }
    setPlacing(true);
    try {
      const response = await apiClient.post("/orders", {
        serviceId: Number(selected.service),
        link,
        quantity: qty,
      });
      const data = response.data;
      toast({ title: "Order placed!", description: `Order #${data.id || ""} is processing.` });
      resetFlow();
      refreshProfile();
    } catch (err: any) {
      toast({ title: "Order failed", description: err.response?.data?.message || err.message || "Something went wrong", variant: "destructive" });
    }
    setPlacing(false);
  };

  const resetFlow = () => {
    setStep("idle");
    setSelectedPlatform(null);
    setSelected(null);
    setQuantity("10");
    setLink("");
    setSearch("");
  };

  return (
    <div className="w-full">
      <h1 className="text-xl sm:text-2xl font-bold mb-1">
        Welcome back, <span className="text-gradient-premium">{profile?.username || "user"}!</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Manage your account and place orders.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between card-hover">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Wallet</div>
            <div className="text-xl font-bold">{formatCurrency(profile?.balance)}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between card-hover">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Completed</div>
            <div className="text-xl font-bold">0</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-accent" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between card-hover">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Tier</div>
            <div className="text-xl font-bold text-accent">{profile?.tier || "Bronze"}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-accent" />
          </div>
        </div>
      </div>

      {/* Contact banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 mb-6 space-y-2">
        <div className="flex items-center gap-3">
          <Send className="h-5 w-5 text-primary shrink-0" />
          <span className="text-sm font-medium">Need help? Reach out to us</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pl-8 text-xs text-muted-foreground">
          <a href="mailto:support@smmstable.com" className="hover:text-foreground transition-colors">📧 support@smmstable.com</a>
          <a href="tel:+16414358478" className="hover:text-foreground transition-colors">📞 +1 (641) 435-8478</a>
          <a href="https://t.me/smmstable" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">💬 Telegram</a>
        </div>
      </div>

      {/* New Order Section */}
      {step === "idle" && (
        <Button
          onClick={() => setStep("platform")}
          className="w-full h-14 rounded-xl text-base font-semibold gap-2 bg-gradient-primary hover:opacity-90 transition-opacity glow-violet-sm"
        >
          <Plus className="h-5 w-5" /> New Order
        </Button>
      )}

      {step !== "idle" && (
        <div ref={orderRef} className="rounded-xl border border-border bg-card p-4 space-y-4 animate-fade-in">
          {/* Header with back */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (step === "platform") resetFlow();
                else if (step === "service") { setStep("platform"); setSelected(null); setSearch(""); }
                else if (step === "details") setStep("service");
              }}
              className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center active:scale-[0.95] shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-base font-bold">
                {step === "platform" && "Select Platform"}
                {step === "service" && `${selectedPlatform} Services`}
                {step === "details" && "Order Details"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {step === "platform" && "Choose which platform you want"}
                {step === "service" && "Pick a service to order"}
                {step === "details" && selected?.name}
              </p>
            </div>
          </div>

          {/* Step 1: Platform selection */}
          {step === "platform" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 animate-fade-in">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                platformList.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => { setSelectedPlatform(p.name); setStep("service"); }}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/50 px-3 py-3.5 text-sm font-medium hover:bg-secondary hover:border-primary/20 transition-all duration-200 min-h-[48px]"
                  >
                    {platformIcons[p.name] && (
                      <img src={platformIcons[p.name]} alt={p.name} className="h-5 w-5 shrink-0" />
                    )}
                    <span className="truncate flex-1 text-left">{p.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{p.count}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Step 2: Service selection */}
          {step === "service" && (
            <div className="space-y-3 animate-fade-in">
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-secondary border-border h-11"
              />
              <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-border divide-y divide-border/50">
                {filteredServices.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">No services found.</div>
                )}
                {filteredServices.slice(0, 80).map((s) => (
                  <button
                    key={s.service}
                    onClick={() => { setSelected(s); setQuantity(s.min.toString()); setStep("details"); }}
                    className="w-full text-left px-3 py-3 text-sm hover:bg-secondary/50 transition-all duration-200 flex items-center gap-2 min-h-[48px]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium break-words leading-snug">{s.name}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>ID: {s.service}</span>
                        <span>Min: {s.min.toLocaleString()}</span>
                        <span>Max: {s.max.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="text-primary font-semibold text-sm whitespace-nowrap shrink-0">{formatCurrency(parseFloat(s.rate))}/1K</span>
                  </button>
                ))}
                {filteredServices.length > 80 && (
                  <div className="p-3 text-xs text-muted-foreground text-center">Showing 80 of {filteredServices.length} — refine search</div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Link, quantity, order */}
          {step === "details" && selected && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-lg bg-secondary/50 p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{selected.name}</span>
                  <span className="text-primary font-semibold">{formatCurrency(parseFloat(selected.rate))}/1K</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Min: {selected.min.toLocaleString()} • Max: {selected.max.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Link</label>
                <Input
                  placeholder="Enter your URL..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="bg-secondary border-border h-12"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Quantity</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-secondary border-border h-12"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Min: {selected.min.toLocaleString()} • Max: {selected.max.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                <span className="text-sm text-muted-foreground">Total Cost</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(parseFloat(cost))}</span>
              </div>

              <Button
                className="w-full h-14 text-base rounded-xl font-semibold bg-gradient-primary hover:opacity-90 transition-opacity glow-violet-sm"
                onClick={placeOrder}
                disabled={placing || !link}
              >
                {placing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Place Order
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
