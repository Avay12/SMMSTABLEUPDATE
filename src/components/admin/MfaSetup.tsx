import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Shield, Loader2, CheckCircle2, Trash2, Smartphone, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const MfaSetup = () => {
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [hasSecret, setHasSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollData, setEnrollData] = useState<{ secret: string; qrCode: string; otpauthUrl: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [unenrollDialog, setUnenrollDialog] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [copied, setCopied] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/mfa/status');
      setIsMfaEnabled(data.isMfaEnabled);
      setHasSecret(data.hasSecret);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { loadStatus(); }, []);

  const startEnroll = async () => {
    setEnrolling(true);
    try {
      const { data } = await apiClient.post('/mfa/setup', {});
      setEnrollData({ secret: data.secret, qrCode: data.qrCode, otpauthUrl: data.otpauthUrl });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setEnrolling(false);
    }
  };

  const confirmEnroll = async () => {
    if (verifyCode.length !== 6 || !enrollData) return;
    setVerifying(true);
    try {
      await apiClient.post('/mfa/verify-enable', { token: verifyCode });
      toast({ title: "2FA Enabled", description: "Google Authenticator is now active." });
      setEnrollData(null);
      setVerifyCode("");
      loadStatus();
    } catch (err: any) {
      toast({ title: "Invalid code", description: "Please try again.", variant: "destructive" });
      setVerifyCode("");
    } finally {
      setVerifying(false);
    }
  };

  const handleUnenroll = async () => {
    if (disableCode.length !== 6) {
      toast({ title: "Enter your 6-digit code first", variant: "destructive" });
      return;
    }
    setUnenrolling(true);
    try {
      await apiClient.delete('/mfa/disable', { data: { token: disableCode } });
      toast({ title: "2FA Disabled", description: "Two-factor authentication removed." });
      setUnenrollDialog(false);
      setDisableCode("");
      loadStatus();
    } catch (err: any) {
      toast({ title: "Error", description: "Invalid code or something went wrong.", variant: "destructive" });
    } finally {
      setUnenrolling(false);
    }
  };

  const copySecret = () => {
    if (!enrollData) return;
    navigator.clipboard.writeText(enrollData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold">Two-Factor Authentication</h3>
          <p className="text-xs text-muted-foreground">Google Authenticator / TOTP</p>
        </div>
      </div>

      {isMfaEnabled ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl bg-[hsl(var(--fame-success))]/10 p-3">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--fame-success))]" />
            <span className="text-sm font-medium text-[hsl(var(--fame-success))]">2FA is enabled</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Your account is protected with Google Authenticator. You'll need to enter a code from the app each time you sign in.
          </p>
          <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => setUnenrollDialog(true)}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove 2FA
          </Button>
        </div>
      ) : enrollData ? (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">Scan this QR code with your authenticator app:</p>
            <div className="inline-block p-4 bg-white rounded-2xl shadow-sm">
              <img src={enrollData.qrCode} alt="QR Code" className="w-44 h-44 object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={enrollData.secret}
              className="font-mono text-xs bg-secondary border-border rounded-xl"
            />
            <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={copySecret}>
              {copied ? <Check className="h-3.5 w-3.5 text-[hsl(var(--fame-success))]" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Or manually enter the secret key above into your app.</p>
          <div>
            <p className="text-sm font-medium mb-1.5">Enter verification code:</p>
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="font-mono text-center tracking-[0.3em] bg-secondary border-border rounded-xl h-11"
                autoFocus
              />
              <Button onClick={confirmEnroll} disabled={verifyCode.length !== 6 || verifying} className="rounded-xl h-11">
                {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null} Verify
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setEnrollData(null); setVerifyCode(""); }}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Add an extra layer of security by requiring a code from Google Authenticator when you sign in.
          </p>
          <Button onClick={startEnroll} disabled={enrolling} className="rounded-xl">
            {enrolling ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Smartphone className="h-4 w-4 mr-1.5" />}
            Enable 2FA
          </Button>
        </div>
      )}

      {/* Unenroll confirmation */}
      <Dialog open={unenrollDialog} onOpenChange={(o) => { setUnenrollDialog(o); if (!o) setDisableCode(""); }}>
        <DialogContent className="sm:max-w-xs max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive" /> Remove 2FA?
            </DialogTitle>
            <DialogDescription>
              Enter your current 6-digit authenticator code to confirm removal.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="font-mono text-center tracking-[0.3em] bg-secondary border-border rounded-xl h-11"
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => { setUnenrollDialog(false); setDisableCode(""); }}>Cancel</Button>
            <Button variant="destructive" className="rounded-xl" onClick={handleUnenroll} disabled={unenrolling}>
              {unenrolling && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />} Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default MfaSetup;
