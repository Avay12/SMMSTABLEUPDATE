import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const platforms = [
  { name: "Instagram", svg: "https://cdn.simpleicons.org/instagram" },
  { name: "TikTok", svg: "https://cdn.simpleicons.org/tiktok" },
  { name: "YouTube", svg: "https://cdn.simpleicons.org/youtube" },
  { name: "Facebook", svg: "https://cdn.simpleicons.org/facebook" },
  { name: "X", svg: "https://cdn.simpleicons.org/x" },
  { name: "Telegram", svg: "https://cdn.simpleicons.org/telegram" },
  { name: "Spotify", svg: "https://cdn.simpleicons.org/spotify" },
  { name: "Twitch", svg: "https://cdn.simpleicons.org/twitch" },
];

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section ref={ref} className="relative pt-24 pb-14 md:pt-40 md:pb-28 overflow-hidden">
      {/* Subtle grain overlay */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

      <div className="mx-auto max-w-4xl px-5 md:px-6 text-center relative">
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          <p className="text-xs md:text-sm font-medium text-primary mb-4 md:mb-5 tracking-wide">
            2,893+ creators already here — you're late
          </p>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-5 md:mb-6"
            style={{ lineHeight: "1.08" }}
          >
            Stop waiting.
            <br />
            <span className="relative inline-block">
              <span className="text-gradient-premium">Start growing.</span>
              <svg className="absolute -bottom-4 left-0 w-full h-6 text-primary" viewBox="0 0 200 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M4 20 C30 18 60 16 90 13 C120 10 150 6 175 3 L185 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                <path d="M4 20 C30 18 60 16 90 13 C120 10 150 6 175 3 L185 1 L185 24 L4 24 Z" fill="currentColor" opacity="0.06" />
                {/* Arrow head */}
                <polygon points="185,1 176,6 179,0" fill="currentColor" opacity="0.5" />
              </svg>
            </span>
          </h1>

          <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed" style={{ textWrap: "balance" as any }}>
            We deliver real followers, likes, and views — not bots, not fluff. Just the numbers that actually matter for your account.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-12 md:mb-16">
            <Link to="/auth?mode=signup" className="block">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 text-base px-10 md:px-12 h-14 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 font-semibold bg-gradient-primary glow-violet-sm animate-[bounce-subtle_2s_ease-in-out_infinite]"
              >
                Start Growing Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth?mode=login" className="block">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base h-14 px-10 rounded-xl active:scale-[0.97] transition-all font-semibold"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust Bar */}
        <div
          className={`transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          <p className="text-xs text-muted-foreground mb-5 md:mb-6 uppercase tracking-widest font-medium">We work with all of these</p>
          <div className="grid grid-cols-4 gap-4 md:flex md:flex-wrap md:items-center md:justify-center md:gap-10">
            {platforms.map((p, i) => (
              <div
                key={p.name}
                className={`flex flex-col md:flex-row items-center gap-1.5 md:gap-2.5 transition-all duration-700 hover:scale-110 hover:rotate-[-2deg] ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
                style={{
                  transitionDelay: `${400 + i * 80}ms`,
                  transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)"
                }}
              >
                <img src={p.svg} alt={p.name} className="h-6 w-6 md:h-7 md:w-7" style={{ filter: "none" }} />
                <span className="text-[11px] md:text-sm font-medium text-foreground">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
