import { Shield, Zap, TrendingUp, Cpu, Users, Clock } from "lucide-react";

export const OverviewSection = () => {
  return (
    <section aria-label="About Smmstable Overview" className="py-16 md:py-24 border-t border-border/40 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 md:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Industry-Leading SMM Panel
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            What is <span className="text-gradient-premium">Smmstable</span>?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Smmstable</strong> is the world's most trusted, affordable automated Social Media Marketing (SMM) provider and reseller panel. We empower creators, digital marketing agencies, influencers, and brands to scale their social reach across Instagram, YouTube, TikTok, Telegram, Facebook, and X (Twitter) with instant execution and wholesale prices.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Cheapest Wholesale Rates</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By connecting directly to high-capacity provider nodes, Smmstable eliminates middleman surcharges, giving you services starting at just fractions of a cent per 1,000 units.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">100% Safe & Password-Free</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We never ask for your passwords or confidential credentials. Your accounts are safeguarded with compliant drip-feed options and organic delivery pacing.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">High-Speed Reseller API</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Run your own SMM business seamlessly. Our high-throughput REST API integrates natively with Perfect Panel, SmartPanel, and custom applications in minutes.
            </p>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-secondary/20 to-card p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">500+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Active Services</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">1-5 Min</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Average Start Time</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">99.9%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">System Uptime</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Live Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;
