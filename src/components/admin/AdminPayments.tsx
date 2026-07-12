import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, RefreshCw, DollarSign, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [apiUnpaidCount, setApiUnpaidCount] = useState(0);
  const [apiTotalAmount, setApiTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const { formatCurrency, currentCurrency, currencies } = useCurrency();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/payment/all?limit=5000');
      setPayments(data?.payments || []);
      setTotalRecords(data?.total || 0);
      setApiUnpaidCount(data?.unpaidCount || 0);
      setApiTotalAmount(data?.totalAmount || 0);
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

  const [page, setPage] = useState(1);
  const itemsPerPage = 15;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedPayments = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const nprCurrency = currencies?.find(c => c.code === 'NPR') || { rate: 134, symbol: 'Rs' };
  
  // Use the API provided totals for a more accurate reflection of the entire database
  // instead of calculating it from the currently fetched paginated list.
  const unpaidCount = apiUnpaidCount;
  const totalUnpaidNPR = apiTotalAmount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Payment Orders</h2>
            <p className="text-sm text-muted-foreground mt-1">{totalRecords} total records</p>
          </div>
          <div className="h-10 w-px bg-border mx-2 hidden sm:block"></div>
          <div className="flex flex-col rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-2 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-600/80">Pending Action</span>
            <span className="text-sm font-bold text-orange-600">{unpaidCount} unpaid ({nprCurrency.symbol}{Number(totalUnpaidNPR).toFixed(2)})</span>
          </div>
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
          <Table>
            <TableHeader className="bg-secondary/20 sticky top-0">
              <TableRow className="border-border/50">
                <TableHead className="text-xs font-medium w-24">Date</TableHead>
                <TableHead className="text-xs font-medium">User</TableHead>
                <TableHead className="text-xs font-medium w-32">Amount</TableHead>
                <TableHead className="text-xs font-medium w-32">Status</TableHead>
                <TableHead className="text-xs font-medium">Transaction ID</TableHead>
                <TableHead className="text-xs font-medium text-right w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No payment orders found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayments.map((p, i) => (
                  <TableRow key={p.transactionId || i} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="text-muted-foreground">
                      {new Date(p.createdAt || p.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{typeof p.user === 'string' ? p.user : 'Unknown'}</TableCell>
                    <TableCell className="font-semibold text-primary">{p.amount} {p.currency || "USD"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${p.is_paid ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                        {p.is_paid ? 'paid' : 'unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.transactionId}</TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/50 bg-secondary/10">
              <span className="text-xs text-muted-foreground">
                Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filtered.length)} of {filtered.length} entries
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 rounded-lg px-4">Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 rounded-lg px-4">Next</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
