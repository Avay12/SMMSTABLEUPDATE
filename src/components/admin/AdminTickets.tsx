import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { motion } from "framer-motion";
import { Search, Loader2, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const AdminTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/tickets/admin/all');
      setTickets(data || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to load tickets", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = tickets.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (t.subject?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
  });

  const updateTicket = async (id: string, status: string, reply?: string) => {
    try {
      await apiClient.patch(`/tickets/admin/${id}/status`, {
        status: status.toUpperCase(),
        ...(reply && { adminReply: reply })
      });
      toast({ title: "Ticket updated" });
      setReplyingTo(null);
      setReplyText("");
      fetchData();
    } catch (e) {
      toast({ title: "Failed to update ticket", variant: "destructive" });
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "open": case "OPEN": return "bg-[hsl(var(--fame-orange))]/10 text-[hsl(var(--fame-orange))]";
      case "in-progress": case "IN_PROGRESS": return "bg-primary/10 text-primary";
      case "resolved": case "RESOLVED": return "bg-[hsl(var(--fame-success))]/10 text-[hsl(var(--fame-success))]";
      case "closed": case "CLOSED": return "bg-muted text-muted-foreground";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Support Tickets</h2>
          <p className="text-sm text-muted-foreground">{tickets.filter(t => t.status === "open").length} open tickets</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tickets..." className="pl-9 h-10 bg-card border-border rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-3">
                <div>
                  <span className="font-semibold text-sm">{t.subject}</span>
                  <span className="text-xs text-muted-foreground ml-2">Category: {t.category}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`${statusColor(t.status)} text-[10px]`}>{t.status.toLowerCase()}</Badge>
                  <Select defaultValue={t.status.toLowerCase()} onValueChange={(v) => updateTicket(t.id, v)}>
                    <SelectTrigger className="h-7 w-28 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["open", "in_progress", "resolved", "closed"].map(s => <SelectItem key={s} value={s}>{s.replace("_", "-")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{t.description}</p>
              {t.attachmentUrl && (
                <div className="mb-3">
                  {/\.(jpg|jpeg|png|gif|webp)$/i.test(t.attachmentUrl) ? (
                    <a href={t.attachmentUrl} target="_blank" rel="noopener noreferrer">
                      <img src={t.attachmentUrl} alt="Attachment" className="rounded-lg max-h-40 object-cover border border-border" />
                    </a>
                  ) : (
                    <a href={t.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                      <MessageSquare className="h-3.5 w-3.5" /> View attachment
                    </a>
                  )}
                </div>
              )}
              {t.adminReply && (
                <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 mb-3">
                  <span className="text-xs text-primary font-medium">Admin Reply:</span>
                  <p className="text-sm mt-1">{t.adminReply}</p>
                </div>
              )}
              {replyingTo === t.id ? (
                <div className="space-y-2 mt-2">
                  <Textarea className="bg-secondary border-border rounded-xl" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type reply..." />
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={() => updateTicket(t.id, "resolved", replyText)} className="rounded-lg active:scale-95">Send Reply</Button>
                    <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)} className="rounded-lg">Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setReplyingTo(t.id)} className="rounded-lg active:scale-95 gap-1.5">
                  <MessageSquare className="h-3 w-3" /> Reply
                </Button>
              )}
              <div className="text-[10px] text-muted-foreground mt-2 font-mono">{new Date(t.createdAt).toLocaleString()} · User: {t.user?.email || t.userId}</div>
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-16 text-sm">No tickets found.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
