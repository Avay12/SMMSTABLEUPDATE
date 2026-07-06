import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SocketProvider } from "@/contexts/SocketContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import OAuthCallback from "./pages/OAuthCallback.tsx";
import PaymentSuccess from "./pages/PaymentSuccess.tsx";
import PaymentFailed from "./pages/PaymentFailed.tsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.tsx";
import DashboardHome from "./pages/dashboard/DashboardHome.tsx";
import WalletPage from "./pages/dashboard/WalletPage.tsx";
import OrderHistory from "./pages/dashboard/OrderHistory.tsx";
import ServicesPage from "./pages/dashboard/ServicesPage.tsx";
import SupportPage from "./pages/dashboard/SupportPage.tsx";
import FeedbackPage from "./pages/dashboard/FeedbackPage.tsx";
import SettingsPage from "./pages/dashboard/SettingsPage.tsx";
import HowToUsePage from "./pages/dashboard/HowToUsePage.tsx";
import LoyaltyPage from "./pages/dashboard/LoyaltyPage.tsx";
import ApiPage from "./pages/dashboard/ApiPage.tsx";
import AboutPage from "./pages/dashboard/AboutPage.tsx";
import AdminPage from "./pages/dashboard/AdminPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <CurrencyProvider>
            <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MaintenanceGuard>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/oauth/callback" element={<OAuthCallback />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<DashboardHome />} />
                  <Route path="payment-success" element={<PaymentSuccess />} />
                  <Route path="payment-failed" element={<PaymentFailed />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="add-funds" element={<WalletPage />} />
                  <Route path="wallet" element={<WalletPage />} />
                  <Route path="orders" element={<OrderHistory />} />
                  <Route path="how-to-use" element={<HowToUsePage />} />
                  <Route path="api" element={<ApiPage />} />
                  <Route path="feedback" element={<FeedbackPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="support" element={<SupportPage />} />
                  <Route path="loyalty" element={<LoyaltyPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="admin" element={<AdminPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MaintenanceGuard>
          </BrowserRouter>
            </TooltipProvider>
          </CurrencyProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
