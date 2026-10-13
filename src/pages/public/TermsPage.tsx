import useDocumentMeta from "@/hooks/useDocumentMeta";
import { PAGE_SEO } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const TermsPage = () => {
  useDocumentMeta(PAGE_SEO.terms);

  return (
    <div className="py-4 md:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Legal & Compliance
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Terms of <span className="text-gradient-premium">Service</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: October 13, 2026 • Effective Date: January 1, 2026
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Section 1 */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">1. Agreement to Terms</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            By creating an account, depositing funds, or utilizing any services provided by <strong className="text-foreground">Smmstable</strong> (accessible via smmstable.com), you confirm that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree to these terms, you must immediately discontinue using our platform.
          </p>
        </div>

        {/* Section 2 */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">2. Service Usage & Account Safety</h2>
          </div>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              Smmstable provides automated promotional and marketing enhancement services across multiple social media platforms including Instagram, TikTok, YouTube, Telegram, Facebook, and X (Twitter).
            </p>
            <ul className="space-y-2 list-none pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">Zero Password Policy:</strong> Smmstable will NEVER ask for your social media account passwords or 2FA codes. All promotional campaigns only require your public post URL or profile username.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">Public Settings Requirement:</strong> Profiles and posts submitted must remain PUBLIC throughout the order fulfillment period. Smmstable cannot deliver services to private or restricted accounts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">Simultaneous Orders:</strong> Users should avoid submitting multiple identical orders for the same link concurrently to prevent counter miscalculations between service nodes.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">3. Payment, Wallet Balance & Refills</h2>
          </div>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              All transactions on Smmstable are conducted using prepaid wallet balances denominated in USD (or converted equivalent currencies).
            </p>
            <ul className="space-y-2 list-none pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>Deposits made via cryptocurrency, OxaPay, or payment processors are credited automatically once confirmed on network or gateway verification.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span>Wallet balances are strictly non-refundable to original payment channels once deposited, but remain indefinitely usable across any current or future Smmstable service.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">Refill Guarantees:</strong> Services marked with a refill guarantee carry free drop protection for the stated duration (e.g. 30 days). In the event of algorithmic fluctuations, refill requests are processed promptly through ticket submission or automated dashboard triggers.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 4 */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">4. Reseller API Terms</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Resellers utilizing the Smmstable REST API must keep their private API keys secure. Smmstable provides 99.9% API uptime SLA and standard rate limits to ensure cluster health. Automated panels must adhere to the parameters detailed in our <Link to="/api" className="text-primary underline">API Documentation</Link>.
          </p>
        </div>

        {/* Section 5 */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">5. Contact & Support</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
            If you have questions regarding these Terms of Service or need dispute assistance, contact us via:
          </p>
          <div className="text-sm space-y-1">
            <p><strong className="text-foreground">Email:</strong> <a href="mailto:support@smmstable.com" className="text-primary hover:underline">support@smmstable.com</a></p>
            <p><strong className="text-foreground">Telegram:</strong> <a href="https://t.me/smmstable" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@smmstable</a></p>
            <p><strong className="text-foreground">Official Website:</strong> <a href="https://smmstable.com" className="text-primary hover:underline">https://smmstable.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
