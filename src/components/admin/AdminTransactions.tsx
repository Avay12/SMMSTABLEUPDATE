import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { apiClient } from "@/lib/apiClient";
import { motion } from "framer-motion";
import { Search, Loader2, RefreshCw, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RotateCcw } from "lucide-react";

const typeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "deposit": case "admin_credit": return "bg-[hsl(var(--fame-success))]/10 text-[hsl(var(--fame-success))] border-[hsl(var(--fame-success))]/20";
    case "admin_debit": case "order": return "bg-destructive/10 text-destructive border-destructive/20";
    case "refund": return "bg-primary/10 text-primary border-primary/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const AdminTransactions = () => {
  const { formatCurrency } = useCurrency();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refundDialog, setRefundDialog] = useState(false);
  const [refundTx, setRefundTx] = useState<any>(null);
  const [refundType, setRefundType] = useState<"FULL" | "PARTIAL">("FULL");
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const [refunding, setRefunding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/transactions');
      setTransactions(data || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to fetch transactions", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = transactions.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (t.orderId?.toLowerCase().includes(q) || t.type?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.userId?.includes(q));
  });

  const handleRefund = async () => {
    if (!refundTx || !refundTx.orderId) return;
    setRefunding(true);
    try {
      if (refundType === "PARTIAL") {
        await apiClient.post(`/admin/refunds/${refundTx.orderId}/partial`, {
          amount: Number(partialAmount)
        });
        toast({ title: "Partial Refund processed", description: `${formatCurrency(Number(partialAmount))} credited back` });
      } else {
        await apiClient.post(`/admin/orders/${refundTx.orderId}/refund`, {
          amount: Number(refundTx.amount)
        });
        toast({ title: "Full Refund processed", description: `${formatCurrency(Number(refundTx.amount))} credited back` });
      }
    } catch (e: any) {
      toast({ title: "Refund failed", description: e.response?.data?.message || e.message, variant: "destructive" });
    } finally {
      setRefunding(false);
      setRefundDialog(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" /> Transaction Audit Log
          </h2>
          <p className="text-sm text-muted-foreground">Read-only log of all financial movements</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="rounded-xl gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search transactions..." className="pl-9 h-10 bg-card border-border rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.01, duration: 0.3 }}
              className="rounded-xl border border-border bg-card p-4 hover:border-primary/10 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`${typeColor(t.type)} text-[10px]`}>{t.type}</Badge>
                    {t.type === 'REFUND' || t.type === 'refund' ? <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">Refund</Badge> : null}
                    <span className="text-sm font-bold">{formatCurrency(Number(t.amount))}</span>
                  </div>
                  {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
                  <div className="text-[10px] text-muted-foreground/60 font-mono truncate">
                    User: {t.userId} {t.orderId ? `· Order ID: ${t.orderId}` : ""}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleString()}
                  </span>
                  {t.type?.toUpperCase() !== 'REFUND' && t.orderId && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setRefundTx(t); setRefundType("FULL"); setRefundDialog(true); }}
                        className="h-8 px-4 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        Full Refund
                      </button>
                      <button
                        onClick={() => { setRefundTx(t); setRefundType("PARTIAL"); setPartialAmount(Number(t.amount) / 2); setRefundDialog(true); }}
                        className="h-8 px-4 rounded-full border border-[hsl(var(--fame-warning))]/30 text-[hsl(var(--fame-warning))] bg-[hsl(var(--fame-warning))]/10 text-xs font-medium hover:bg-[hsl(var(--fame-warning))]/20 transition-colors"
                      >
                        Partial
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-16 text-sm">No transactions found.</p>}
        </div>
      )}

      {/* Refund Dialog */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent className="sm:max-w-sm max-w-[calc(100vw-2rem)] bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${refundType === "FULL" ? "text-destructive" : "text-primary"}`}>
              <RotateCcw className="h-4 w-4" /> Confirm {refundType === "FULL" ? "Full" : "Partial"} Refund
            </DialogTitle>
            <DialogDescription>
              {refundType === "FULL" 
                ? `This will credit ${formatCurrency(Number(refundTx?.amount || 0))} back to the user's balance and mark the order as refunded.`
                : `Enter the specific amount to credit back to the user for this partial refund.`}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-secondary p-3 text-sm space-y-1">
            <div><span className="text-muted-foreground">Order ID:</span> {refundTx?.orderId}</div>
            <div><span className="text-muted-foreground">Max Refundable:</span> <span className="font-semibold">{formatCurrency(Number(refundTx?.amount || 0))}</span></div>
          </div>
          {refundType === "PARTIAL" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Refund Amount</label>
              <Input 
                type="number" 
                step="0.01"
                min="0"
                max={Number(refundTx?.amount || 0)}
                value={partialAmount} 
                onChange={(e) => setPartialAmount(Number(e.target.value))} 
              />
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setRefundDialog(false)}>Cancel</Button>
            <Button className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleRefund} disabled={refunding}>
              {refunding && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTransactions;
