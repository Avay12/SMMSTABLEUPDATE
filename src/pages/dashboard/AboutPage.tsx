import telegramLogo from "@/assets/telegram-logo.png";
import instagramLogo from "@/assets/instagram-logo.png";
import facebookLogo from "@/assets/facebook-logo.png";
import emailIcon from "@/assets/email-icon.png";
import phoneIcon from "@/assets/phone-icon.png";
import useDocumentMeta from "@/hooks/useDocumentMeta";
import { PAGE_SEO } from "@/lib/seo";
import { ShieldCheck, Zap, Headphones, Globe2, Layers, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AboutPage = () => {
  useDocumentMeta(PAGE_SEO.about);

  return (
    <div className="py-2 md:py-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          About <span className="text-gradient-premium">Smmstable</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
          The world's premier automated Social Media Marketing (SMM) provider and reseller panel, engineered to deliver authentic, high-speed engagement at wholesale prices.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Core Identity & Mission */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold mb-3">Who We Are</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
            Founded with the mission to democratize digital growth, <strong className="text-foreground">Smmstable</strong> provides direct-source social media marketing solutions for content creators, digital agencies, entrepreneurs, and global resellers. We bypass middleman markup by connecting orders directly into high-capacity automated server clusters.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Whether you are launching a new brand, boosting video reach, or establishing authority on Instagram, YouTube, TikTok, Telegram, Facebook, or X, Smmstable provides the infrastructure to scale your presence safely and sustainably.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">2,800+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Active Clients</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">500+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Active Services</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">99.9%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">API Uptime</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">24/7/365</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Live Support</div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold mb-6">Why Smmstable Leads the Industry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Instant Automated Execution</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Orders commence within 1 to 5 minutes via automated APIs. No manual approval queues or unnecessary delays.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">100% Zero Password Policy</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We strictly never request passwords or 2FA codes. All services are fulfilled via public URLs with algorithmic safety.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Lowest Wholesale Pricing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Primary source infrastructure enables us to provide the most competitive rates in the market, starting at $0.001/1k.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Reseller REST API</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect your custom application or reseller panel seamlessly with our standardized, low-latency REST API endpoints.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Official Contact Channels</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Our team is available 24/7 for customer support, service recommendations, and bulk reseller partnerships.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="mailto:support@smmstable.com" className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors group">
              <img src={emailIcon} alt="Email" className="h-8 w-8 rounded-lg object-contain" loading="lazy" width={32} height={32} />
              <div>
                <div className="text-xs text-muted-foreground">Official Email</div>
                <span className="text-sm font-medium text-primary group-hover:underline">support@smmstable.com</span>
              </div>
            </a>
            <a href="tel:+16414358478" className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors group">
              <img src={phoneIcon} alt="Phone" className="h-8 w-8 rounded-lg object-contain" loading="lazy" width={32} height={32} />
              <div>
                <div className="text-xs text-muted-foreground">Phone Hotline</div>
                <span className="text-sm font-medium text-primary group-hover:underline">+1 (641) 435-8478</span>
              </div>
            </a>
            <a href="https://t.me/smmstable" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors group">
              <img src={telegramLogo} alt="Telegram" className="h-8 w-8 rounded-lg object-contain" loading="lazy" width={32} height={32} />
              <div>
                <div className="text-xs text-muted-foreground">Telegram Channel & Support</div>
                <span className="text-sm font-medium text-primary group-hover:underline">@smmstable</span>
              </div>
            </a>
            <a href="https://instagram.com/smmstable" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors group">
              <img src={instagramLogo} alt="Instagram" className="h-8 w-8 rounded-lg object-contain" loading="lazy" width={32} height={32} />
              <div>
                <div className="text-xs text-muted-foreground">Instagram Official</div>
                <span className="text-sm font-medium text-primary group-hover:underline">@smmstable</span>
              </div>
            </a>
          </div>
        </div>

        {/* Quick Links Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-secondary/20">
          <div>
            <h3 className="font-semibold text-sm sm:text-base">Ready to scale your social media presence?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Explore our complete catalog of 500+ services.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/services">
              <Button variant="outline" size="sm" className="rounded-xl">Browse Services</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="rounded-xl bg-gradient-primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
