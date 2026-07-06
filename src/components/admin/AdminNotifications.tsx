import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { motion } from "framer-motion";
import { Loader2, Send, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const AdminNotifications = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [sentNotifs, setSentNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [userId, setUserId] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [u, n] = await Promise.all([
          apiClient.get("/auth/users"),
          apiClient.get("/notifications/admin/notifications"),
        ]);
        const uData = u.data?.users || u.data;
        const nData = n.data;
        setUsers(Array.isArray(uData) ? uData : []);
        setSentNotifs(Array.isArray(nData) ? nData : []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, []);

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: "Error", description: "Title and message are required", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      if (target === "all") {
        await apiClient.post("/notifications/admin/notifications/broadcast", { title, message });
        toast({ title: "Broadcast sent" });
      } else {
        if (!userId) { toast({ title: "Select a user", variant: "destructive" }); setSending(false); return; }
        await apiClient.post(`/notifications/admin/notifications/user/${userId}`, { title, message });
        toast({ title: "Notification sent" });
      }
      setTitle(""); setMessage("");
      const { data } = await apiClient.get("/notifications/admin/notifications");
      setSentNotifs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSending(false);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Notifications</h2>
        <p className="text-sm text-muted-foreground">Send alerts to users</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5 max-w-lg space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Compose Notification</h3>
        <div>
          <Label className="text-xs font-medium">Target</Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger className="h-10 bg-secondary border-border rounded-xl mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users (Broadcast)</SelectItem>
              <SelectItem value="specific">Specific User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {target === "specific" && (
          <div>
            <Label className="text-xs font-medium">Select User</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger className="h-10 bg-secondary border-border rounded-xl mt-1"><SelectValue placeholder="Choose..." /></SelectTrigger>
              <SelectContent>
                {users.map(u => <SelectItem key={u.id || u.user_id} value={u.id || u.user_id}>{u.email || u.username || u.id}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <Label className="text-xs font-medium">Title</Label>
          <Input placeholder="Notification title" className="h-10 bg-secondary border-border rounded-xl mt-1" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs font-medium">Message</Label>
          <Textarea placeholder="Write your message..." className="bg-secondary border-border rounded-xl mt-1 min-h-[80px]" value={message} onChange={e => setMessage(e.target.value)} />
        </div>
        <Button onClick={sendNotification} disabled={sending} className="rounded-xl h-10 w-full gap-2 active:scale-[0.97]">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
        </Button>
      </motion.div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Recent Notifications</h3>
        <div className="space-y-2">
          {sentNotifs.map(n => (
            <div key={n.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{n.title}</span>
                    <Badge variant="outline" className="text-[10px]">{n.is_broadcast ? "Broadcast" : "Individual"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 break-words">{n.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {sentNotifs.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No notifications sent yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
