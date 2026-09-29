import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, Shield, Zap, CheckCircle, RefreshCw, Loader2, Copy, Check, ArrowLeft, ArrowRight, MessageCircle, Mail, Phone, Percent, Info, Sparkles, Tag, Gift, CreditCard, Languages, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { checkPayment } from "@/lib/oxapay";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/apiClient";
import { useCurrency } from "@/contexts/CurrencyContext";
import useDocumentMeta from "@/hooks/useDocumentMeta";
import { PAGE_SEO } from "@/lib/seo";

interface PendingPayment {
  trackId: string;
  amount: string;
  currency: string;
  address: string;
  qrCode: string;
  createdAt: string;
  status: string;
  network?: string;
}

type PaymentMethod = null | "manual";

const WalletPage = () => {
  useDocumentMeta(PAGE_SEO.wallet);
  const { user, profile, refreshProfile } = useAuth();
  const { formatCurrency, currentCurrency, currencies } = useCurrency();
  const nprCurrency = currencies?.find(c => c.code === 'NPR') || { rate: 134, symbol: 'Rs', code: 'NPR' };
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [mobileNumber, setMobileNumber] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [activePayment, setActivePayment] = useState<PendingPayment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [dbTransactions, setDbTransactions] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("manual");
  const [isFirstDeposit, setIsFirstDeposit] = useState(true);
  const [guideLang, setGuideLang] = useState<"both" | "en" | "ne">("both");
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const [oxaRes, regRes] = await Promise.all([
        apiClient.get('/payment/easypay/user?limit=1000'),
        apiClient.get('/payment?limit=1000')
      ]);
      const oxa = (oxaRes.data.payments || []).map((p: any) => ({
        id: p.id,
        track_id: p.paymentId || p.trackId,
        amount: p.amount,
        currency: p.currency,
        status: p.status?.toLowerCase() === 'paid' ? 'completed' : p.status?.toLowerCase(),
        createdAt: p.createdAt,
        type: 'deposit',
        method: 'crypto'
      }));
      const reg = (regRes.data.payments || []).map((p: any) => ({
        id: p.transactionId,
        track_id: p.transactionId,
        amount: p.amount,
        currency: p.currency,
        status: p.status === 'success' ? 'completed' : p.status,
        createdAt: p.createdAt,
        type: 'deposit',
        method: 'fiat'
      }));
      const combined = [...oxa, ...reg].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setDbTransactions(combined);
      const hasCompleted = combined.some(t => t.status === 'completed');
      setIsFirstDeposit(!hasCompleted);
    } catch(e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  useEffect(() => {
    const pendingTxns = dbTransactions.filter(t => t.status === 'pending');
    if (pendingTxns.length > 0 && !pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(async () => {
        for (const t of pendingTxns) {
          if (t.track_id) await checkPayment(t.track_id);
        }
        await loadTransactions();
        await refreshProfile();
      }, 15000);
    } else if (pendingTxns.length === 0 && pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [dbTransactions, loadTransactions, refreshProfile]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ title: "Copied!", description: `${field} copied to clipboard` });
  };

  const getCryptoBonus = (amt: number) => {
    if (isFirstDeposit) return { percent: 10, amount: amt * 0.10 };
    return { percent: 0, amount: 0 };
  };

  const parsedAmount = parseFloat(amount) || 0;
  const cryptoBonus = getCryptoBonus(parsedAmount);

  const handleCreate = async () => {
    const num = parseFloat(amount);
    if (!num || num < 150) {
      toast({ title: "Invalid amount", description: `Minimum deposit is Rs150`, variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const res = await apiClient.post('/payment/initiate', { 
        amount: num,       // Send NPR amount; backend converts to USD for balance
        mobile: mobileNumber, 
        promoCode,
        currency: 'NPR' 
      });
      if (res.data?.redirect_url) {
        // Redirect to Shrigo payment gateway
        window.location.href = res.data.redirect_url;
      } else if (res.data) {
        toast({ title: "Success", description: "Payment request initiated successfully!" });
        setSelectedMethod(null);
        setAmount("");
        setMobileNumber("");
        setPromoCode("");
        setTimeout(() => loadTransactions(), 1000);
      } else {
        toast({ title: "Error", description: "Failed to create payment", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || e.message || "Failed to create payment", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const refreshStatus = useCallback(async (trackId: string) => {
    setCheckingStatus(true);
    try {
      const res = await checkPayment(trackId);
      const newStatus = res.data?.status || "Waiting";
      if (activePayment?.trackId === trackId) {
        setActivePayment((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
      await loadTransactions();
      await refreshProfile();
      if (newStatus.toLowerCase() === 'paid' || newStatus.toLowerCase() === 'complete') {
        toast({ title: "Payment Confirmed!", description: "Funds and bonus have been added to your balance." });
      }
    } catch {
      toast({ title: "Error", description: "Could not check payment status", variant: "destructive" });
    } finally {
      setCheckingStatus(false);
    }
  }, [activePayment, loadTransactions, refreshProfile]);

  const refreshAll = async () => {
    for (const t of dbTransactions.filter(t => t.status === 'pending')) {
      if (t.track_id) await refreshStatus(t.track_id);
    }
  };

  const openPaymentFromDb = (t: any) => {
    setActivePayment({
      trackId: t.track_id || '',
      amount: t.amount?.toString() || '0',
      currency: t.currency || 'USDT',
      address: t.address || '',
      qrCode: '',
      createdAt: new Date(t.createdAt).toLocaleString(),
      status: t.status,
      network: t.network,
    });
    setModalOpen(true);
  };

  const statusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "paid" || s === "complete" || s === "completed" || s === "confirming") return "text-emerald-600 bg-emerald-500/10";
    if (s === "expired" || s === "failed") return "text-destructive bg-destructive/10";
    return "text-[hsl(var(--fame-warning))] bg-[hsl(var(--fame-warning))]/10";
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with fade-in */}
      <div className="animate-fade-in">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Add Funds</h1>
        <p className="text-sm text-muted-foreground mb-6">Deposit funds to your account</p>
      </div>

      {/* Balance Card — subtle hover lift + shine */}
      <div className="animate-fade-in rounded-2xl bg-gradient-primary p-5 sm:p-6 text-primary-foreground mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.4)] hover:-translate-y-0.5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center transition-transform duration-300 hover:rotate-12">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="text-sm opacity-80">Available Balance</div>
        </div>
        <div className="text-3xl sm:text-4xl font-bold tracking-tight">{formatCurrency(profile?.balance)}</div>
      </div>

      {/* Bonus Banner
      <div className="animate-fade-in [animation-delay:100ms] rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6 flex items-start gap-3 transition-all duration-300 hover:bg-primary/8 hover:border-primary/30">
        <Percent className="h-5 w-5 text-primary shrink-0 mt-0.5 transition-transform duration-300 hover:scale-110" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isFirstDeposit ? "Bonus on 1st Deposit" : "No Active Bonus"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isFirstDeposit
              ? "10% bonus on your 1st wallet deposit."
              : "Bonuses are only available on your first deposit."}
          </p>
        </div>
      </div> */}
      {/* Payment Guide & Promo Code Info Box (Bilingual: English & Nepali with live toggle & mobile responsive design) */}
      <div className="animate-fade-in [animation-delay:150ms] rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-sm p-3.5 sm:p-5 md:p-6 mb-5 sm:mb-6 shadow-sm overflow-hidden">
        {/* Header with Title, Collapse Toggle, and Language Switcher */}
        <div className="flex flex-col gap-3 pb-3 sm:pb-4 border-b border-border/60">
          <div className="flex items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-semibold text-foreground leading-tight">
                  {guideLang === "ne"
                    ? "भुक्तानी लोड गर्ने प्रक्रिया र प्रोमो कोड जानकारी"
                    : guideLang === "en"
                    ? "Payment Guide & Promo Code Benefits"
                    : "Payment Guide & Promo Code (भुक्तानी र प्रोमो कोड)"}
                </h2>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-none">
                  {guideLang === "ne"
                    ? "सजिलैसँग ब्यालेन्स लोड गर्न र अतिरिक्त बोनस पाउन तलका निर्देशनहरू हेर्नुहोस्"
                    : guideLang === "en"
                    ? "Learn how to add balance quickly and unlock extra bonuses with promo codes"
                    : "How to add balance & get bonuses • ब्यालेन्स लोड र बोनस पाउने तरिका"}
                </p>
              </div>
            </div>

            {/* Quick collapse/expand button */}
            <button
              type="button"
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-border/80 bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all shrink-0 active:scale-95"
              aria-label={isGuideOpen ? "Collapse guide" : "Expand guide"}
            >
              <span className="hidden xs:inline text-[11px] font-medium">
                {isGuideOpen ? (guideLang === "ne" ? "लुकाउनुहोस्" : "Collapse") : (guideLang === "ne" ? "हेर्नुहोस्" : "Expand")}
              </span>
              {isGuideOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Language Switcher Pills (Equal width 3-col on mobile, inline on sm+) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
            <div className="grid grid-cols-3 sm:inline-flex w-full sm:w-auto items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setGuideLang("en")}
                className={`py-1.5 sm:py-1 px-2.5 text-xs rounded-lg font-medium transition-all duration-200 text-center flex items-center justify-center min-h-[34px] sm:min-h-0 ${
                  guideLang === "en"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setGuideLang("ne")}
                className={`py-1.5 sm:py-1 px-2.5 text-xs rounded-lg font-medium transition-all duration-200 text-center flex items-center justify-center min-h-[34px] sm:min-h-0 ${
                  guideLang === "ne"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                नेपाली
              </button>
              <button
                type="button"
                onClick={() => setGuideLang("both")}
                className={`py-1.5 sm:py-1 px-2.5 text-xs rounded-lg font-medium transition-all duration-200 text-center flex items-center justify-center min-h-[34px] sm:min-h-0 ${
                  guideLang === "both"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Both / दुवै
              </button>
            </div>
          </div>
        </div>

        {/* Collapsed State Summary prompt */}
        {!isGuideOpen && (
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="w-full mt-3 pt-1 text-left flex items-center justify-between text-xs text-primary hover:underline group"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              {guideLang === "ne" ? "४-चरण भुक्तानी र प्रोमो कोड जानकारी हेर्नुहोस् (विस्तृत)" : "View 4-step payment guide & promo code benefits (Tap to expand)"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        )}

        {/* Expanded Content */}
        {isGuideOpen && (
          <div className="animate-fade-in">
            {/* Steps to Load Payment */}
            <div className="mt-3.5 sm:mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 sm:mb-3 flex items-center gap-1.5 flex-wrap">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                {guideLang === "ne"
                  ? "रकम लोड गर्ने सरल प्रक्रिया (४ चरणहरू)"
                  : guideLang === "en"
                  ? "How to Load Payment (4 Simple Steps)"
                  : "How to Load Payment / रकम लोड गर्ने सरल प्रक्रिया"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {/* Step 1 */}
                <div className="rounded-xl border border-border/70 bg-secondary/35 hover:bg-secondary/50 p-3 sm:p-3.5 flex flex-col justify-between hover:border-primary/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                        Step 1 / चरण १
                      </span>
                      <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    </div>
                    {(guideLang === "en" || guideLang === "both") && (
                      <p className="text-xs font-semibold text-foreground mb-0.5 sm:mb-1">
                        Enter Amount & Mobile
                      </p>
                    )}
                    {(guideLang === "ne" || guideLang === "both") && (
                      <p className="text-xs font-semibold text-primary mb-1">
                        रकम र मोबाइल नम्बर राख्नुहोस्
                      </p>
                    )}
                    {(guideLang === "en" || guideLang === "both") && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed break-words">
                        Type deposit amount (min Rs. 150) and your mobile number for reference.
                      </p>
                    )}
                    {(guideLang === "ne" || guideLang === "both") && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 break-words">
                        न्यूनतम रु १५० रकम र आफ्नो मोबाइल नम्बर प्रविष्ट गर्नुहोस्।
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 2 */}
                <div className="rounded-xl border border-border/70 bg-secondary/35 hover:bg-secondary/50 p-3 sm:p-3.5 flex flex-col justify-between hover:border-primary/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                        Step 2 / चरण २
                      </span>
                      <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                    </div>
                    {(guideLang === "en" || guideLang === "both") && (
                      <p className="text-xs font-semibold text-foreground mb-0.5 sm:mb-1">
                        Apply Promo Code
                      </p>
                    )}
                    {(guideLang === "ne" || guideLang === "both") && (
                      <p className="text-xs font-semibold text-primary mb-1">
                        प्रोमो कोड राख्नुहोस् (ऐच्छिक)
                      </p>
                    )}
                    {(guideLang === "en" || guideLang === "both") && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed break-words">
                        Enter any valid promo code to receive instant extra bonus funds in your wallet.
                      </p>
                    )}
                    {(guideLang === "ne" || guideLang === "both") && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 break-words">
                        वालेटमा थप बोनस रकम पाउन उपलब्ध प्रोमो कोड यहाँ राख्नुहोस्।
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 3 */}
                <div className="rounded-xl border border-border/70 bg-secondary/35 hover:bg-secondary/50 p-3 sm:p-3.5 flex flex-col justify-between hover:border-primary/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                        Step 3 / चरण ३
                      </span>
                      <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
                    </div>
                    {(guideLang === "en" || guideLang === "both") && (
                      <p className="text-xs font-semibold text-foreground mb-0.5 sm:mb-1">
                        Click Proceed & Scan QR
                      </p>
                    )}
                    {(guideLang === "ne" || guideLang === "both") && (
                      <p className="text-xs font-semibold text-primary mb-1">
                        Proceed थिची QR स्क्यान गर्नुहोस्
                      </p>
                    )}
                    {(guideLang === "en" || guideLang === "both") && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed break-words">
                        Click "Proceed to Pay" and scan the QR via eSewa, Khalti, or mobile banking.
                      </p>
                    )}
                    {(guideLang === "ne" || guideLang === "both") && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 break-words">
                        "Proceed to Pay" थिचेर eSewa, Khalti वा बैंकिङबाट QR स्क्यान गरी तिर्नुहोस्।
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 4 */}
                <div className="rounded-xl border border-border/70 bg-secondary/35 hover:bg-secondary/50 p-3 sm:p-3.5 flex flex-col justify-between hover:border-primary/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                        Step 4 / चरण ४
                      </span>
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" />
                    </div>
                    {(guideLang === "en" || guideLang === "both") && (
                      <p className="text-xs font-semibold text-foreground mb-0.5 sm:mb-1">
                        Fast / Instant Credit
                      </p>
                    )}
                    {(guideLang === "ne" || guideLang === "both") && (
                      <p className="text-xs font-semibold text-primary mb-1">
                        वालेटमा ब्यालेन्स जम्मा
                      </p>
                    )}
                    {(guideLang === "en" || guideLang === "both") && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed break-words">
                        Once payment is sent, your balance is credited promptly. Track in history below.
                      </p>
                    )}
                    {(guideLang === "ne" || guideLang === "both") && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 break-words">
                        भुक्तानी पूरा भएपछि वालेट ब्यालेन्स तुरुन्त थपिनेछ। तल इतिहासमा हेर्न सकिन्छ।
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Code Benefits & Importance Section */}
            <div className="mt-3.5 sm:mt-4 rounded-xl border border-primary/25 bg-gradient-to-br sm:bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 sm:p-4">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                      <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        {guideLang === "ne"
                          ? "प्रोमो कोड किन महत्त्वपूर्ण छ? (Importance of Promo Code)"
                          : guideLang === "en"
                          ? "Why is Promo Code Important? (Max Value)"
                          : "Importance of Promo Code / प्रोमो कोडको महत्त्व र फाइदाहरू"}
                      </span>
                    </h4>
                    <span className="self-start sm:self-auto text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary whitespace-nowrap">
                      {guideLang === "ne" ? "बोनस र छुट" : "Extra Value & Bonus"}
                    </span>
                  </div>

                  {(guideLang === "en" || guideLang === "both") && (
                    <div className="space-y-1.5 text-[11px] sm:text-xs text-muted-foreground leading-relaxed break-words">
                      <p className="text-foreground/90 font-medium">
                        ✨ <strong className="text-foreground">Extra Bonus Balance:</strong> Applying an active promo code instantly credits extra cash/bonus percentage to your wallet on top of what you pay (e.g. 5% – 15% bonus).
                      </p>
                      <p>
                        💰 <strong className="text-foreground">More Services for Less Money:</strong> Higher balance means you get more followers, likes, views, and engagements without increasing your spending budget.
                      </p>
                      <p>
                        📢 <strong className="text-foreground">Where to Find Codes:</strong> Check our official Telegram channel and holiday campaign announcements for the latest exclusive coupon codes!
                      </p>
                    </div>
                  )}

                  {guideLang === "both" && <div className="border-t border-border/60 my-2" />}

                  {(guideLang === "ne" || guideLang === "both") && (
                    <div className="space-y-1.5 text-[11px] sm:text-xs text-muted-foreground leading-relaxed break-words">
                      <p className="text-foreground/90 font-medium">
                        ✨ <strong className="text-foreground">अतिरिक्त वालेट बोनस:</strong> प्रोमो कोड प्रयोग गर्दा तपाईंले जम्मा गरेको रकममा थप बोनस रकम (जस्तै ५% देखि १५% सम्म) निःशुल्क प्राप्त हुन्छ।
                      </p>
                      <p>
                        💰 <strong className="text-foreground">कम खर्चमा बढी सेवा:</strong> थप ब्यालेन्सले गर्दा तपाईंले सस्तो मूल्यमा धेरै लाइक, फलोअर्स, भ्युज तथा सामाजिक सञ्जालका सेवाहरू लिन सक्नुहुन्छ।
                      </p>
                      <p>
                        📢 <strong className="text-foreground">कोडहरू कसरी पाउने?:</strong> हाम्रा आधिकारिक टेलिग्राम च्यानल, चाडपर्व तथा विशेष अफरहरूमा प्रोमो कोड उपलब्ध गराइन्छ। भुक्तानी अघि कोड राख्न नबिर्सनुहोस्!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Support & Testing Notice */}
            <div className="mt-3 pt-2.5 sm:pt-3 border-t border-border/60 flex items-start gap-2 text-[11px] sm:text-xs text-muted-foreground break-words">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed break-words">
                {guideLang === "ne" ? (
                  <>कुनै पनि सेवाहरू अर्डर गर्नु अघि, कृपया पहिले कम दरका सेवाहरूले काम गरिरहेका छन् वा छैनन् परीक्षण गर्नुहोस्। तपाईंले आफ्नो टिकट (Support Ticket) अंग्रेजी र नेपाली दुवै भाषामा लेख्न सक्नुहुन्छ।</>
                ) : guideLang === "en" ? (
                  <>Before ordering any services, please check first if low rate services are working properly. You can write your support ticket in both English and Nepali anytime.</>
                ) : (
                  <>
                    <span className="font-medium text-foreground">Notice / सूचना:</span> Before ordering any services, please check first if low rate services are working or not. Support tickets can be submitted in both English and Nepali. <br/>
                    कुनै पनि सेवाहरू अर्डर गर्नु अघि, कृपया पहिले कम दरका सेवाहरूले काम गरिरहेका छन् वा छैनन् जाँच गर्नुहोस्। तपाईंले आफ्नो टिकट अंग्रेजी र नेपाली दुवै भाषामा लेख्न सक्नुहुन्छ।
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Manual Form */}
      {selectedMethod === "manual" && (
        <div className="mb-6 animate-fade-in">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-300 hover:shadow-[0_4px_20px_-6px_hsl(var(--foreground)/0.08)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-[hsl(var(--fame-orange))]/10 flex items-center justify-center text-lg transition-transform duration-300 hover:scale-110 hover:rotate-6"><DollarSign className="h-5 w-5" /></div>
              <div>
                <h2 className="font-semibold">Manual Transfer</h2>
                <p className="text-xs text-muted-foreground">Send payment via local gateway</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Amount (NPR)</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs</span>
                  <Input placeholder="Enter amount (min Rs150)" className="pl-7 bg-secondary border-border h-12 transition-all duration-200 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]" type="number" min={150} step="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
              </div>
              
              <div>
                <Label>Mobile Number</Label>
                <Input placeholder="Enter your mobile number" className="bg-secondary border-border h-12 transition-all duration-200 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] mt-1.5" type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
              </div>
              
              <div>
                <Label>Promo Code (Optional)</Label>
                <Input placeholder="Enter promo code" className="bg-secondary border-border h-12 transition-all duration-200 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] mt-1.5" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
              </div>

              {/* Bonus Preview */}
              {parsedAmount >= 150 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 animate-scale-in">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Deposit Amount</span>
                    <span className="font-medium">Rs {parsedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-primary font-medium flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5" /> Bonus ({cryptoBonus.percent}%)
                    </span>
                    <span className="text-primary font-semibold">+Rs {cryptoBonus.amount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border mt-2 pt-2 flex items-center justify-between text-sm font-bold">
                    <span>Total Credit</span>
                    <span>Rs {(parsedAmount + cryptoBonus.amount).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end text-xs text-muted-foreground pt-1 mb-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure</span>
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Instant</span>
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Local Gateway</span>
                </div>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full h-12 transition-all duration-200 hover:shadow-lg hover:-translate-y-px active:scale-[0.97]">
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Proceed to Pay
              </Button>
            </div>
          </div>
        </div>
      )}

          {/* Important Notice Banner */}
      <div className="animate-fade-in [animation-delay:150ms] rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6 flex items-start gap-3 transition-all duration-300 hover:bg-primary/8 hover:border-primary/30">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5 transition-transform duration-300 hover:scale-110" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Important Notice / महत्त्वपूर्ण सूचना
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Before ordering any services, please check first if low rate services are working or not. You can write your support ticket in both English and Nepali. <br/>
            कुनै पनि सेवाहरू अर्डर गर्नु अघि, कृपया पहिले कम दरका सेवाहरूले काम गरिरहेका छन् वा छैनन् जाँच गर्नुहोस्। तपाईंले आफ्नो टिकट अंग्रेजी र नेपाली दुवै भाषामा लेख्न सक्नुहुन्छ।
          </p>
        </div>
      </div>

      {/* Bonus Banner */}
      <div className="animate-fade-in [animation-delay:100ms] rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6 flex items-start gap-3 transition-all duration-300 hover:bg-primary/8 hover:border-primary/30">
        <Percent className="h-5 w-5 text-primary shrink-0 mt-0.5 transition-transform duration-300 hover:scale-110" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isFirstDeposit ? "Bonus on 1st Deposit" : "No Active Bonus"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isFirstDeposit
              ? "10% bonus on your 1st wallet deposit."
              : "Bonuses are only available on your first deposit."}
          </p>
        </div>
      </div>


      {/* Payment Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Payment Details</span>
              <Button size="sm" onClick={() => setModalOpen(false)} className="min-h-[44px] transition-all duration-200 hover:shadow-md active:scale-[0.97]">Done</Button>
            </DialogTitle>
          </DialogHeader>
          {activePayment && (
            <div className="space-y-0 divide-y divide-border animate-fade-in">
              {(activePayment.qrCode || activePayment.address) && (
                <div className="pb-4 flex flex-col items-center gap-3">
                  <span className="text-sm text-muted-foreground">Scan to Pay</span>
                  <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm transition-transform duration-300 hover:scale-[1.02]">
                    <QRCodeSVG value={activePayment.qrCode || activePayment.address} size={140} level="H" bgColor="#ffffff" fgColor="#000000" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center px-2">
                    Send exactly <span className="text-foreground font-medium">{activePayment.amount} {activePayment.currency}</span> to the address below
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between py-3 gap-2">
                <span className="text-xs text-muted-foreground shrink-0">Order ID</span>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-xs font-mono truncate">{activePayment.trackId}</span>
                  <button onClick={() => copyToClipboard(activePayment.trackId, "Order ID")} className="text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-90 p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0">
                    {copiedField === "Order ID" ? <Check className="h-4 w-4 text-primary animate-scale-in" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-muted-foreground">Wallet</span>
                <span className="text-sm font-medium">{activePayment.currency}{activePayment.network ? ` (${activePayment.network})` : ""}</span>
              </div>
              <div className="flex items-center justify-between py-3 gap-2">
                <span className="text-xs text-muted-foreground shrink-0">Amount</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{activePayment.amount}</span>
                  <button onClick={() => copyToClipboard(activePayment.amount, "Amount")} className="text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-90 p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0">
                    {copiedField === "Amount" ? <Check className="h-4 w-4 text-primary animate-scale-in" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {activePayment.address && (
                <div className="flex flex-col gap-1.5 py-3">
                  <span className="text-xs text-muted-foreground">Address</span>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs font-mono break-all leading-relaxed flex-1">{activePayment.address}</span>
                    <button onClick={() => copyToClipboard(activePayment.address, "Address")} className="text-muted-foreground hover:text-foreground transition-all duration-200 shrink-0 active:scale-90 p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center">
                      {copiedField === "Address" ? <Check className="h-4 w-4 text-primary animate-scale-in" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs rounded-full px-3 py-1 font-medium uppercase transition-all duration-300 ${statusColor(activePayment.status)}`}>{activePayment.status}</span>
                  <button onClick={() => refreshStatus(activePayment.trackId)} className="text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-90 p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center" disabled={checkingStatus}>
                    <RefreshCw className={`h-4 w-4 ${checkingStatus ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment History */}
      <div className="animate-fade-in [animation-delay:200ms] rounded-2xl border border-border bg-card p-5 sm:p-6 mb-6 transition-all duration-300 hover:shadow-[0_4px_20px_-6px_hsl(var(--foreground)/0.06)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Payment History</h2>
          <Button variant="ghost" size="icon" onClick={refreshAll} className="h-10 w-10 transition-all duration-200 hover:rotate-180 active:scale-90">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {dbTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No payments yet. Select a method above to add funds.</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {dbTransactions.map((t, i) => (
              <button
                key={t.id}
                onClick={() => openPaymentFromDb(t)}
                className="w-full flex items-center justify-between rounded-xl bg-secondary p-3 sm:p-4 text-left min-h-[56px] transition-all duration-200 hover:bg-muted hover:-translate-y-px hover:shadow-sm active:scale-[0.98] animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[hsl(var(--fame-orange))]/10 flex items-center justify-center text-[hsl(var(--fame-orange))] text-sm font-bold shrink-0 transition-transform duration-200 hover:scale-110">₿</div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{formatCurrency(Number(t.amount))}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <span className={`text-xs rounded-full px-2.5 py-1.5 font-medium shrink-0 ml-2 ${statusColor(t.status)}`}>{t.status}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contact Support Section */}
      <div className="animate-fade-in [animation-delay:250ms] rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-300 hover:shadow-[0_4px_20px_-6px_hsl(var(--foreground)/0.06)]">
        <h2 className="text-base font-bold mb-1">Need Help with a Payment?</h2>
        <p className="text-sm text-muted-foreground mb-4">If you encounter any issues, reach out through any of these channels.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="https://t.me/smmstable"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl bg-secondary p-4 transition-all duration-200 hover:bg-muted hover:-translate-y-px hover:shadow-sm active:scale-[0.98]"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Telegram</div>
              <div className="text-xs text-muted-foreground">@smmstable</div>
            </div>
          </a>
          <a
            href="mailto:support@smmstable.com"
            className="group flex items-center gap-3 rounded-xl bg-secondary p-4 transition-all duration-200 hover:bg-muted hover:-translate-y-px hover:shadow-sm active:scale-[0.98]"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Email</div>
              <div className="text-xs text-muted-foreground">support@smmstable.com</div>
            </div>
          </a>
          <a
            href="tel:+16414358478"
            className="group flex items-center gap-3 rounded-xl bg-secondary p-4 transition-all duration-200 hover:bg-muted hover:-translate-y-px hover:shadow-sm active:scale-[0.98]"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Phone</div>
              <div className="text-xs text-muted-foreground">+1 (641) 435-8478</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
