import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Send, Loader2, Bot, BellRing } from "lucide-react";

const AdminTelegram = () => {
  const [form, setForm] = useState({ telegram_bot_token: "", telegram_chat_id: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await apiClient.get('/admin/settings/telegram');
        setForm({
          telegram_bot_token: data.telegram_bot_token || "",
          telegram_chat_id: data.telegram_chat_id || "",
        });
      } catch (e) {
        toast({ title: "Failed to load settings", variant: "destructive" });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch('/admin/settings/telegram', form);
      toast({ title: "Telegram settings saved" });
    } catch (e) {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await apiClient.post('/admin/settings/telegram/test', {});
      toast({ title: "Test message sent to Telegram!" });
    } catch (e: any) {
      toast({ title: "Test Failed", description: e.response?.data?.message || "Check your bot token and chat ID.", variant: "destructive" });
    }
    setTesting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Telegram Notifications</h2>
        <p className="text-sm text-muted-foreground">Configure Telegram bot for Smmstable admin alerts.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Bot Configuration</h3>
              <p className="text-xs text-muted-foreground">These settings apply only to Smmstable</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Bot Token</Label>
              <Input
                value={form.telegram_bot_token}
                onChange={(e) => setForm({ ...form, telegram_bot_token: e.target.value })}
                placeholder="123456789:ABCDefGhIJKlmNOPQrstUVwxyZ..."
                className="font-mono text-xs rounded-xl bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-primary hover:underline">@BotFather</a></p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Admin Chat ID</Label>
              <Input
                value={form.telegram_chat_id}
                onChange={(e) => setForm({ ...form, telegram_chat_id: e.target.value })}
                placeholder="-1001234567890"
                className="font-mono text-xs rounded-xl bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">Your user ID, group ID, or channel ID.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} className="rounded-xl">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Settings
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={testing} className="rounded-xl">
              {testing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Send className="h-4 w-4 mr-2" /> Test
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
              <BellRing className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Notification Events</h3>
              <p className="text-xs text-muted-foreground">You will receive alerts for:</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { icon: '🛒', title: 'New Orders', desc: 'When a user places a new order' },
              { icon: '🎫', title: 'Support Tickets', desc: 'New tickets and status updates' },
              { icon: '💰', title: 'Payments', desc: 'Successful deposit completions' },
              { icon: '👤', title: 'User Signups', desc: 'New user registrations' },
              { icon: '⭐', title: 'Feedback', desc: 'New user feedback/reviews' },
            ].map((event) => (
              <div key={event.title} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                <span className="text-xl leading-none">{event.icon}</span>
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminTelegram;
