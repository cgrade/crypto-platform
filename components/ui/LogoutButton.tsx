"use client";

import { signOut } from "next-auth/react";
import { Button } from "./Button";

type LogoutButtonProps = {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
  className?: string;
};

export function LogoutButton({ 
  variant = "default", 
  size = "default", 
  className = "" 
}: LogoutButtonProps) {
  // Use absolute URL in production, relative URL in development
  const callbackUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? 'https://cryptpro.online/login' 
    : '/login';
    
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => signOut({ callbackUrl })}
    >
      Logout
    </Button>
  );
}
