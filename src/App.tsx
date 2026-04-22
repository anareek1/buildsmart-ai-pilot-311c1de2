import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import PTOAssistant from "@/pages/PTOAssistant";
import DigitalConstruction from "@/pages/DigitalConstruction";
import ActsAutomation from "@/pages/ActsAutomation";
import Subcontractors from "@/pages/Subcontractors";
import Documentation from "@/pages/Documentation";
import Analytics from "@/pages/Analytics";
import Accounting from "@/pages/Accounting";
import Tenders from "@/pages/Tenders";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="pto" element={<PTOAssistant />} />
            <Route path="digital-construction" element={<DigitalConstruction />} />
            <Route path="acts" element={<ActsAutomation />} />
            <Route path="subcontractors" element={<Subcontractors />} />
            <Route path="documentation" element={<Documentation />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="tenders" element={<Tenders />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
