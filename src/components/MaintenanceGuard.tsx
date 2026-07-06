import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Sparkles, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import maintenanceImg from "@/assets/maintenance.png"; // Newly added image

const MaintenancePage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden relative">
    {/* Abstract glowing blobs for premium aesthetic */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-screen opacity-50 animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(var(--fame-purple))]/20 rounded-full blur-[120px] -z-10 mix-blend-screen opacity-50 animate-pulse" style={{ animationDelay: "2s" }} />

    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-md w-full text-center space-y-6 relative z-10"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative mx-auto w-48 h-48 mb-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl animate-pulse" />
        <img 
          src={maintenanceImg} 
          alt="We are performing maintenance" 
          className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary tracking-wide uppercase">System Upgrade</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-['Playfair_Display']">
          We'll be right back.
        </h1>
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-muted-foreground leading-relaxed px-4"
      >
        Our team is currently polishing the gears and upgrading the system to bring you an even better, faster, and more secure experience. 
        <br /><br />
        We truly apologize for the interruption and appreciate your patience!
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/60 pt-6"
      >
        <Shield className="h-3.5 w-3.5" />
        <span>Smmstable</span>
      </motion.div>
    </motion.div>
  </div>
);

const MaintenanceGuard = ({ children }: { children: React.ReactNode }) => {
  const [maintenance, setMaintenance] = useState(false);
  const [isAdminBypass, setIsAdminBypass] = useState(false);
  const [checked, setChecked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const check = async () => {
      try {
        const response = await apiClient.get('/public/settings/maintenance');
        const isOn = response.data?.maintenance_mode === true;

        if (isOn && user) {
          // Allow admins through
          const isAdmin = user.role === 'ADMIN' || user.role === 'admin';
          if (isAdmin) {
            setIsAdminBypass(true);
            setMaintenance(false);
          } else {
            setMaintenance(true);
          }
        } else {
          setMaintenance(isOn);
        }
      } catch (error) {
        console.error('Maintenance check failed:', error);
        // Fallback to false if we can't check
        setMaintenance(false);
      } finally {
        setChecked(true);
      }
    };
    check();
  }, [user]);

  if (!checked) return null;
  if (maintenance) return <MaintenancePage />;
  
  return (
    <>
      {isAdminBypass && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 shadow-md">
          <AlertTriangle className="h-4 w-4" />
          MAINTENANCE MODE IS ACTIVE — You are bypassing this screen because you are an Admin.
        </div>
      )}
      {children}
    </>
  );
};

export default MaintenanceGuard;
