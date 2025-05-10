import { Metadata } from 'next';
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DashboardLayoutComponent from '@/components/dashboard/DashboardLayout';

export const metadata: Metadata = {
  title: 'Dashboard | CryptoPro',
  description: 'Manage your crypto portfolio and transactions',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  // Server-side authentication check
  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardLayoutComponent>
      {children}
    </DashboardLayoutComponent>
  );
}
