import { useAuth } from "@/hooks/useAuth";
import { Trophy } from "lucide-react";

const tiers = [
  { name: "Bronze", min: 0, color: "text-[hsl(var(--fame-orange))]", desc: "Starting tier. Access to all basic services." },
  { name: "Silver", min: 50, color: "text-muted-foreground", desc: "5% discount on all orders." },
  { name: "Gold", min: 200, color: "text-[hsl(var(--fame-orange))]", desc: "7% discount + priority support." },
  { name: "Platinum", min: 500, color: "text-primary", desc: "10% discount + dedicated account manager." },
  { name: "Diamond", min: 1000, color: "text-primary", desc: "15% discount + exclusive services + API priority." },
];

const LoyaltyPage = () => {
  const { profile } = useAuth();
  const currentTier = profile?.tier || "Bronze";

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-1">Loyalty Tier</h1>
      <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Spend more to unlock better discounts</p>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 mb-5 sm:mb-6 flex items-center gap-4">
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Your Current Tier</div>
          <div className="text-xl sm:text-2xl font-bold text-[hsl(var(--fame-orange))]">{currentTier}</div>
        </div>
      </div>

      <div className="space-y-3">
        {tiers.map((t) => (
          <div key={t.name} className={`rounded-2xl border bg-card p-4 sm:p-5 flex items-center gap-4 transition-colors ${currentTier === t.name ? "border-primary bg-primary/5" : "border-border"}`}>
            <Trophy className={`h-6 w-6 shrink-0 ${t.color}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-semibold ${t.color}`}>{t.name}</span>
                {currentTier === t.name && <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">Current</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{t.desc}</p>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground shrink-0 whitespace-nowrap">${t.min}+</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoyaltyPage;
