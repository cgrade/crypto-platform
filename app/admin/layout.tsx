import React from 'react';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DashboardLayoutComponent from '@/components/dashboard/DashboardLayout';

export const metadata: Metadata = {
  title: 'Admin Dashboard | CryptPro',
  description: 'CryptPro Admin Dashboard',
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  // Server-side authentication and role check
  if (!session) {
    redirect('/login');
  }
  
  // Check if user has admin role
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <DashboardLayoutComponent>
      {children}
    </DashboardLayoutComponent>
  );
}
