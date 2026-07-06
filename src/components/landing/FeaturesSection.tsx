import { Zap, Shield, Clock, MousePointerClick } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const features = [
  { icon: Zap, title: "Stupid Fast", desc: "Most orders start within minutes. No waiting around, no 'processing' limbo.", radius: "rounded-2xl" },
  { icon: Shield, title: "Your Money's Safe", desc: "We encrypt everything. Your payment info never touches our servers directly.", radius: "rounded-xl" },
  { icon: Clock, title: "We Don't Sleep", desc: "Seriously, someone's always here. Hit us up at 3am, we'll answer.", radius: "rounded-2xl" },
  { icon: MousePointerClick, title: "Dead Simple", desc: "Pick a service, drop your link, pay. That's it. No PhD required.", radius: "rounded-[14px]" },
];

const FeaturesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={ref} className="relative py-16 md:py-32 px-5 md:px-6">
      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

      <div className="mx-auto max-w-7xl relative">
        <div className={`text-center mb-10 md:mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}>
          <p className="text-sm text-primary font-medium mb-3 tracking-wide">Why people stick with us</p>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4" style={{ textWrap: "balance" }}>
            No gimmicks. Just stuff that works.
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            We kept it simple because complicated is overrated
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group ${f.radius} border border-border bg-card p-6 md:p-8 transition-all duration-500 hover:shadow-lg hover:shadow-foreground/[0.03] hover:-translate-y-1.5 hover:rotate-[-0.5deg] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
              style={{ transitionDelay: `${150 + i * 80}ms`, transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
            >
              <div className="mb-4 md:mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 group-hover:rotate-[6deg] transition-all duration-300">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
