import React, { useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface OrderRulesNoticeProps {
  className?: string;
}

export const OrderRulesNotice: React.FC<OrderRulesNoticeProps> = ({ className = "" }) => {
  const [lang, setLang] = useState<"en" | "np">("en");

  return (
    <div
      className={`rounded-2xl border-2 border-primary/35 dark:border-primary/45 bg-card/95 dark:bg-card/80 p-4 sm:p-6 shadow-sm relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Subtle background glow effect using primary color */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/15 dark:bg-primary/20 flex items-center justify-center shrink-0 text-primary">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold tracking-wide uppercase text-foreground">
            {lang === "en" ? "ORDER RULES & WARNING" : "अर्डर नियम तथा चेतावनी"}
          </h3>
        </div>

        {/* Language switch buttons */}
        <div className="inline-flex items-center self-start sm:self-auto p-1 rounded-xl bg-secondary/80 border border-border/60">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
              lang === "en"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("np")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
              lang === "np"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            नेपाली
          </button>
        </div>
      </div>

      {/* Rules list */}
      <div className="mt-4 space-y-3.5 relative z-10">
        {lang === "en" ? (
          <ol className="space-y-3 text-xs sm:text-sm text-foreground/90 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">1.</span>
              <span>We cannot guarantee the exact time a service will take to complete.</span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">2.</span>
              <span>
                For <strong className="font-bold text-primary">non-refill</strong> services, if the count doesn't come, drops, or anything happens to it,{" "}
                <strong className="font-bold text-primary">no support</strong> will be given at all.
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">3.</span>
              <span>
                <strong className="font-bold text-primary">Guarantee</strong> services can also drop. After a drop, the bot will attempt an automatic refill, but there is a{" "}
                <strong className="font-bold text-primary">high chance the refill may not fully come</strong>.
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">4.</span>
              <span>
                If the refill does not come, <strong className="font-bold text-primary">no refund</strong> will be given for it under any circumstances.
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">5.</span>
              <span>
                If your order is delayed, you may request cancellation via our WhatsApp bot — but{" "}
                <strong className="font-bold text-primary">only while the order is still "In Progress" / Working</strong> and taking longer than expected.
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">6.</span>
              <span>
                Once an order is marked <strong className="font-bold text-primary">"Completed,"</strong> no refund is allowed under any circumstances.
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">7.</span>
              <span>
                If the order is still <strong className="font-bold text-primary">"Working" / In Progress</strong>, you can request a refund through the bot.
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">8.</span>
              <span>
                <strong className="font-bold text-primary">"Guarantee" does not mean it will never drop</strong> — a drop can happen even within 10 minutes of delivery. Please order at your own risk.
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">9.</span>
              <span>
                Please place an order only if you <strong className="font-bold text-primary">agree to all the above</strong>. If you don't agree, please don't waste your money here — we are not able to do anything beyond these terms.
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">10.</span>
              <span>
                Once funds are added to your SMM panel balance,{" "}
                <strong className="font-bold text-primary">withdrawal of that balance is never allowed</strong> from here. So think carefully before adding funds — add a small test amount first, and only add more if you're satisfied; otherwise, please don't add funds.
              </span>
            </li>
          </ol>
        ) : (
          <ol className="space-y-3 text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">१.</span>
              <span>सेवा पूरा हुन कति समय लाग्छ भनेर हामी निश्चित समयको ग्यारेन्टी दिन सक्दैनौं।</span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">२.</span>
              <span>
                <strong className="font-bold text-primary">non-refill</strong> सेवाहरूका लागि, यदि संख्या आएन, घट्यो (ड्रप भयो), वा केही समस्या भएमा, कुनै पनि प्रकारको{" "}
                <strong className="font-bold text-primary">सपोर्ट दिइने छैन</strong>।
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">३.</span>
              <span>
                <strong className="font-bold text-primary">Guarantee</strong> सेवाहरू पनि घट्न (ड्रप हुन) सक्छन्। ड्रप भएपछि, बोटले स्वचालित रूपमा रिफिल गर्ने प्रयास गर्नेछ, तर{" "}
                <strong className="font-bold text-primary">रिफिल पूर्ण रूपमा नआउने उच्च सम्भावना</strong> रहन्छ।
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">४.</span>
              <span>
                यदि रिफिल आएन भने, कुनै पनि परिस्थितिमा यसको लागि <strong className="font-bold text-primary">कुनै फिर्ता (no refund) दिइने छैन</strong>।
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">५.</span>
              <span>
                यदि तपाईंको अर्डर ढिलाइ भयो भने, तपाईंले हाम्रो WhatsApp bot मार्फत रद्द गर्न अनुरोध गर्न सक्नुहुन्छ — तर{" "}
                <strong className="font-bold text-primary">केवल जबसम्म अर्डर अझै "In Progress" / Working मा छ</strong> र अपेक्षित भन्दा बढी समय लिइरहेको छ।
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">६.</span>
              <span>
                एकपटक अर्डर <strong className="font-bold text-primary">"Completed"</strong> चिन्हित भएपछि, कुनै पनि परिस्थितिमा रकम फिर्ता (refund) अनुमति छैन।
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">७.</span>
              <span>
                यदि अर्डर अझै <strong className="font-bold text-primary">"Working" / In Progress</strong> मा छ भने, तपाईं बोट मार्फत फिर्ताको अनुरोध गर्न सक्नुहुन्छ।
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">८.</span>
              <span>
                <strong className="font-bold text-primary">"Guarantee" को अर्थ कहिल्यै ड्रप हुँदैन भन्ने होइन</strong> — डेलिभरी भएको १० मिनेट भित्र पनि ड्रप हुन सक्छ। कृपया आफ्नै जोखिममा अर्डर गर्नुहोस्।
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">९.</span>
              <span>
                कृपया माथिका सबै कुरामा <strong className="font-bold text-primary">सहमत हुनुहुन्छ भने मात्र</strong> अर्डर गर्नुहोस्। यदि तपाईं सहमत हुनुहुन्न भने, कृपया यहाँ आफ्नो पैसा खर्च नगर्नुहोस् — हामी यी सर्तहरू भन्दा बाहिर केही गर्न सक्दैनौं।
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="font-bold text-primary shrink-0 select-none min-w-[1.25rem]">१०.</span>
              <span>
                एकपटक तपाईंको SMM प्यानल ब्यालेन्समा रकम थपिएपछि, यहाँबाट त्यो ब्यालेन्सको{" "}
                <strong className="font-bold text-primary">निकासी (withdrawal) कहिल्यै अनुमति छैन</strong>। त्यसैले रकम थप्नु अघि ध्यान दिएर सोच्नुहोस् — पहिले सानो परीक्षण रकम थप्नुहोस्, र सन्तुष्ट भए मात्र थप रकम थप्नुहोस्; अन्यथा, कृपया रकम नथप्नुहोस्।
              </span>
            </li>
          </ol>
        )}
      </div>
    </div>
  );
};

export default OrderRulesNotice;
