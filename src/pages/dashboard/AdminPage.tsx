import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LayoutDashboard, Users, ShoppingCart, DollarSign, MessageSquare, Star, Bell, Settings, ChevronLeft, ChevronRight, Wifi, Package, Bot, Megaphone, Coins } from "lucide-react";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminTransactions from "@/components/admin/AdminTransactions";
import AdminTickets from "@/components/admin/AdminTickets";
import AdminFeedback from "@/components/admin/AdminFeedback";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminProviders from "@/components/admin/AdminProviders";
import AdminServices from "@/components/admin/AdminServices";
import AdminJungey from "@/components/admin/AdminJungey";
import AdminPopups from "@/components/admin/AdminPopups";
import AdminTelegram from "@/components/admin/AdminTelegram";
import { AdminCurrencies } from "@/components/admin/AdminCurrencies";
import AdminPayments from "@/components/admin/AdminPayments";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "providers", label: "Providers", icon: Wifi },
  { id: "services", label: "Services", icon: Package },
  { id: "users", label: "Users", icon: Users },
  { id: "payments", label: "Payments", icon: DollarSign },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "transactions", label: "Audit Log", icon: DollarSign },
  { id: "tickets", label: "Tickets", icon: MessageSquare },
  { id: "feedback", label: "Feedback", icon: Star },
  { id: "notifications", label: "Notify", icon: Bell },
  { id: "jungey", label: "Jungey AI", icon: Bot },
  { id: "popups", label: "Popups", icon: Megaphone },
  { id: "telegram", label: "Telegram", icon: Bot },
  { id: "currencies", label: "Currencies", icon: Coins },
  { id: "settings", label: "Settings", icon: Settings },
];

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAdmin) return (
    <div className="rounded-2xl border border-border bg-card p-12 text-center">
      <Shield className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
      <p className="text-muted-foreground">Access denied. Admin only.</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <AdminOverview />;
      case "providers": return <AdminProviders />;
      case "services": return <AdminServices />;
      case "users": return <AdminUsers />;
      case "payments": return <AdminPayments />;
      case "orders": return <AdminOrders />;
      case "transactions": return <AdminTransactions />;
      case "tickets": return <AdminTickets />;
      case "feedback": return <AdminFeedback />;
      case "notifications": return <AdminNotifications />;
      case "jungey": return <AdminJungey />;
      case "popups": return <AdminPopups />;
      case "telegram": return <AdminTelegram />;
      case "currencies": return <AdminCurrencies />;
      case "settings": return <AdminSettings />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="flex gap-0 -mx-4 md:-mx-8 -mt-6 md:-mt-8 min-h-[calc(100vh-4rem)]">
      {/* Admin Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 56 : 200 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="border-r border-border bg-card/50 flex flex-col shrink-0 sticky top-0 h-[calc(100vh-4rem)] overflow-hidden"
      >
        <div className="p-3 border-b border-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Admin</span>
            </motion.div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors active:scale-95 mx-auto"
          >
            {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 active:scale-[0.97] ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate text-xs">
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminPage;
