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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import AdminCustomerChatDashboard from "./pages/AdminCustomerChatDashboard";
import AdminManageUsers from "./pages/AdminManageUsers";
import AdminBrandManagement from "./pages/AdminBrandManagement";
import AdminCarReview from "./pages/AdminCarReview";
import RentCar from "./pages/RentCar";
import EditCar from "./pages/EditCar";
import TestDriveBooking from "./pages/TestDriveBooking";
import PageLoader from "./components/PageLoader";
import ErrorBoundary from "./components/ErrorBoundary";
import ListCar from "./pages/ListCar";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionWarning from "./components/SessionWarning";
import ScrollToTop from "./components/ScrollToTop";
import FloatingSocialIcons from "./components/FloatingSocialIcons";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import ResetPasswordVerify from "./pages/ResetPasswordVerify";
import ResetPasswordFinal from "./pages/ResetPasswordFinal";

import { ThemeProvider } from "./contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthPromptProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <ErrorBoundary>
                  <Helmet>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>connectify Rwanda – Buy, Sell, Rent Premium Cars</title>
                    <meta name="description" content="Find, buy, sell, or rent premium cars in Rwanda. Browse verified listings with financing options and test drives." />
                    <link rel="canonical" href="https://carhubconnect.onrender.com/" />
                  </Helmet>
                  <SessionWarning />
                  <ScrollToTop />
                  <FloatingSocialIcons />
                  <Routes>
                    <Route element={<Layout />}>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/buy-cars" element={<BuyCars />} />
                      <Route path="/rent-car" element={<RentCar />} />
                      <Route path="/rent-cars" element={<RentCar />} />
                      <Route path="/car/:id" element={<CarDetails />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/how-it-works" element={<HowItWorks />} />
                      <Route path="/reset-password-verify" element={<ResetPasswordVerify />} />
                      <Route path="/reset-password-final" element={<ResetPasswordFinal />} />

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
                      <Route path="/forgot-password" element={
                        <ProtectedRoute requireAuth={false}>
                          <ForgotPassword />
                        </ProtectedRoute>
                      } />
                      <Route path="/reset-password" element={
                        <ProtectedRoute requireAuth={false}>
                          <ResetPassword />
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
                      <Route path="/buyer/wishlist" element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      } />
                      <Route path="/buyer/bookings" element={
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
                      <Route path="/admin/customer-chat" element={
                        <ProtectedRoute adminOnly>
                          <AdminCustomerChatDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/manage-users" element={
                        <ProtectedRoute adminOnly>
                          <AdminManageUsers />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/brand-management" element={
                        <ProtectedRoute adminOnly>
                          <AdminBrandManagement />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/car-review" element={
                        <ProtectedRoute adminOnly>
                          <AdminCarReview />
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
                      <Route path="/admin/order/:id" element={
                        <ProtectedRoute adminOnly>
                          <AdminOrderDetails />
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
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
