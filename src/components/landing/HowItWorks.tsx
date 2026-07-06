import { useEffect, useRef, useState } from "react";

const steps = [
  { num: "01", title: "Pick Your Thing", desc: "Browse through Instagram, TikTok, YouTube — whatever platform you're trying to grow. We've got it." },
  { num: "02", title: "Pay However You Want", desc: "Crypto, card, whatever works for you. Takes about 30 seconds, tops." },
  { num: "03", title: "Sit Back & Watch", desc: "Orders kick off within minutes. You can track everything live from your dashboard." },
];

const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const radii = ["rounded-2xl", "rounded-xl", "rounded-[18px]"];
  const tilts = ["rotate-0", "rotate-[-0.5deg]", "rotate-[0.5deg]"];

  return (
    <section id="how-it-works" ref={ref} className="relative py-16 md:py-32 px-5 md:px-6 bg-secondary/40">
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      <div className="mx-auto max-w-7xl relative">
        <div className={`text-center mb-10 md:mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}>
          <p className="text-sm text-primary font-medium mb-3 tracking-wide">How it actually works</p>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4" style={{ textWrap: "balance" }}>
            Three steps. Seriously, that's it.
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            We timed it — under 60 seconds from signup to first order
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-10">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className={`relative ${radii[i]} ${tilts[i]} border border-border bg-card p-6 md:p-10 transition-all duration-500 hover:shadow-lg hover:shadow-foreground/[0.03] hover:-translate-y-1.5 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
              style={{ transitionDelay: `${150 + i * 100}ms`, transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
            >
              <span className="text-4xl md:text-5xl font-extrabold text-primary/10 absolute top-5 right-5 md:top-6 md:right-6">{s.num}</span>
              <span className="text-xs font-semibold text-primary tracking-widest uppercase">Step {s.num}</span>
              <h3 className="text-lg md:text-xl font-semibold mt-3 md:mt-4 mb-2 md:mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
