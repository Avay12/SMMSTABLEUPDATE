import { useEffect, useRef, useState } from "react";

const paymentMethods = [
  { name: "Bitcoin", svg: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/bitcoin.svg" },
  { name: "Ethereum", svg: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ethereum.svg" },
  { name: "Tether", svg: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tether.svg" },
  { name: "Litecoin", svg: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/litecoin.svg" },
  { name: "Solana", svg: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/solana.svg" },
  { name: "BNB", svg: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/binance.svg" },
  { name: "Dogecoin", svg: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/dogecoin.svg" },
  { name: "TRON", svg: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tron.svg" },
];

const PaymentMethodsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-10 md:py-20 px-5 md:px-6 border-t border-border/50">
      <div className="mx-auto max-w-5xl text-center">
        <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}>
          <p className="text-xs text-muted-foreground mb-5 md:mb-6 uppercase tracking-widest font-medium">pay with whatever crypto you like</p>
          <div className="grid grid-cols-4 gap-4 md:flex md:flex-wrap md:items-center md:justify-center md:gap-10">
            {paymentMethods.map((p, i) => (
              <div
                key={p.name}
                className={`flex flex-col md:flex-row items-center gap-1.5 md:gap-2.5 transition-all duration-500 hover:scale-110 hover:rotate-[-2deg] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{
                  transitionDelay: `${100 + i * 60}ms`,
                  transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)"
                }}
              >
                <img
                  src={p.svg}
                  alt={p.name}
                  className="h-6 w-6 md:h-7 md:w-7"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="text-[11px] md:text-sm font-medium text-foreground">{p.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 md:mt-5">Secure payments through OxaPay — we don't touch your crypto</p>
        </div>
      </div>
    </section>
  );
};

export default PaymentMethodsSection;
