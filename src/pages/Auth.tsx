import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  ArrowLeft, Mail, KeyRound, Eye, EyeOff, Loader2, User, Check, X, Shield, MailCheck,
} from "lucide-react";
import MfaVerify from "@/components/auth/MfaVerify";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import { apiClient } from "@/lib/apiClient";

/* ───── password strength ───── */
const getStrength = (pw: string) => {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
const strengthColor = [
  "bg-muted",
  "bg-destructive",
  "bg-[hsl(var(--fame-warning))]",
  "bg-[hsl(var(--fame-warning))]",
  "bg-[hsl(var(--fame-success))]",
  "bg-[hsl(var(--fame-success))]",
];

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const FloatingOrb = ({ className, delay = "0s" }: { className?: string; delay?: string }) => (
  <div
    className={`absolute rounded-full blur-3xl opacity-[0.07] pointer-events-none ${className}`}
    style={{
      animation: `float ${8 + Math.random() * 4}s ease-in-out ${delay} infinite`,
    }}
  />
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState("");

  const [emailTouched, setEmailTouched] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [switching, setSwitching] = useState(false);

  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => firstInput.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => firstInput.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [isLogin]);

  const usernameTimer = useRef<ReturnType<typeof setTimeout>>();
  const checkUsername = useCallback((val: string) => {
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    if (val.length < 3) { setUsernameAvailable(null); return; }
    setCheckingUsername(true);
    usernameTimer.current = setTimeout(async () => {
      // In a real app, query your API to check if username is available.
      // For now, assume it's available.
      setUsernameAvailable(true);
      setCheckingUsername(false);
    }, 500);
  }, []);

  const pwStrength = getStrength(password);
  const emailValid = isValidEmail(email);

  const handleToggle = () => {
    setSwitching(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setEmailTouched(false);
      setUsernameTouched(false);
      setPassword("");
      setConfirmPassword("");
      setSwitching(false);
    }, 250);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;

    if (!isLogin && password !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please re-enter your password.", variant: "destructive" });
      return;
    }
    if (!isLogin && username.length < 3) {
      toast({ title: "Username too short", description: "Must be at least 3 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await apiClient.post('/auth/login', { email, password });
        await refreshProfile();
        // Navigation is now handled by the useEffect watching `user`
      } else {
        await apiClient.post('/auth/register', { email, password, role: 'USER' });
        toast({ title: "Registration successful", description: "You can now log in." });
        setIsLogin(true);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Resend confirmation (API doesn't have this explicitly, dummy function)
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    toast({ title: "Email resent", description: "Check your inbox." });
    setResendCooldown(60);
  };

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
      <FloatingOrb className="w-80 h-80 bg-primary -top-20 -left-20" delay="0s" />
      <FloatingOrb className="w-96 h-96 bg-[hsl(var(--fame-orange))] -bottom-32 -right-32" delay="2s" />
      <FloatingOrb className="w-64 h-64 bg-primary top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" delay="4s" />

      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <Link
        to="/"
        className={`relative z-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all mb-6 md:mb-8 active:scale-[0.97] py-2 group ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
        style={{ transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)", transitionDelay: "0.1s" }}
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to home
      </Link>

      <div
        className={`w-full max-w-[420px] relative z-10 ${
          mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
        }`}
        style={{ transition: "all 0.7s cubic-bezier(0.34,1.56,0.64,1)", transitionDelay: "0.2s" }}
      >
        <div className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl shadow-foreground/[0.06] relative overflow-hidden">
          <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.06) 0%, transparent 40%, transparent 60%, hsl(var(--fame-orange) / 0.04) 100%)",
          }} />

          <div
            className={`relative z-10 transition-all duration-250 ${
              switching ? "opacity-0 scale-95 translate-y-2" : "opacity-100 scale-100 translate-y-0"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            {mfaRequired ? (
              /* ── MFA Verification Screen ── */
              <div className="animate-fade-in">
                <MfaVerify
                  factorId={mfaFactorId}
                  onVerified={() => navigate("/dashboard")}
                  onCancel={async () => {
                    await apiClient.post('/auth/logout').catch(() => {});
                    setMfaRequired(false);
                    setMfaFactorId("");
                  }}
                />
              </div>
            ) : emailSent ? (
              /* ── Check Your Email Screen ── */
              <div className="text-center animate-fade-in">
                <div className="relative inline-block mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <MailCheck className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(var(--fame-orange))]/10 blur-sm -z-10 animate-pulse" />
                </div>
                <h1
                  className="text-2xl md:text-[1.7rem] font-bold tracking-tight text-foreground mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Check your email
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  We sent a confirmation link to<br />
                  <span className="text-foreground font-medium">{email}</span>
                </p>

                <div className="bg-secondary/40 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Click the link in the email to verify your account, then come back here to sign in.
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-[3.25rem] text-base rounded-xl active:scale-[0.96] hover:scale-[1.01] transition-all font-semibold mb-4"
                  onClick={() => { setEmailSent(false); setIsLogin(true); }}
                >
                  Go to Sign In
                </Button>

                <p className="text-sm text-muted-foreground">
                  Didn't receive the email?{" "}
                  {resendCooldown > 0 ? (
                    <span className="text-muted-foreground/60">Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      onClick={handleResend}
                      className="text-primary hover:underline font-semibold transition-colors hover:text-primary/80"
                    >
                      Resend
                    </button>
                  )}
                </p>

                <button
                  onClick={() => { setEmailSent(false); }}
                  className="text-xs text-muted-foreground/60 hover:text-muted-foreground mt-4 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              /* ── Login / Signup Form ── */
              <>
            {/* header */}
            <div className="text-center mb-7">
              <div className="relative inline-block mb-4">
                <img
                  src={logo}
                  alt="Smmstable"
                  className="h-14 w-14 md:h-16 md:w-16 rounded-2xl mx-auto shadow-lg shadow-primary/10 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(var(--fame-orange))]/10 blur-sm -z-10" />
              </div>
              <h1
                className="text-2xl md:text-[1.7rem] font-bold tracking-tight text-foreground"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {isLogin ? "Welcome back" : "Join Smmstable"}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {isLogin ? "Sign in to access your dashboard" : "Create your account in seconds"}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} autoComplete="on">
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
                aria-hidden="true"
              />

              {/* Username (signup) */}
              {!isLogin && (
                <div className="animate-fade-in" style={{ animationDelay: "0.08s" }}>
                  <Label className="text-sm font-medium text-foreground">Username</Label>
                  <div className="relative mt-1.5 group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      ref={firstInput}
                      type="text"
                      inputMode="text"
                      placeholder="johndoe"
                      className="pl-10 pr-10 h-12 text-base bg-secondary/40 border-border/60 rounded-xl focus:border-primary/50 focus:bg-background/80 transition-all duration-300 hover:border-border"
                      value={username}
                      onChange={(e) => {
                        const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                        setUsername(v);
                        checkUsername(v);
                      }}
                      onBlur={() => setUsernameTouched(true)}
                      required
                      minLength={3}
                      maxLength={30}
                      autoComplete="username"
                      tabIndex={1}
                    />
                    {usernameTouched && username.length >= 3 && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-scale-in">
                        {checkingUsername ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : usernameAvailable ? (
                          <Check className="h-4 w-4 text-[hsl(var(--fame-success))]" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                      </span>
                    )}
                  </div>
                  {usernameTouched && username.length >= 3 && usernameAvailable === false && (
                    <p className="text-xs text-destructive mt-1 pl-1 animate-fade-in">Username is taken</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="animate-fade-in" style={{ animationDelay: isLogin ? "0.08s" : "0.12s" }}>
                <Label className="text-sm font-medium text-foreground">Email</Label>
                <div className="relative mt-1.5 group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    ref={isLogin ? firstInput : undefined}
                    type="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    className="pl-10 pr-10 h-12 text-base bg-secondary/40 border-border/60 rounded-xl focus:border-primary/50 focus:bg-background/80 transition-all duration-300 hover:border-border"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    required
                    autoComplete="email"
                    tabIndex={isLogin ? 1 : 2}
                  />
                  {emailTouched && email.length > 0 && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-scale-in">
                      {emailValid ? (
                        <Check className="h-4 w-4 text-[hsl(var(--fame-success))]" />
                      ) : (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                    </span>
                  )}
                </div>
                {emailTouched && email.length > 0 && !emailValid && (
                  <p className="text-xs text-destructive mt-1 pl-1 animate-fade-in">Enter a valid email address</p>
                )}
              </div>

              {/* Password */}
              <div className="animate-fade-in" style={{ animationDelay: isLogin ? "0.12s" : "0.16s" }}>
                <Label className="text-sm font-medium text-foreground">Password</Label>
                <div className="relative mt-1.5 group">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-12 h-12 text-base bg-secondary/40 border-border/60 rounded-xl focus:border-primary/50 focus:bg-background/80 transition-all duration-300 hover:border-border"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    tabIndex={isLogin ? 2 : 3}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {!isLogin && password.length > 0 && (
                  <div className="mt-2.5 space-y-1 animate-fade-in">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-500 ${
                            pwStrength >= i ? strengthColor[pwStrength] : "bg-muted"
                          }`}
                          style={{
                            transitionDelay: `${i * 50}ms`,
                            transform: pwStrength >= i ? "scaleY(1)" : "scaleY(0.6)",
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{strengthLabel[pwStrength]}</p>
                  </div>
                )}

                {isLogin && (
                  <div className="text-right mt-2">
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:underline font-medium transition-colors hover:text-primary/80"
                      tabIndex={5}
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>

              {/* Confirm password (signup) */}
              {!isLogin && (
                <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <Label className="text-sm font-medium text-foreground">Confirm Password</Label>
                  <div className="relative mt-1.5 group">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-12 h-12 text-base bg-secondary/40 border-border/60 rounded-xl focus:border-primary/50 focus:bg-background/80 transition-all duration-300 hover:border-border"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      tabIndex={4}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="text-xs text-destructive mt-1 pl-1 animate-fade-in">Passwords don't match</p>
                  )}
                </div>
              )}

              {/* Submit */}
              <div className="animate-fade-in pt-1" style={{ animationDelay: isLogin ? "0.16s" : "0.24s" }}>
                <Button
                  className="w-full h-[3.25rem] text-base rounded-xl active:scale-[0.96] hover:scale-[1.01] transition-all font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 relative overflow-hidden group"
                  disabled={loading}
                  type="submit"
                  tabIndex={6}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLogin ? "Sign In" : "Create Account"}
                </Button>
              </div>

              {/* OAuth */}
              <div className="animate-fade-in pt-4" style={{ animationDelay: isLogin ? "0.2s" : "0.28s" }}>
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-[3.25rem] text-base rounded-xl active:scale-[0.96] hover:scale-[1.01] transition-all font-semibold hover:-translate-y-0.5 bg-secondary/20 border-border/60"
                  onClick={() => {
                    const baseUrl = apiClient.defaults.baseURL || 'http://localhost:3000/api';
                    window.location.href = `${baseUrl}/oauth/google?site=smmstable`;
                  }}
                >
                  <GoogleIcon />
                  <span className="ml-2">Google</span>
                </Button>
              </div>
            </form>


            {/* toggle */}
            <div className="animate-fade-in" style={{ animationDelay: isLogin ? "0.24s" : "0.32s" }}>
              <p className="text-sm text-muted-foreground text-center mt-6">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={handleToggle}
                  className="text-primary hover:underline font-semibold py-1 transition-colors hover:text-primary/80"
                  tabIndex={7}
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
            </>
            )}
          </div>
        </div>

        <div
          className={`flex items-center justify-center gap-1.5 mt-5 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
          style={{ transition: "all 0.7s cubic-bezier(0.34,1.56,0.64,1)", transitionDelay: "0.5s" }}
        >
          <Shield className="h-3.5 w-3.5 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground/50 tracking-wide">
            Secured with end-to-end encryption
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};

export default Auth;
