import { useState, useEffect, useRef } from "react";

import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Send, MessageSquare, CheckCircle, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const SupportPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const response = await apiClient.get("/tickets");
      setTickets(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      await apiClient.post("/tickets", {
        category: "OTHER",
        subject,
        description: message,
      });
      setSubject(""); setMessage(""); setAttachment(null);
      setSuccessOpen(true);
      fetchTickets();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s: string) => s === "open" ? "bg-[hsl(var(--fame-warning))]/10 text-[hsl(var(--fame-warning))]" : s === "resolved" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400";

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-1">Support</h1>
      <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Submit a ticket or view your existing tickets</p>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader className="items-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle>Ticket Submitted</DialogTitle>
            <DialogDescription>Your support ticket has been received. We'll get back to you as soon as possible.</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setSuccessOpen(false)} className="w-full h-12 rounded-xl font-semibold mt-2">Close</Button>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Send className="h-4 w-4" /> New Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input className="mt-1.5 bg-secondary border-border h-12" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1.5 bg-secondary border-border h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea className="mt-1.5 bg-secondary border-border min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} required />
            </div>
            <div>
              <Label>Attachment (optional)</Label>
              <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.zip,.txt" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
              {attachment ? (
                <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-secondary border border-border px-3 py-2.5">
                  {attachment.type.startsWith("image/") ? <ImageIcon className="h-4 w-4 text-primary shrink-0" /> : <FileText className="h-4 w-4 text-primary shrink-0" />}
                  <span className="text-sm truncate flex-1">{attachment.name}</span>
                  <button type="button" onClick={() => setAttachment(null)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} className="mt-1.5 w-full h-12 rounded-xl border-dashed gap-2">
                  <Paperclip className="h-4 w-4" /> Attach a file
                </Button>
              )}
            </div>
            <Button type="submit" disabled={submitting} className="w-full h-14 text-base rounded-xl font-semibold active:scale-[0.97]">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Submit Ticket
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Your Tickets</h2>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No tickets yet.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {tickets.map((t) => (
                <div key={t.id} className="rounded-xl bg-secondary p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-medium text-sm">{t.subject}</span>
                    <Badge className={`shrink-0 ${statusColor(t.status)}`}>{t.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                  {t.attachment_url && (
                    <div className="mt-2">
                      {isImage(t.attachment_url) ? (
                        <a href={t.attachment_url} target="_blank" rel="noopener noreferrer">
                          <img src={t.attachment_url} alt="Attachment" className="rounded-lg max-h-32 object-cover border border-border" />
                        </a>
                      ) : (
                        <a href={t.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                          <FileText className="h-3.5 w-3.5" /> View attachment
                        </a>
                      )}
                    </div>
                  )}
                  {t.admin_reply && (
                    <div className="mt-3 rounded-xl bg-primary/5 border border-primary/20 p-3">
                      <span className="text-xs text-primary font-medium">Admin Reply:</span>
                      <p className="text-sm mt-1">{t.admin_reply}</p>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground mt-2 block">{new Date(t.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
