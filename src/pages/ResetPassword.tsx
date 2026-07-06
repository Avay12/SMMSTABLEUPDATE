import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import logo from "@/assets/logo.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(true);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const emailParam = searchParams.get('email');
  const codeParam = searchParams.get('code');

  useEffect(() => {
    if (!emailParam || !codeParam) {
      setTokenValid(false);
    }

    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => {
      clearTimeout(t);
    };
  }, [emailParam, codeParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: emailParam,
        code: codeParam,
        newPassword: password,
      });
      setDone(true);
      setTimeout(() => navigate("/auth"), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Something went wrong.");
      if (err.response?.status === 400 || err.response?.status === 401) {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-gradient-to-br from-secondary/40 via-background to-secondary/30">
      <div className="fixed inset-0 opacity-[0.018] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-7 sm:p-9 shadow-xl shadow-foreground/[0.04]">
          <div className="text-center mb-7">
            <img src={logo} alt="Smmstable" className="h-11 w-11 rounded-full mx-auto mb-4 ring-2 ring-border/40 ring-offset-2 ring-offset-background" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Set new password</h1>
          </div>

          {!tokenValid ? (
            <div className="text-center py-6 animate-in fade-in duration-500">
              <AlertTriangle className="h-12 w-12 text-[hsl(var(--fame-warning))] mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-1.5">Link expired</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                This password reset link is no longer valid. Please request a new one.
              </p>
              <Link to="/forgot-password" className="inline-block mt-6">
                <Button className="rounded-xl active:scale-[0.97] transition-all">
                  Request New Link
                </Button>
              </Link>
            </div>
          ) : done ? (
            <div className="text-center py-6 animate-in fade-in duration-500">
              <CheckCircle2 className="h-12 w-12 text-[hsl(var(--fame-success))] mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-1.5">Password updated</h2>
              <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label className="text-sm font-medium text-foreground">New Password</Label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-12 h-12 text-base bg-secondary/50 border-border/70 rounded-xl focus:border-primary/50 transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    tabIndex={1}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">Confirm Password</Label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showCf ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-12 h-12 text-base bg-secondary/50 border-border/70 rounded-xl focus:border-primary/50 transition-colors"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    tabIndex={2}
                  />
                  <button type="button" onClick={() => setShowCf(!showCf)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                    {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirm.length > 0 && password !== confirm && (
                  <p className="text-xs text-destructive mt-1 pl-1">Passwords don't match</p>
                )}
                {error && <p className="text-xs text-destructive mt-1 pl-1">{error}</p>}
              </div>

              <Button
                className="w-full h-13 text-base rounded-xl active:scale-[0.97] hover:scale-[1.01] transition-all font-semibold shadow-md shadow-primary/15 mt-1"
                disabled={loading}
                type="submit"
                tabIndex={3}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
