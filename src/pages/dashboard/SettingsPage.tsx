import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const SettingsPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username || "");
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await apiClient.put(`/auth/update-profile/${user.id}`, { username });
      toast({ title: "Saved!" });
      refreshProfile();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" }); return; }
    if (!currentPassword) { toast({ title: "Error", description: "Current password is required", variant: "destructive" }); return; }
    setChangingPw(true);
    try {
      await apiClient.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast({ title: "Password updated!" });
      setNewPassword("");
      setCurrentPassword("");
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || error.message, variant: "destructive" });
    }
    setChangingPw(false);
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Manage your account settings</p>

      <div className="space-y-5 sm:space-y-6 max-w-lg">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
          <h2 className="font-semibold">Profile</h2>
          <div>
            <Label>Email</Label>
            <Input className="mt-1.5 bg-secondary border-border h-12" value={user?.email || ""} disabled />
          </div>
          <div>
            <Label>Username</Label>
            <Input className="mt-1.5 bg-secondary border-border h-12" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <Button className="w-full sm:w-auto h-12 active:scale-[0.97]" onClick={handleSaveProfile} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
          <h2 className="font-semibold">Change Password</h2>
          <div>
            <Label>Current Password</Label>
            <Input type="password" className="mt-1.5 bg-secondary border-border h-12" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <Label>New Password</Label>
            <Input type="password" className="mt-1.5 bg-secondary border-border h-12" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
          </div>
          <Button className="w-full sm:w-auto h-12 active:scale-[0.97]" onClick={handleChangePassword} disabled={changingPw}>
            {changingPw ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Update Password
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
