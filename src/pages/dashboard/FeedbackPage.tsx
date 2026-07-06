import { useState, useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Star, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const FeedbackPage = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successOpen, setSuccessOpen] = useState(false);

  const fetchFeedbacks = async () => {
    if (!user) return;
    try {
      const response = await apiClient.get('/feedback');
      setFeedbacks(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await apiClient.post("/feedback", { rating, message });
      setMessage(""); setRating(5);
      setSuccessOpen(true);
      fetchFeedbacks();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-1">Feedback</h1>
      <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Help us improve by sharing your experience</p>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader className="items-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle>Thank You!</DialogTitle>
            <DialogDescription>Your feedback has been submitted successfully. We appreciate your input.</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setSuccessOpen(false)} className="w-full h-12 rounded-xl font-semibold mt-2">Close</Button>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-semibold mb-4">Leave Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)} className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
                    <Star className={`h-7 w-7 ${s <= rating ? "fill-[hsl(var(--fame-orange))] text-[hsl(var(--fame-orange))]" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Your feedback</Label>
              <Textarea className="mt-1.5 bg-secondary border-border min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} required />
            </div>
            <Button type="submit" disabled={submitting} className="w-full h-14 text-base rounded-xl font-semibold active:scale-[0.97]">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Submit
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-semibold mb-4">Your Past Feedback</h2>
          {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : feedbacks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No feedback yet.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {feedbacks.map((f) => (
                <div key={f.id} className="rounded-xl bg-secondary p-4">
                  <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map((s) => <Star key={s} className={`h-4 w-4 ${s <= f.rating ? "fill-[hsl(var(--fame-orange))] text-[hsl(var(--fame-orange))]" : "text-muted-foreground"}`} />)}</div>
                  <p className="text-sm">{f.message}</p>
                  <span className="text-xs text-muted-foreground mt-2 block">{new Date(f.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
