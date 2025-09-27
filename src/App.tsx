import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthPromptProvider } from "./contexts/AuthPromptContext";
import { ChatProvider } from "./contexts/ChatContext";
// Import cookie utilities to make clearAllData() available globally
import "./utils/cookies";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import VerifyOTP from "./pages/VerifyOTP";
import Contact from "./pages/Contact";
import BuyerDashboard from "./pages/BuyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddCar from "./pages/AddCar";
import BuyCars from "./pages/BuyCars";
import Wishlist from "./pages/Wishlist";
import Bookings from "./pages/Bookings";
import Orders from "./pages/Orders";
import Support from "./pages/Support";
import About from "./pages/About";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import Services from "./pages/Services";
import HowItWorks from "./pages/HowItWorks";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import CarDetails from "./pages/CarDetails";
import AdminCars from "./pages/AdminCars";
import AdminOrders from "./pages/AdminOrders";
import AdminSupportChat from "./pages/AdminSupportChat";
import EditCar from "./pages/EditCar";
import TestDriveBooking from "./pages/TestDriveBooking";
import PageLoader from "./components/PageLoader";
import ErrorBoundary from "./components/ErrorBoundary";
import ListCar from "./pages/ListCar";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionWarning from "./components/SessionWarning";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <AuthPromptProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ErrorBoundary>
                <Helmet>
                  <meta charSet="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <title>CarHub Rwanda – Buy, Sell, Rent Premium Cars</title>
                  <meta name="description" content="Find, buy, sell, or rent premium cars in Rwanda. Browse verified listings with financing options and test drives." />
                  <link rel="canonical" href="https://carhubconnect.onrender.com/" />
                </Helmet>
                <SessionWarning />
                <Routes>
                  <Route element={<Layout />}>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/buy-cars" element={<BuyCars />} />
                    <Route path="/car/:id" element={<CarDetails />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />

                    {/* Auth routes - redirect if already authenticated */}
                    <Route path="/signup" element={
                      <ProtectedRoute requireAuth={false}>
                        <SignUp />
                      </ProtectedRoute>
                    } />
                    <Route path="/signin" element={
                      <ProtectedRoute requireAuth={false}>
                        <SignIn />
                      </ProtectedRoute>
                    } />
                    <Route path="/verify-otp" element={
                      <ProtectedRoute requireAuth={false}>
                        <VerifyOTP />
                      </ProtectedRoute>
                    } />

                    {/* Protected user routes */}
                    <Route path="/buyer-dashboard" element={
                      <ProtectedRoute>
                        <BuyerDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/add-car" element={
                      <ProtectedRoute>
                        <AddCar />
                      </ProtectedRoute>
                    } />
                    <Route path="/list-car" element={
                      <ProtectedRoute>
                        <ListCar />
                      </ProtectedRoute>
                    } />
                    <Route path="/wishlist" element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    } />
                    <Route path="/bookings" element={
                      <ProtectedRoute>
                        <Bookings />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } />
                    <Route path="/support" element={
                      <ProtectedRoute>
                        <Support />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } />
                    <Route path="/test-drive/:id" element={
                      <ProtectedRoute>
                        <TestDriveBooking />
                      </ProtectedRoute>
                    } />

                    {/* Admin-only routes */}
                    <Route path="/admin-dashboard" element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/cars" element={
                      <ProtectedRoute adminOnly>
                        <AdminCars />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/support-chat" element={
                      <ProtectedRoute adminOnly>
                        <AdminSupportChat />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <ProtectedRoute adminOnly>
                        <AdminOrders />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/edit-car/:id" element={
                      <ProtectedRoute adminOnly>
                        <EditCar />
                      </ProtectedRoute>
                    } />

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </ErrorBoundary>
            </TooltipProvider>
          </AuthPromptProvider>
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
