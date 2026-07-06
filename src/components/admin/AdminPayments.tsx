import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, RefreshCw, DollarSign, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const { formatCurrency, currentCurrency } = useCurrency();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/payment/all');
      setPayments(data?.payments || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to load payments", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleUpdatePaid = async (identifier: string) => {
    setUpdating(identifier);
    try {
      await apiClient.post('/payment/update-paid', { identifier });
      toast({ title: "Payment marked as paid" });
      fetchPayments();
    } catch (e) {
      toast({ title: "Failed to update payment", variant: "destructive" });
    }
    setUpdating(null);
  };

  const handleCheckPaid = async () => {
    try {
      await apiClient.post('/payment/check-paid');
      toast({ title: "Checked pending payments" });
      fetchPayments();
    } catch (e) {
      toast({ title: "Failed to check payments", variant: "destructive" });
    }
  };

  const filtered = payments.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(p.transactionId || "").toLowerCase().includes(q) ||
      (typeof p.user === 'string' && p.user.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Payment Orders</h2>
          <p className="text-sm text-muted-foreground">{payments.length} total records</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by username or ID..." 
              className="pl-9 h-10 bg-card border-border rounded-xl" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Button onClick={handleCheckPaid} className="rounded-xl h-10 px-4 gap-2 shrink-0 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
            <CheckCircle2 className="h-4 w-4" /> Check Paid
          </Button>
          <Button variant="outline" size="icon" onClick={() => fetchPayments()} className="h-10 w-10 shrink-0">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Transaction ID</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Gateway</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                  {filtered.map((p, i) => (
                    <motion.tr
                      key={p.transactionId || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.3 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs">{p.transactionId}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{typeof p.user === 'string' ? p.user : 'Unknown'}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary">
                        {p.amount} {p.currency || "USD"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.gateway || p.method || "Manual"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-[10px] ${p.is_paid ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                          {p.is_paid ? 'paid' : 'unpaid'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(p.createdAt || p.date).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!p.is_paid && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-lg h-8 px-3 text-xs border-border bg-secondary hover:bg-muted transition-all active:scale-95"
                            onClick={() => handleUpdatePaid(p.transactionId)}
                            disabled={updating === p.transactionId}
                          >
                            {updating === p.transactionId ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                            Update Paid
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted-foreground py-16 text-sm">
                      No payment orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
