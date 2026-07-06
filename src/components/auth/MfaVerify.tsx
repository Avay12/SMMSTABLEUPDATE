import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Loader2, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MfaVerifyProps {
  factorId: string;
  onVerified: () => void;
  onCancel: () => void;
}

const MfaVerify = ({ factorId, onVerified, onCancel }: MfaVerifyProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    try {
      await apiClient.post("/auth/mfa/verify", { factorId, code });
      onVerified();
    } catch (err: any) {
      toast({ title: "Invalid code", description: err.message || "Please try again.", variant: "destructive" });
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="relative inline-block mb-2">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 blur-sm -z-10 animate-pulse" />
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="relative group">
          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="pl-10 h-12 text-center text-lg tracking-[0.5em] font-mono bg-secondary/40 border-border/60 rounded-xl focus:border-primary/50 focus:bg-background/80 transition-all"
            autoFocus
            autoComplete="one-time-code"
          />
        </div>

        <Button
          type="submit"
          disabled={code.length !== 6 || loading}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Verify
        </Button>

        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in with a different account
        </button>
      </form>
    </div>
  );
};

export default MfaVerify;
