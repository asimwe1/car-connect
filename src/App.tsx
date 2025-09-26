import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthPromptProvider } from "./contexts/AuthPromptContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
                <link rel="canonical" href="https://carhub-rw.vercel.app/" />
              </Helmet>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/verify-otp" element={<VerifyOTP />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/add-car" element={<AddCar />} />
                  <Route path="/buy-cars" element={<BuyCars />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/list-car" element={<ListCar />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/car/:id" element={<CarDetails />} />
                  <Route path="/admin/cars" element={<AdminCars />} />
                  <Route path="/admin/support-chat" element={<AdminSupportChat />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/edit-car/:id" element={<EditCar />} />
                  <Route path="/test-drive/:id" element={<TestDriveBooking />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </ErrorBoundary>
          </TooltipProvider>
        </AuthPromptProvider>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
