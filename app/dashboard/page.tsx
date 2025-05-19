import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import cryptoApi, { Crypto } from '@/lib/api/crypto';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { cryptoPriceUtils } from '@/lib/utils/crypto-price';
import { getBitcoinPrice } from "@/lib/shared/bitcoin-price";
import { formatDistanceToNow } from 'date-fns';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Get Bitcoin price using the shared function
  let btcPrice: number;
  try {
    // Use the shared Bitcoin price function that handles caching internally
    btcPrice = await getBitcoinPrice();
    console.log('Dashboard - Using shared BTC price function:', btcPrice);
  } catch (error) {
    console.error('Dashboard - Failed to get BTC price:', error);
    // We'll continue with a null price, which will result in $0 portfolio value
    btcPrice = 0;
  }

  // Fetch portfolio with user-friendly error handling
  let portfolio = null;
  let totalPortfolioValue = 0;
  let portfolioChange24h = 0;
  
  // Fetch user transactions for the activity feed
  let recentTransactions = [];
  try {
    recentTransactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
  } catch (error) {
    console.error('Failed to fetch recent transactions:', error);
  }
  
  try {
    portfolio = await prisma.portfolio.findFirst({
      where: { userId: session.user.id },
      include: { assets: true }
    });
    
    // Calculate real portfolio value based on current prices
    if (portfolio && portfolio.assets && portfolio.assets.length > 0) {
      // Calculate total value directly using the shared BTC price
      const updatedAssets = portfolio.assets.map(asset => {
        if (asset.symbol.toLowerCase() === 'btc') {
          const value = asset.amount * btcPrice;
          return {
            ...asset,
            price: btcPrice,
            value: value
          };
        }
        return asset;
      });
      
      // Calculate total portfolio value
      totalPortfolioValue = updatedAssets.reduce((total, asset) => {
        // Type-safe access to the value property
        const assetValue = 'value' in asset ? asset.value : 0;
        return total + assetValue;
      }, 0);
      
      // Debug information
      console.log('Dashboard - BTC Price used:', btcPrice);
      console.log('Dashboard - Total portfolio value:', totalPortfolioValue);
      console.log('Dashboard - Asset values:', updatedAssets);
    }
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-8 bg-gray-900 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {session?.user?.name || 'User'}</h1>
      </div>
      {/* Portfolio Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Portfolio Summary Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Portfolio Summary</h2>
          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-gray-400 mb-1">Total Balance</p>
            {portfolio && portfolio.assets ? (
              <>
                <p className="text-2xl font-bold">
                  {cryptoApi.formatCurrency(totalPortfolioValue)}
                </p>
                <p className={`text-sm ${portfolioChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {portfolioChange24h >= 0 ? '+' : ''}
                  {portfolioChange24h.toFixed(2)}% today
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-gray-400">No portfolio data</p>
            )}
          </div>
          <div className="mt-4">
            <a href="/dashboard/portfolio" className="block text-center py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors">
              View Portfolio
            </a>
          </div>
        </div>





        {/* Quick Actions Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/dashboard/deposit" className="flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium">Deposit</span>
            </a>
            <a href="/dashboard/withdraw" className="flex items-center justify-center py-3 px-4 border border-red-500 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0v-1m6 0H7" />
              </svg>
              <span className="font-medium">Withdraw</span>
            </a>
            <a href="/dashboard/help" className="flex items-center justify-center py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Help</span>
            </a>
            <a href="/dashboard/support" className="flex items-center justify-center py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Activity Feed */}
        <div className="bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(transaction => (
                <div key={transaction.id} className="p-4 bg-gray-700 rounded-lg flex items-start">
                  <div className={`${transaction.type === 'DEPOSIT' ? 'bg-green-500' : 'bg-red-500'} rounded-full p-2 mr-4`}>
                    {transaction.type === 'DEPOSIT' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0v-1m6 0H7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">
                        {transaction.cryptoType} {transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className={`${transaction.type === 'DEPOSIT' ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.type === 'DEPOSIT' ? '+' : '-'}{transaction.amount} {transaction.cryptoType}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Status: {transaction.status.charAt(0) + transaction.status.slice(1).toLowerCase()}
                      {transaction.txHash && (
                        <span className="ml-2">• Tx: {transaction.txHash.substring(0, 6)}...{transaction.txHash.substring(transaction.txHash.length - 4)}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 bg-gray-700 rounded-lg text-center">
                <p className="text-gray-400">No recent activity found</p>
                <p className="text-sm text-gray-500 mt-2">Your transactions will appear here</p>
              </div>
            )}
            
            {recentTransactions.length > 0 && (
              <div className="mt-4 text-center">
                <Link href="/dashboard/activity" className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center">
                  <span>View all activity</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}