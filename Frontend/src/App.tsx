import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AssetsPage from "./pages/AssetsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import MaintenancePage from "./pages/MaintenancePage";
import HistoryPage from "./pages/HistoryPage";
import ReportsPage from "./pages/ReportsPage";
import StaffPage from "./pages/StaffPage";
import SettingsPage from "./pages/SettingsPage";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import { useAuth, type UserRole } from "@/lib/auth";

const queryClient = new QueryClient();

const ProtectedPage = ({ roles, children }: { roles: UserRole[]; children: JSX.Element }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/assets" element={<ProtectedPage roles={["ADMIN", "ASSET_MANAGER", "EMPLOYEE"]}><AssetsPage /></ProtectedPage>} />
            <Route path="/assignments" element={<ProtectedPage roles={["ADMIN", "ASSET_MANAGER"]}><AssignmentsPage /></ProtectedPage>} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/history" element={<ProtectedPage roles={["ADMIN", "ASSET_MANAGER"]}><HistoryPage /></ProtectedPage>} />
            <Route path="/reports" element={<ProtectedPage roles={["ADMIN", "ASSET_MANAGER"]}><ReportsPage /></ProtectedPage>} />
            <Route path="/staff" element={<ProtectedPage roles={["ADMIN"]}><StaffPage /></ProtectedPage>} />
            <Route path="/settings" element={<ProtectedPage roles={["ADMIN"]}><SettingsPage /></ProtectedPage>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
