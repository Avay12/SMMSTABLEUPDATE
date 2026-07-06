import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    name: "sarah k.",
    handle: "@sarahcreates",
    text: "honestly didn't expect much but my ig went from 2k to 11k in like 3 weeks?? wild",
    verified: true,
    tilt: "rotate-[-1deg]",
    radius: "rounded-2xl",
  },
  {
    name: "marcus t.",
    handle: "@marc.beats",
    text: "been using this for my spotify and youtube. the plays are legit, retention is actually good. way better than the last 3 services i tried",
    verified: true,
    tilt: "rotate-[0.5deg]",
    radius: "rounded-xl",
  },
  {
    name: "jenny 🌸",
    handle: "@jennyvibes",
    text: "the dashboard is so clean lol. placed my first order in literally 40 seconds. also support actually replied at 2am which was unexpected",
    verified: true,
    tilt: "rotate-0",
    radius: "rounded-[14px]",
  },
  {
    name: "dave r.",
    handle: "@daveresells",
    text: "i resell these services and the api is solid. margins are good, no complaints from my clients. been here 6 months now",
    verified: true,
    tilt: "rotate-[1deg]",
    radius: "rounded-2xl",
  },
  {
    name: "mia chen",
    handle: "@miachenofficial",
    text: "tried like 5 different smm panels before this one. this is the only one where orders dont just dissapear lol",
    verified: true,
    tilt: "rotate-[-0.5deg]",
    radius: "rounded-xl",
  },
  {
    name: "alex 🎮",
    handle: "@alexstreams",
    text: "got my twitch followers up before a sponsor meeting. looked way more legit. they signed me 😭",
    verified: true,
    tilt: "rotate-[0.5deg]",
    radius: "rounded-[18px]",
  },
];

const VerifiedStamp = () => (
  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 rounded-md px-1.5 py-0.5 rotate-[-2deg] ml-1.5">
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="text-primary">
      <path d="M6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1-6.5 6.5z" fill="currentColor"/>
    </svg>
    verified
  </span>
);

const SocialProofSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.08 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-16 md:py-32 px-5 md:px-6">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      <div className="mx-auto max-w-7xl relative">
        <div className={`text-center mb-10 md:mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}>
          <p className="text-sm text-primary font-medium mb-3 tracking-wide">Don't take our word for it</p>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4" style={{ textWrap: "balance" }}>
            Here's what actual users are saying
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Unedited, lowercase and all. These are real.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.handle}
              className={`${t.radius} ${t.tilt} border border-border bg-card p-5 md:p-6 transition-all duration-500 hover:shadow-lg hover:shadow-foreground/[0.03] hover:-translate-y-1 hover:rotate-0 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
              style={{ transitionDelay: `${100 + i * 70}ms`, transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
            >
              <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground uppercase">
                  {t.name[0]}
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                    {t.verified && <VerifiedStamp />}
                  </div>
                  <span className="text-xs text-muted-foreground">{t.handle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
