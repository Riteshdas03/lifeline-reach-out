
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import RegisterHospital from "./pages/RegisterHospital";
import BecomeDonor from "./pages/BecomeDonor";
import ApiTestPanel from "./components/ApiTestPanel";
import AuthCallback from "./components/AuthCallback";
import FindHospitals from "./pages/FindHospitals";
import EmergencyServicesPage from "./pages/EmergencyServices";
import HealthCampsPage from "./pages/HealthCamps";
import BloodBanks from "./pages/BloodBanks";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

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
            <Route path="/auth" element={<Auth />} />
            <Route path="/sign-in" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/find-hospitals" element={<FindHospitals />} />
            <Route path="/emergency-services" element={<EmergencyServicesPage />} />
            <Route path="/health-camps" element={<HealthCampsPage />} />
            <Route path="/blood-banks" element={<BloodBanks />} />
            <Route path="/individual-donors" element={<BloodBanks />} />
            <Route path="/register-hospital" element={<RegisterHospital />} />
            <Route path="/become-donor" element={<BecomeDonor />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/api-test" element={<ApiTestPanel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
