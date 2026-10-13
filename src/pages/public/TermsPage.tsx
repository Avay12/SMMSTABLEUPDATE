import useDocumentMeta from "@/hooks/useDocumentMeta";
import { PAGE_SEO } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, CheckCircle2, AlertTriangle, RefreshCw, CreditCard, Ban, Scale, Mail, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const TermsPage = () => {
  useDocumentMeta(PAGE_SEO.terms);

  return (
    <div className="py-4 md:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Legal Agreement
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Terms & <span className="text-gradient-premium">Conditions</span>
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Last revised: October 13, 2026 • Effective Date: January 1, 2026
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
          Please review these Terms and Conditions carefully prior to registering an account or placing orders on Smmstable.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Section 1: Acceptance */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">1. Acceptance of Terms & Conditions</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">
            By accessing, browsing, registering an account, or ordering services on <strong className="text-foreground">Smmstable</strong> (<a href="https://smmstable.com" className="text-primary hover:underline">smmstable.com</a>), you legally agree to comply with and be bound by these Terms and Conditions, our Privacy Policy, and any additional guidelines published on this platform.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            If you do not agree to any part of these Terms, you must not use or access Smmstable's automated services.
          </p>
        </div>

        {/* Section 2: Zero Password & Account Security */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">2. Zero-Password Policy & Account Safety</h2>
          </div>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              Smmstable operates strictly as an external promotional provider. Your privacy and social media account integrity are our highest priority:
            </p>
            <ul className="space-y-2 list-none pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">No Password Requirement:</strong> We will NEVER ask for, store, or require your social media passwords, two-factor authentication tokens, or private login credentials.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">Public Accounts Only:</strong> Your social media profile or post must remain strictly PUBLIC during the entire duration of order delivery. Orders placed for private accounts cannot be verified or fulfilled.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">No Username Alterations:</strong> Changing your handle or deleting the target post while an order is active will cause the delivery link to break, invalidating remaining units without refund.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 3: Service Delivery & Speed */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">3. Service Execution, Pacing & Refills</h2>
          </div>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              Smmstable provides automated engagement across Instagram, YouTube, TikTok, Telegram, Facebook, and X.
            </p>
            <ul className="space-y-2 list-none pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">Start Time & Delivery Speeds:</strong> While most orders begin within 1 to 5 minutes, delivery speeds may vary based on platform updates, server load, and package parameters. Delivery speeds listed in service descriptions are realistic estimates, not strict guarantees.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">Concurrent Orders:</strong> Do not submit multiple simultaneous orders for the exact same URL until the initial order is completed. Overlapping orders cause server counter conflicts and will result in inaccurate counts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">Refill Guarantee:</strong> Services denoted with "Refill" or "Guaranteed" include drop protection for the stated guarantee window (e.g. 30 days). If natural drops occur within that timeframe, submit a ticket with your Order ID for a free automated top-up.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 4: Wallet, Payments & Refunds */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">4. Wallet Deposits, Payment Terms & Refund Policy</h2>
          </div>
          <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              All purchases on Smmstable are made using prepaid wallet credits.
            </p>
            <ul className="space-y-2 list-none pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">Prepaid Wallet:</strong> Funds added through Visa, Mastercard, Binance Pay, OxaPay, or cryptocurrency are deposited into your internal Smmstable balance upon payment confirmation.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">No External Chargebacks:</strong> Deposited funds are strictly non-refundable back to original bank accounts or crypto wallets once processed. In the event of an undeliverable order or system cancellation, the remaining amount is credited back to your Smmstable wallet.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                <span><strong className="text-foreground">Chargeback Disputes:</strong> Initiating fraudulent chargebacks or payment disputes with processors without contacting support will result in immediate termination of your Smmstable account and permanent IP blacklisting.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 5: Reseller API */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Scale className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">5. Reseller API & Commercial Usage</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">
            Smmstable provides a REST API for resellers and automated panels (Perfect Panel, SmartPanel, Rentapanel). Resellers are responsible for managing their own end-user relationships and keeping their secret API keys confidential.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Any intentional flooding, DDOS attempts, or abuse of our API infrastructure will lead to instant revocation of API privileges.
          </p>
        </div>

        {/* Section 6: Prohibited Activities */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-destructive shrink-0">
              <Ban className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">6. Prohibited Activities</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-2">
            You agree NOT to use Smmstable to promote:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-sm text-muted-foreground">
            <li>Hate speech, violence, harassment, or illegal substances</li>
            <li>Fraudulent schemes, phishing campaigns, or non-consensual media</li>
            <li>Content that infringes upon third-party copyrights or patents</li>
          </ul>
        </div>

        {/* Section 7: Limitation of Liability */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">7. Limitation of Liability</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Smmstable is not affiliated with or endorsed by Instagram, TikTok, YouTube, Facebook, Telegram, or X. You acknowledge that third-party platforms regularly update their algorithms, and Smmstable shall not be held liable for any account suspensions, shadowbans, or organic metric fluctuations enacted by third-party social media networks.
          </p>
        </div>

        {/* Section 8: Contact */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">8. Contact & Legal Inquiries</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
            For questions regarding these Terms & Conditions or to report a violation, please contact our support desk:
          </p>
          <div className="text-sm space-y-1.5">
            <p><strong className="text-foreground">Official Email:</strong> <a href="mailto:support@smmstable.com" className="text-primary hover:underline">support@smmstable.com</a></p>
            <p><strong className="text-foreground">Telegram Channel & Support:</strong> <a href="https://t.me/smmstable" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@smmstable</a></p>
            <p><strong className="text-foreground">Phone Hotline:</strong> <a href="tel:+16414358478" className="text-primary hover:underline">+1 (641) 435-8478</a></p>
            <p><strong className="text-foreground">Official Website:</strong> <a href="https://smmstable.com" className="text-primary hover:underline">https://smmstable.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
