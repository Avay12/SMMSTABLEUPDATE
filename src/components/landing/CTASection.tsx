import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const perks = ["Free account, no catch", "No credit card needed", "Orders start in minutes", "Real humans answer support"];

const CTASection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-16 md:py-32 px-5 md:px-6 bg-secondary/40">
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      <div className={`mx-auto max-w-3xl text-center relative transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}>
        <p className="text-sm text-primary font-medium mb-3 tracking-wide">2,893+ creators can't all be wrong</p>
        <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-5 tracking-tight" style={{ textWrap: "balance" }}>
          Look, your competitors are already here.
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 max-w-lg mx-auto">
          We're not going to beg. But your audience isn't going to grow itself either. Just saying.
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:flex md:flex-wrap md:justify-center md:gap-x-6 md:gap-y-2 mb-8 md:mb-10">
          {perks.map((p) => (
            <div key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary shrink-0" /> {p}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <Link to="/auth?mode=signup" className="block">
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 text-base px-10 h-14 rounded-xl active:scale-[0.97] transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 font-semibold"
            >
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/auth?mode=login" className="block">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-14 rounded-xl active:scale-[0.97] transition-all font-semibold">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
