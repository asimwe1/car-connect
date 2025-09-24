import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import OfflineBanner from "@/components/OfflineBanner";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OfflineBanner />
      <Navbar />
      <main className="pt-16 flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default Layout;


