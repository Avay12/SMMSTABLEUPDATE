import useDocumentMeta from "@/hooks/useDocumentMeta";
import { PAGE_SEO } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Lock, ShieldCheck, EyeOff, Server, Mail } from "lucide-react";

export const PrivacyPage = () => {
  useDocumentMeta(PAGE_SEO.privacy);

  return (
    <div className="py-4 md:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Security & Transparency
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Privacy <span className="text-gradient-premium">Policy</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: October 13, 2026 • Effective Date: January 1, 2026
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Commitment Banner */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <EyeOff className="h-6 w-6 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Our Core Privacy Commitment: Zero Password Access</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            At <strong className="text-foreground">Smmstable</strong>, privacy and account safety are our foundational principles. We <span className="text-foreground font-semibold">NEVER ask for, store, or have access to</span> the passwords, private keys, or login credentials of your social media profiles. All services are fulfilled strictly through publicly accessible links.
          </p>
        </div>

        {/* Section 1: Information Collected */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">1. Information We Collect</h2>
          </div>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>We collect only the minimal data required to provide our automated marketing services:</p>
            <ul className="space-y-2 list-disc list-inside pt-1">
              <li><strong className="text-foreground">Account Information:</strong> Your registered email address and encrypted password hash used to authenticate into Smmstable.</li>
              <li><strong className="text-foreground">Order Information:</strong> Public post links, profile URLs, chosen service IDs, quantities, and transaction timestamps.</li>
              <li><strong className="text-foreground">Payment Records:</strong> Transaction IDs and wallet funding records (credit card and private banking numbers are never stored on Smmstable servers).</li>
            </ul>
          </div>
        </div>

        {/* Section 2: How Data is Used */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Server className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">2. How We Use & Protect Your Data</h2>
          </div>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              Your data is exclusively utilized to execute your requested promotions, provide 24/7 customer support, and detect fraudulent activity.
            </p>
            <p>
              All communication between your device and Smmstable is encrypted using industry-standard TLS 1.3 encryption. We maintain strict access control barriers ensuring your order data and account details are inaccessible to unauthorized parties.
            </p>
          </div>
        </div>

        {/* Section 3: Third Parties */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">3. Third-Party Sharing & Selling</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            We do NOT sell, rent, or trade your personal information to marketing conglomerates, data brokers, or external advertisers. We only integrate with trusted, audited payment infrastructure (such as OxaPay and Binance Pay) necessary to process your deposits.
          </p>
        </div>

        {/* Section 4: Contact */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">4. Privacy Requests & Contact</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
            If you wish to request account deletion, data extraction, or have questions about our privacy infrastructure, please contact our Data Protection Officer:
          </p>
          <div className="text-sm space-y-1">
            <p><strong className="text-foreground">Email:</strong> <a href="mailto:support@smmstable.com" className="text-primary hover:underline">support@smmstable.com</a></p>
            <p><strong className="text-foreground">Official Website:</strong> <a href="https://smmstable.com" className="text-primary hover:underline">https://smmstable.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
