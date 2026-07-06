import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const platforms = [
  { name: "Instagram", services: ["Followers", "Likes", "Views", "Comments"], from: "$0.25", badge: "fan favorite", badgeColor: "bg-primary/10 text-primary", radius: "rounded-2xl" },
  { name: "TikTok", services: ["Followers", "Likes", "Views", "Coins"], from: "$0.10", badge: "🔥 hot rn", badgeColor: "bg-destructive/10 text-destructive", radius: "rounded-xl" },
  { name: "YouTube", services: ["Subscribers", "Views", "Likes", "Watch Hours"], from: "$0.30", badge: "popular", badgeColor: "bg-blue-500/10 text-blue-600", radius: "rounded-[14px]" },
  { name: "Facebook", services: ["Page Likes", "Followers", "Post Likes", "Views"], from: "$0.20", radius: "rounded-2xl" },
  { name: "Twitter/X", services: ["Followers", "Likes", "Retweets", "Views"], from: "$0.35", badge: "🔥 hot rn", badgeColor: "bg-destructive/10 text-destructive", radius: "rounded-xl" },
  { name: "Telegram", services: ["Members", "Post Views", "Reactions"], from: "$0.08", radius: "rounded-[14px]" },
  { name: "Spotify", services: ["Followers", "Plays", "Saves", "Playlist Adds"], from: "$0.50", badge: "just added", badgeColor: "bg-emerald-500/10 text-emerald-600", radius: "rounded-2xl" },
  { name: "Twitch", services: ["Followers", "Viewers", "Chatters"], from: "$0.80", radius: "rounded-xl" },
];

const PlatformsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.08 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" ref={ref} className="py-16 md:py-32 px-5 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className={`text-center mb-10 md:mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}>
          <p className="text-sm text-primary font-medium mb-3 tracking-wide">What we offer</p>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4" style={{ textWrap: "balance" }}>
            Every platform you care about. Covered.
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Real services used by real people — creators, agencies, and resellers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {platforms.map((p, i) => (
            <div
              key={p.name}
              className={`${p.radius} border border-border bg-card p-5 md:p-7 transition-all duration-500 hover:shadow-lg hover:shadow-foreground/[0.03] hover:-translate-y-1.5 hover:rotate-[-0.3deg] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
              style={{ transitionDelay: `${150 + i * 60}ms`, transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
            >
              {p.badge && (
                <span className={`inline-block text-[10px] font-bold lowercase tracking-wider ${p.radius === "rounded-xl" ? "rounded-lg" : "rounded-full"} px-2.5 py-0.5 mb-3 ${p.badgeColor} rotate-[-1deg]`}>
                  {p.badge}
                </span>
              )}
              <h3 className="text-lg font-bold mb-3">{p.name}</h3>
              <div className="flex flex-wrap gap-1.5 mb-4 md:mb-5">
                {p.services.map((s) => (
                  <span key={s} className="text-[11px] bg-secondary rounded-full px-2.5 py-1 text-muted-foreground">{s}</span>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">starts at</div>
              <div className="text-2xl font-bold text-primary">{p.from}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 md:mt-14 px-1">
          <Link to="/auth?mode=signup" className="block sm:inline-block">
            <Button size="lg" className="w-full sm:w-auto gap-2 rounded-xl active:scale-[0.97] h-14 text-base font-semibold">
              See Everything We Offer <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PlatformsSection;
