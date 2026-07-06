import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, X, ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";

interface PopupData {
  id: string;
  title: string;
  message: string;
}

const DepositBonusPopup = () => {
  const [open, setOpen] = useState(false);
  const [customPopups, setCustomPopups] = useState<PopupData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Always show on login/signup — only dismiss per session
    const dismissed = sessionStorage.getItem("deposit_bonus_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    apiClient.get("/popups")
      .then((response) => {
        if (response.data) setCustomPopups(response.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("deposit_bonus_dismissed", "true");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-primary/20 bg-card">
        <button onClick={handleClose} className="absolute right-3 top-3 z-10 rounded-full p-1.5 hover:bg-muted transition-colors" aria-label="Close">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Premium header */}
        <div className="relative p-6 pb-5 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/4" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold tracking-tight">Welcome Bonus</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1.5">
                Get extra credit on your first deposit
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-3">
          {/* Crypto bonus */}
          <div className="rounded-xl border border-border bg-secondary/30 p-4 flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-[hsl(var(--fame-orange))]/10 flex items-center justify-center shrink-0 text-[hsl(var(--fame-orange))] font-bold text-sm">
              ₿
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Balance Deposits</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="text-primary font-bold">10%</span> bonus on your 1st deposit
              </p>
            </div>
          </div>

          {/* Card bonus */}
          <div className="rounded-xl border border-border bg-secondary/30 p-4 flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Card Payments</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="text-primary font-bold">5%</span> bonus on your 1st deposit
              </p>
            </div>
          </div>

          {/* Custom admin popups */}
          {customPopups.map(p => (
            <div key={p.id} className="rounded-xl border border-primary/10 bg-primary/5 p-3">
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.message}</p>
            </div>
          ))}

          <Button
            className="w-full h-11 mt-1"
            onClick={() => { handleClose(); navigate("/dashboard/add-funds"); }}
          >
            Deposit Now <ArrowRight className="h-4 w-4 ml-1" />
          </Button>

          <button onClick={handleClose} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepositBonusPopup;
