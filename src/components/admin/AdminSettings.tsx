import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

import { motion } from "framer-motion";
import { Loader2, Settings, AlertTriangle, Shield, Power } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import MfaSetup from "./MfaSetup";

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [currentMargin, setCurrentMargin] = useState("1.5");
  const [marginInput, setMarginInput] = useState("1.5");
  const [savingMargin, setSavingMargin] = useState(false);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data: marginData } = await apiClient.get("/admin/settings/service_margin");
        if (marginData && marginData.value) {
          setCurrentMargin(marginData.value);
          setMarginInput(marginData.value);
        }
      } catch (e) {
        console.error("Failed to load margin", e);
      }
      
      try {
        const { data: maintData } = await apiClient.get("/admin/settings/maintenance_mode");
        if (maintData) setMaintenanceMode(maintData.value === "true");
      } catch (e) {
        console.error("Failed to load maintenance mode", e);
      }
    })();
  }, []);

  const saveMargin = async () => {
    const val = parseFloat(marginInput);
    if (isNaN(val) || val < 1) {
      toast({ title: "Invalid margin", description: "Must be at least 1.0", variant: "destructive" });
      return;
    }
    setSavingMargin(true);
    try {
      await apiClient.patch("/admin/settings/service_margin", { value: val.toString() });
      setCurrentMargin(val.toString());
      toast({ title: "Margin updated", description: `New margin: ${val}x (${((val - 1) * 100).toFixed(0)}% markup)` });
      queryClient.invalidateQueries({ queryKey: ["site-margin"] });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update margin", variant: "destructive" });
    } finally {
      setSavingMargin(false);
    }
  };

  const toggleMaintenance = async (enabled: boolean) => {
    setSavingMaintenance(true);
    try {
      await apiClient.patch("/admin/settings/maintenance_mode", { maintenance_mode: enabled });
      setMaintenanceMode(enabled);
      toast({ title: enabled ? "Maintenance Mode ON" : "Maintenance Mode OFF" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update maintenance mode", variant: "destructive" });
    } finally {
      setSavingMaintenance(false);
    }
  };

  const showConfirm = (title: string, desc: string, action: () => void) => {
    setConfirmTitle(title);
    setConfirmDesc(desc);
    setConfirmAction(() => action);
    setConfirmDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">System configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Markup */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Global Price Markup</h3>
              <p className="text-xs text-muted-foreground">Multiplier applied to all provider prices</p>
            </div>
          </div>
          <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
            Current markup: <span className="text-primary font-bold">{currentMargin}x</span> ({((parseFloat(currentMargin) - 1) * 100).toFixed(0)}% profit margin)
          </div>
          <div className="flex gap-2">
            <Input type="number" step="0.1" min="1" value={marginInput} onChange={(e) => setMarginInput(e.target.value)} className="bg-secondary border-border h-10 rounded-xl flex-1" placeholder="e.g. 1.5" />
            <Button onClick={() => showConfirm("Update Markup?", `This will change the global markup to ${marginInput}x. All service prices will be affected.`, saveMargin)} disabled={savingMargin} className="rounded-xl h-10">
              {savingMargin && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save
            </Button>
          </div>
        </motion.div>

        {/* Maintenance Mode */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${maintenanceMode ? "bg-destructive/10" : "bg-[hsl(var(--fame-success))]/10"}`}>
              <Power className={`h-4 w-4 ${maintenanceMode ? "text-destructive" : "text-[hsl(var(--fame-success))]"}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Maintenance Mode</h3>
              <p className="text-xs text-muted-foreground">Temporarily disable the site for all users</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
            <div>
              <div className="text-sm font-medium">{maintenanceMode ? "Site is in maintenance" : "Site is live"}</div>
              <div className="text-xs text-muted-foreground">{maintenanceMode ? "Users see a maintenance page" : "All features accessible"}</div>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={(checked) => showConfirm(
                checked ? "Enable Maintenance?" : "Disable Maintenance?",
                checked ? "Users will be unable to access the platform." : "The site will go live again.",
                () => toggleMaintenance(checked)
              )}
              disabled={savingMaintenance}
            />
          </div>
        </motion.div>
      </div>

      {/* 2FA Setup */}
      <MfaSetup />

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className="sm:max-w-xs max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[hsl(var(--fame-orange))]" /> {confirmTitle}</DialogTitle>
            <DialogDescription>{confirmDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setConfirmDialog(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={() => { confirmAction(); setConfirmDialog(false); }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
