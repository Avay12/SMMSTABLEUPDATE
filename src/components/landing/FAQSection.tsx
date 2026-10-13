import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, HelpCircle } from "lucide-react";

const HOME_FAQS = [
  {
    id: "home-faq-1",
    question: "What is Smmstable and how does it help grow my accounts?",
    answer:
      "Smmstable is an automated Social Media Marketing (SMM) provider and reseller panel. It allows creators, agencies, and businesses to boost their social presence on Instagram, TikTok, YouTube, Facebook, Telegram, and X by providing real followers, likes, views, and comments at the cheapest wholesale rates with instant delivery.",
  },
  {
    id: "home-faq-2",
    question: "Is Smmstable safe? Do I need to give my account password?",
    answer:
      "Yes, Smmstable is 100% safe. We never ask for your passwords or account credentials. All orders only require your public post link or username. Delivery is processed with safe pacing and algorithmic compliance to protect your account.",
  },
  {
    id: "home-faq-3",
    question: "Why is Smmstable the cheapest SMM panel?",
    answer:
      "Unlike middleman reseller panels that inflate pricing, Smmstable routes orders directly through automated primary provider clusters. This enables us to offer wholesale prices starting from fractions of a cent per 1,000 units with instant start.",
  },
  {
    id: "home-faq-4",
    question: "How fast are orders started after placement?",
    answer:
      "Most orders start automatically within 1 to 5 minutes. You can monitor the real-time status of your orders (Pending, In Progress, Completed) anytime in your Smmstable dashboard.",
  },
  {
    id: "home-faq-5",
    question: "What payment methods are supported on Smmstable?",
    answer:
      "We accept instant wallet top-ups through Visa, Mastercard, Binance Pay, OxaPay, and major cryptocurrencies (USDT, Bitcoin, Ethereum, Litecoin) with zero hidden transaction fees.",
  },
  {
    id: "home-faq-6",
    question: "Can I connect my own website or reseller panel via API?",
    answer:
      "Yes! Smmstable includes a full RESTful API compatible with Perfect Panel, SmartPanel, and custom applications, enabling complete 24/7 automated order placement and status syncing for resellers.",
  },
];

export const FAQSection = () => {
  return (
    <section aria-label="Frequently Asked Questions" className="py-16 md:py-24 border-t border-border/40 relative">
      <div className="mx-auto max-w-4xl px-5 md:px-6">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            Got Questions?
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Frequently Asked <span className="text-gradient-premium">Questions</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Quick answers about Smmstable's automated delivery, pricing, account safety, and payment methods.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm mb-8">
          <Accordion type="single" collapsible defaultValue="home-faq-1" className="w-full">
            {HOME_FAQS.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-border/60">
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base hover:text-primary transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left bg-secondary/30 rounded-2xl p-4 sm:p-5 border border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Have more specific questions?</p>
              <p className="text-xs text-muted-foreground">Browse all answers or contact our 24/7 support desk.</p>
            </div>
          </div>
          <Link to="/faq">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              View All FAQs <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
