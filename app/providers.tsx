"use client";

import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "@/components/ui/Toast";
import { useEffect, useState } from "react";

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
    <SessionProvider>
      {children}
      {mounted && <ToastContainer />}
    </SessionProvider>
  );
}
