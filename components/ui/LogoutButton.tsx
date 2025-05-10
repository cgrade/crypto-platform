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
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Logout
    </Button>
  );
}
