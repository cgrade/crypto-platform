"use client";

import { ToastContainer } from "@/components/ui/Toast";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/context/AuthContext";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  // Only render toast container on client side to avoid hydration errors
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <AuthProvider>
      {children}
      {mounted && <ToastContainer />}
    </AuthProvider>
  );
}
