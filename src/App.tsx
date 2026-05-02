import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import RequireAuth from "@/components/RequireAuth";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PTOAssistant from "@/pages/PTOAssistant";
import DigitalConstruction from "@/pages/DigitalConstruction";
import Materials from "@/pages/Materials";
import ActsAutomation from "@/pages/ActsAutomation";
import Subcontractors from "@/pages/Subcontractors";
import Documentation from "@/pages/Documentation";
import Analytics from "@/pages/Analytics";
import Accounting from "@/pages/Accounting";
import Tenders from "@/pages/Tenders";
import NotFound from "@/pages/NotFound";

// Lazy-load the marketing home page separately
import Home from "@/pages/Home";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Marketing home */}
          <Route path="/" element={<Home />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Protected dashboard */}
          <Route
            path="/app"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="pto" element={<PTOAssistant />} />
            <Route path="digital-construction" element={<DigitalConstruction />} />
            <Route path="materials" element={<Materials />} />
            <Route path="acts" element={<ActsAutomation />} />
            <Route path="subcontractors" element={<Subcontractors />} />
            <Route path="documentation" element={<Documentation />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="tenders" element={<Tenders />} />
          </Route>

          {/* Legacy redirects */}
          <Route path="/pto" element={<Navigate to="/app/pto" replace />} />
          <Route path="/acts" element={<Navigate to="/app/acts" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
