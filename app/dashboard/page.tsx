import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import cryptoApi from '@/lib/api/crypto';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  // Fetch real-time crypto prices
  let cryptoPrices = await cryptoApi.getPrices(['bitcoin', 'ethereum']).catch(error => {
    console.error('Failed to fetch crypto prices:', error);
    return []; // Return empty array on error
  });
  
  // Get user's portfolio if available
  let portfolio = null;
  try {
    portfolio = await prisma.portfolio.findFirst({
      where: { userId: session.user.id },
      include: { assets: true }
    });
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Welcome, {session?.user?.name || 'User'}</h1>
      </div>
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
            <div className="p-4 bg-dark-100 rounded-lg">
              <p className="text-gray-400 mb-1">Total Balance</p>
              {portfolio ? (
                <>
                  <p className="text-2xl font-bold">
                    {cryptoApi.formatCurrency(portfolio.totalValue)}
                  </p>
                  {cryptoPrices.length > 0 && cryptoPrices[0].price_change_percentage_24h !== null && (
                    <p className={`text-sm ${cryptoPrices[0].price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {cryptoPrices[0].price_change_percentage_24h >= 0 ? '+' : ''}
                      {cryptoPrices[0].price_change_percentage_24h.toFixed(2)}% today
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold">$0.00</p>
                  <p className="text-gray-400 text-sm">No assets yet</p>
                </>
              )}
            </div>
            
            <div className="mt-4">
              <a 
                href="/dashboard/portfolio" 
                className="block text-center py-2 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                View Portfolio
              </a>
            </div>
          </div>
          
          <div className="bg-dark-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
            <div className="space-y-3">
              {cryptoPrices.length > 0 ? (
                cryptoPrices.map((crypto) => (
                  <div key={crypto.id} className="flex justify-between items-center p-3 bg-dark-100 rounded-lg">
                    <div className="flex items-center">
                      <img 
                        src={crypto.image} 
                        alt={crypto.name} 
                        className="w-6 h-6 mr-2 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{crypto.name}</p>
                        <p className="text-sm text-gray-400">{crypto.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{cryptoApi.formatCurrency(crypto.current_price)}</p>
                      <p className={`text-sm ${(crypto.price_change_percentage_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {(crypto.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                        {(crypto.price_change_percentage_24h || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-400">Unable to load market data</p>
                  <p className="text-sm text-gray-500">Please refresh the page</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-dark-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a 
                href="/dashboard/deposit" 
                className="block text-center py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
              >
                Deposit Funds
              </a>
              <a 
                href="/dashboard/withdraw" 
                className="block text-center py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              >
                Withdraw Funds
              </a>
              {session?.user?.role === 'ADMIN' && (
                <a 
                  href="/admin/users" 
                  className="block text-center py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Manage Users
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
