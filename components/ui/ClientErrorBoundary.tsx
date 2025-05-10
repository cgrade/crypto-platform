'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the ErrorBoundary to avoid SSR issues
const ErrorBoundary = dynamic(
  () => import('./ErrorBoundary'),
  { ssr: false }
);

interface ClientErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ClientErrorBoundary({ children }: ClientErrorBoundaryProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
