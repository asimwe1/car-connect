import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import OfflineBanner from "@/components/OfflineBanner";

const Layout: React.FC = () => {
  const location = useLocation();
  const hideGlobalChrome = location.pathname.startsWith('/admin') || 
                          location.pathname === '/support' || 
                          location.pathname === '/admin/support-chat';
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideGlobalChrome && <OfflineBanner />}
      {!hideGlobalChrome && <Navbar />}
      <main className={!hideGlobalChrome ? "pt-16 flex-1" : "flex-1"}>
        <Outlet />
      </main>
      {!hideGlobalChrome && <Footer />}
      {!hideGlobalChrome && <FloatingActions />}
    </div>
  );
};

export default Layout;


