import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Browse from "./pages/Browse";
import ItemDetail from "./pages/ItemDetail";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import MyItems from "./pages/MyItems";
import Requests from "./pages/Requests";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import FaqFeedback from "./pages/FaqFeedback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/faq-feedback" element={<FaqFeedback />} />
                <Route path="/item/:id" element={<ItemDetail />} />
                <Route path="/add-item" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
                <Route path="/edit-item/:id" element={<ProtectedRoute><EditItem /></ProtectedRoute>} />
                <Route path="/my-items" element={<ProtectedRoute><MyItems /></ProtectedRoute>} />
                <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

