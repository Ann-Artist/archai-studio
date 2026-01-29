import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import FloorPlanGenerator from "./pages/FloorPlanGenerator";
import Model3DPreview from "./pages/Model3DPreview";
import Projects from "./pages/Projects";
import CostEstimator from "./pages/CostEstimator";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Interior Designer Pages
import InteriorDesignerDashboard from "./pages/interior-designer/InteriorDesignerDashboard";
import InteriorDesignerStyleGenerator from "./pages/interior-designer/InteriorDesignerStyleGenerator";
import InteriorDesignerDesignPreview from "./pages/interior-designer/InteriorDesignerDesignPreview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/floor-plan-generator" element={<FloorPlanGenerator />} />
            <Route path="/3d-preview" element={<Model3DPreview />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/cost-estimator" element={<CostEstimator />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/team" element={<Team />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Interior Designer Routes */}
            <Route path="/interior-designer/dashboard" element={<InteriorDesignerDashboard />} />
            <Route path="/interior-designer/style-generator" element={<InteriorDesignerStyleGenerator />} />
            <Route path="/interior-designer/design-preview" element={<InteriorDesignerDesignPreview />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
