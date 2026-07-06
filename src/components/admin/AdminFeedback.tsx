import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { motion } from "framer-motion";
import { Loader2, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/feedback/admin/all');
        setFeedbacks(data || []);
      } catch (e) {
        console.error(e);
        toast({ title: "Failed to load feedback", variant: "destructive" });
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">User Feedback</h2>
        <p className="text-sm text-muted-foreground">{feedbacks.length} submissions</p>
      </div>
      <div className="space-y-3">
        {feedbacks.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
            className="rounded-xl border border-border bg-card p-5">
            <div className="flex gap-0.5 mb-2">
              {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= f.rating ? "fill-[hsl(var(--fame-orange))] text-[hsl(var(--fame-orange))]" : "text-muted-foreground/30"}`} />)}
            </div>
            <p className="text-sm">{f.message}</p>
            <div className="text-[10px] text-muted-foreground mt-2 font-mono">{new Date(f.createdAt).toLocaleString()} · User: {f.userId || f.user?.username}</div>
          </motion.div>
        ))}
        {feedbacks.length === 0 && <p className="text-center text-muted-foreground py-16 text-sm">No feedback yet.</p>}
      </div>
    </div>
  );
};

export default AdminFeedback;
