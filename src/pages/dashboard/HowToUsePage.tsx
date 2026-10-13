import useDocumentMeta from "@/hooks/useDocumentMeta";
import { PAGE_SEO } from "@/lib/seo";
import { UserPlus, Wallet, Search, Send, Clock, HelpCircle, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Free Account",
    desc: "Register in under 30 seconds with just your email. No credit card or sensitive personal verification required.",
  },
  {
    icon: Wallet,
    step: "02",
    title: "Add Funds to Your Wallet",
    desc: "Deposit funds securely through Visa, Mastercard, Binance Pay, OxaPay, or cryptocurrency (USDT, BTC, ETH) with instant crediting.",
  },
  {
    icon: Search,
    step: "03",
    title: "Select Platform & Service",
    desc: "Browse over 500+ categories for Instagram, TikTok, YouTube, Telegram, and X. Compare prices, start times, and refill guarantees.",
  },
  {
    icon: Send,
    step: "04",
    title: "Enter Link & Submit Order",
    desc: "Paste your public profile or post URL, specify the desired quantity, and click Place Order. Your order is dispatched immediately.",
  },
  {
    icon: Clock,
    step: "05",
    title: "Track Live Delivery",
    desc: "Watch real-time status updates (Pending, In Progress, Completed) directly inside your Smmstable Order History dashboard.",
  },
  {
    icon: HelpCircle,
    step: "06",
    title: "24/7 Support & Refills",
    desc: "If you have questions or require a refill on guaranteed services, open a support ticket or reach out on Telegram anytime.",
  },
];

const LINK_EXAMPLES = [
  { platform: "Instagram Followers", format: "https://www.instagram.com/username", note: "Use profile link, profile must be public" },
  { platform: "Instagram Likes / Views", format: "https://www.instagram.com/p/CODE/ or /reel/CODE/", note: "Direct link to public post or reel" },
  { platform: "TikTok Views / Likes", format: "https://www.tiktok.com/@user/video/1234567890", note: "Direct link to public TikTok video" },
  { platform: "YouTube Views / Likes", format: "https://www.youtube.com/watch?v=XXXXXXXXXXX", note: "Standard public video URL" },
  { platform: "Telegram Channel Members", format: "https://t.me/channel_name", note: "Public channel or supergroup username" },
];

const HowToUsePage = () => {
  useDocumentMeta(PAGE_SEO.howToUse);

  return (
    <div className="py-2 md:py-6 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          How to Use <span className="text-gradient-premium">Smmstable</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
          Follow this simple step-by-step tutorial to start boosting your social media accounts with the cheapest SMM panel.
        </p>
      </div>

      {/* Step by Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-10">
        {steps.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 hover:border-primary/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground/60 tracking-wider">STEP {item.step}</span>
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* URL Link Formatting Guide */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-10">
        <h2 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Link Formatting Guidelines
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          To ensure instant automated order processing, make sure your links match the required format:
        </p>
        <div className="space-y-3">
          {LINK_EXAMPLES.map((item, idx) => (
            <div key={idx} className="p-3 sm:p-4 rounded-xl border border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-primary block">{item.platform}</span>
                <code className="text-xs sm:text-sm font-mono text-foreground">{item.format}</code>
              </div>
              <span className="text-xs text-muted-foreground italic shrink-0">{item.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Crucial Tips */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 mb-10">
        <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Important Rules for Smooth Delivery
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span><strong>Never set accounts to private</strong> while an order is active. The automated API cannot deliver to private accounts.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span><strong>Do not change your username</strong> or delete the post while delivery is in progress. Doing so invalidates the destination URL.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span><strong>Avoid duplicate simultaneous orders</strong> for the exact same link until the first order finishes to ensure accurate counter indexing.</span>
          </li>
        </ul>
      </div>

      {/* CTA Box */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-card via-secondary/30 to-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold mb-1">Ready to place your first order?</h3>
          <p className="text-sm text-muted-foreground">Sign up now and boost your social presence in minutes.</p>
        </div>
        <Link to="/auth?mode=signup">
          <Button className="rounded-xl bg-gradient-primary gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HowToUsePage;
