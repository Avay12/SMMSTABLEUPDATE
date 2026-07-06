import { CheckCircle } from "lucide-react";

const steps = [
  { title: "Create an Account", desc: "Sign up with your email and verify it to get started." },
  { title: "Add Funds", desc: "Go to the Wallet page and deposit to your wallet via OxaPay." },
  { title: "Browse Services", desc: "Head to the Dashboard or Services page to find the service you need." },
  { title: "Place an Order", desc: "Select a service, enter the quantity and link, then click Place Order." },
  { title: "Track Your Orders", desc: "Check the Order History page to see the status of all your orders." },
  { title: "Need Help?", desc: "Visit the Support page to submit a ticket. Our team responds within 24 hours." },
];

const HowToUsePage = () => (
  <div>
    <h1 className="text-xl sm:text-2xl font-bold mb-1">How to Use</h1>
    <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Follow these simple steps to get started</p>
    <div className="space-y-3 sm:space-y-4">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3 sm:gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 hover:bg-secondary/50 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold">{i + 1}</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base">{step.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default HowToUsePage;
