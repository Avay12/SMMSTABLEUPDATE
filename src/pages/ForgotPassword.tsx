import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import logo from "@/assets/logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-gradient-to-br from-secondary/40 via-background to-secondary/30">
      <div className="fixed inset-0 opacity-[0.018] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <Link to="/auth" className="relative z-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 md:mb-8 active:scale-[0.97] py-2">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-7 sm:p-9 shadow-xl shadow-foreground/[0.04]">
          <div className="text-center mb-7">
            <img src={logo} alt="Smmstable" className="h-11 w-11 rounded-full mx-auto mb-4 ring-2 ring-border/40 ring-offset-2 ring-offset-background" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Reset your password</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {sent ? (
            <div className="text-center py-6 animate-in fade-in duration-500">
              <CheckCircle2 className="h-12 w-12 text-[hsl(var(--fame-success))] mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-1.5">Check your inbox</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>. It may take a minute to arrive.
              </p>
              <Link to="/auth" className="inline-block mt-6">
                <Button variant="outline" className="rounded-xl active:scale-[0.97] transition-all">
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label className="text-sm font-medium text-foreground">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    type="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    className="pl-10 h-12 text-base bg-secondary/50 border-border/70 rounded-xl focus:border-primary/50 transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    tabIndex={1}
                  />
                </div>
                {error && <p className="text-xs text-destructive mt-1 pl-1">{error}</p>}
              </div>

              <Button
                className="w-full h-13 text-base rounded-xl active:scale-[0.97] hover:scale-[1.01] transition-all font-semibold shadow-md shadow-primary/15 mt-1"
                disabled={loading}
                type="submit"
                tabIndex={2}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Reset Link
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
