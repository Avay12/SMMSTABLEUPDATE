import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-20 md:pt-24 pb-16 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
