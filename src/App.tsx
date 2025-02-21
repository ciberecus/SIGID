
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import RegistroAfiliado from "./pages/RegistroAfiliado";
import AdminPanel from "./pages/paneles/AdminPanel";
import SupervisorPanel from "./pages/paneles/SupervisorPanel";
import PromotorPanel from "./pages/paneles/PromotorPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/registro-afiliado" element={<RegistroAfiliado />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/supervisor" element={<SupervisorPanel />} />
          <Route path="/promotor" element={<PromotorPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
