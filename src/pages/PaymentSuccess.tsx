import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[hsl(var(--fame-success))]/20 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="max-w-md w-full relative z-10"
      >
        <div className="rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl p-8 shadow-2xl text-center overflow-hidden relative">
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto bg-[hsl(var(--fame-success))]/10 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-[hsl(var(--fame-success))]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold tracking-tight mb-3">Payment Successful</h1>
            <p className="text-muted-foreground mb-8">
              Your funds have been successfully added to your wallet. You can now use your balance to place new orders!
            </p>

            {ref && (
              <div className="bg-secondary/50 rounded-xl p-4 mb-8 font-mono text-xs text-muted-foreground break-all">
                Reference: {ref}
              </div>
            )}
            
            <div className="relative h-48 w-full mb-8 rounded-2xl overflow-hidden border border-border/50 group">
              <img 
                src="/payment-success.png" 
                alt="Payment Success" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>

            <Button 
              size="lg" 
              className="w-full rounded-2xl h-12 gap-2"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
