import { useState, useMemo } from "react";
import useDocumentMeta from "@/hooks/useDocumentMeta";
import { PAGE_SEO } from "@/lib/seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, HelpCircle, ShieldCheck, Zap, CreditCard, Code2, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface FAQItem {
  id: string;
  category: "general" | "safety" | "delivery" | "payment" | "api";
  question: string;
  answer: string;
  keywords: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "what-is-smmstable",
    category: "general",
    question: "What is Smmstable and how does it work?",
    answer:
      "Smmstable is the leading automated Social Media Marketing (SMM) provider and reseller panel. We provide high-quality, high-speed engagement services including real followers, likes, views, subscribers, and comments for Instagram, TikTok, YouTube, Facebook, Telegram, and X (Twitter). You simply create a free account, add funds to your wallet, select your desired service and package, paste your public profile or post link, and our automated system starts fulfilling your order within minutes.",
    keywords: ["what is smmstable", "smm panel", "how does it work", "social media marketing"],
  },
  {
    id: "cheapest-smm-panel",
    category: "general",
    question: "Why is Smmstable considered the #1 cheapest SMM panel?",
    answer:
      "Smmstable operates as a primary-source provider with direct high-throughput server clusters, eliminating the middleman markups charged by third-party resellers. This allows us to offer wholesale prices starting at just $0.001 per 1,000 units while maintaining enterprise-grade reliability and 99.9% uptime.",
    keywords: ["cheapest smm panel", "wholesale smm", "best prices", "low cost"],
  },
  {
    id: "account-safety",
    category: "safety",
    question: "Is Smmstable safe for my social media accounts? Will I get banned?",
    answer:
      "Yes, Smmstable is 100% safe. We strictly NEVER ask for your password or account login credentials. All deliveries are made externally to your public URL using organic drip delivery patterns and algorithmic compliance parameters designed to protect your account standing. Over 2,800+ creators and agencies trust Smmstable daily without issues.",
    keywords: ["safe", "account safety", "no password", "ban safe", "is smmstable safe"],
  },
  {
    id: "drop-guarantee",
    category: "safety",
    question: "Will the followers, likes, or views drop after delivery?",
    answer:
      "We offer guaranteed non-drop services with automatic refill systems. On services labeled 'Refill' or 'Guaranteed', if you ever experience a natural drop within the warranty period (e.g., 30 days to lifetime), our automated system or our 24/7 support team will top up your count completely free of charge.",
    keywords: ["non drop", "refill", "drop guarantee", "retention"],
  },
  {
    id: "delivery-speed",
    category: "delivery",
    question: "How fast do Smmstable orders start and complete?",
    answer:
      "95% of orders start automatically within 1 to 5 minutes after submission. Delivery speeds vary depending on the service category (e.g., instant high-speed boosts vs. gradual organic drip-feed). You can monitor real-time order progression (Pending, In Progress, Completed) 24/7 directly from your Smmstable Order History dashboard.",
    keywords: ["delivery speed", "instant start", "fast delivery", "order progress"],
  },
  {
    id: "profile-private",
    category: "delivery",
    question: "Can I place orders while my account or post is set to Private?",
    answer:
      "No. Your account and content must remain strictly PUBLIC during the entire delivery window. If your account is set to private, the automated delivery system cannot detect your post or profile, causing the order to fail or stall. Once delivery is completed, you can change your privacy settings if you wish.",
    keywords: ["private account", "public profile", "link requirements"],
  },
  {
    id: "payment-methods",
    category: "payment",
    question: "What payment methods are supported on Smmstable?",
    answer:
      "Smmstable provides seamless, instant wallet top-ups with zero hidden fees. We support Visa, Mastercard, Binance Pay, OxaPay, and top cryptocurrencies including USDT (TRC20, ERC20, BEP20), Bitcoin (BTC), Ethereum (ETH), and Litecoin (LTC). Funds reflect in your balance immediately upon blockchain or gateway confirmation.",
    keywords: ["payment methods", "crypto", "binance pay", "oxapay", "credit card", "wallet"],
  },
  {
    id: "refund-policy",
    category: "payment",
    question: "What is your refund policy if an order cannot be completed?",
    answer:
      "If an order cannot be completed or is partially delivered due to a technical error or invalid link, the remaining undelivered amount is automatically refunded directly to your Smmstable wallet balance so you can re-order or select an alternative service. Please refer to our Terms of Service for full wallet balance details.",
    keywords: ["refund policy", "wallet balance", "partial refund"],
  },
  {
    id: "reseller-api",
    category: "api",
    question: "Does Smmstable support API integration for resellers?",
    answer:
      "Yes! Smmstable provides a comprehensive, high-speed REST API designed specifically for SMM resellers, digital agencies, and automated script platforms (such as Perfect Panel, SmartPanel, and Rentapanel). Resellers can pull service catalogs, place bulk orders, check order statuses, and query balance in milliseconds.",
    keywords: ["smm api", "reseller api", "perfect panel", "smartpanel", "automated smm"],
  },
  {
    id: "custom-orders",
    category: "api",
    question: "Can I place bulk orders or automate repetitive campaigns?",
    answer:
      "Absolutely. Smmstable features a built-in Mass Order tool in the dashboard allowing you to submit hundreds of orders in one click. Additionally, our API allows complete programmatic automation of custom schedules, drip campaigns, and recurring boosts.",
    keywords: ["mass order", "bulk orders", "drip feed", "automation"],
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "general", label: "General & Overview", icon: HelpCircle },
  { id: "safety", label: "Safety & Privacy", icon: ShieldCheck },
  { id: "delivery", label: "Speed & Delivery", icon: Zap },
  { id: "payment", label: "Payments & Wallet", icon: CreditCard },
  { id: "api", label: "Reseller API", icon: Code2 },
] as const;

export const FaqPage = () => {
  useDocumentMeta(PAGE_SEO.faq);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const q = search.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [search, selectedCategory]);

  return (
    <div className="py-4 md:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Knowledge Base & Help
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Frequently Asked <span className="text-gradient-premium">Questions</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about Smmstable — the #1 cheapest, safest, and most reliable automated SMM panel for instant social media growth.
        </p>

        {/* Search Bar */}
        <div className="mt-6 md:mt-8 relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search questions (e.g. safety, delivery speed, crypto, API)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 h-12 sm:h-14 rounded-2xl border-border bg-card shadow-sm text-base focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 md:mb-10">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Accordion Questions */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm mb-12">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-base font-semibold">No questions found</p>
            <p className="text-sm text-muted-foreground mt-1">Try modifying your search or browsing another category.</p>
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSelectedCategory("all"); }} className="mt-4">
              Reset Filters
            </Button>
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={["what-is-smmstable", "account-safety"]} className="w-full">
            {filteredFaqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-border/60 py-1">
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Trust & Support CTA */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">Still have questions about Smmstable?</h3>
          <p className="text-sm text-muted-foreground max-w-xl">
            Our expert customer support team is available 24 hours a day, 7 days a week to help you scale your social media presence.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a href="https://t.me/smmstable" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2 rounded-xl">
              <MessageCircle className="h-4 w-4" /> Telegram Support
            </Button>
          </a>
          <Link to="/auth?mode=signup">
            <Button className="gap-2 rounded-xl bg-gradient-primary">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
