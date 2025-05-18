import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import cryptoApi, { Crypto } from '@/lib/api/crypto';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { cryptoPriceUtils } from '@/lib/utils/crypto-price';
import { getBitcoinPrice } from "@/lib/shared/bitcoin-price";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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

        {/* BTC Price Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Bitcoin Price</h2>
          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-gray-400 mb-1">Current Price</p>
            <p className="text-2xl font-bold">
              ${btcPrice ? btcPrice.toLocaleString() : '0.00'}
            </p>
            <p className="text-sm text-blue-400">
              Using shared Bitcoin price from CoinGecko
            </p>
          </div>
        </div>

        {/* Assets Summary Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Assets</h2>
          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-gray-400 mb-1">Total Assets</p>
            <p className="text-2xl font-bold">{portfolio?.assets?.length || 0}</p>
            {portfolio?.assets && portfolio.assets.length > 0 && (
              <div className="mt-2 text-sm">
                {portfolio.assets.slice(0, 2).map(asset => (
                  <div key={asset.id} className="flex justify-between items-center mt-2">
                    <span className="text-gray-300">{asset.symbol}</span>
                    <span>{asset.amount.toFixed(asset.symbol.toLowerCase() === 'btc' ? 8 : 2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="/dashboard/deposit" className="flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Deposit
              </span>
            </a>
            <a href="/dashboard/withdraw" className="flex items-center justify-center py-3 px-4 border border-red-500 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0v-1m6 0H7" />
                </svg>
                Withdraw
              </span>
            </a>
            <a href="/dashboard/help" className="flex items-center justify-center py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Help
              </span>
            </a>
            <a href="/dashboard/support" className="flex items-center justify-center py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Support
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed - Takes up 2/3 on larger screens */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Activity Item 1 */}
            <div className="p-4 bg-gray-700 rounded-lg flex items-start">
              <div className="bg-green-500 rounded-full p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">BTC Deposit</p>
                  <p className="text-gray-400 text-sm">Today</p>
                </div>
                <p className="text-green-500">+0.00325 BTC</p>
                <p className="text-gray-400 text-sm mt-1">Deposit confirmed</p>
              </div>
            </div>
            {/* Activity Item 2 */}
            <div className="p-4 bg-gray-700 rounded-lg flex items-start">
              <div className="bg-blue-500 rounded-full p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">Portfolio Updated</p>
                  <p className="text-gray-400 text-sm">Yesterday</p>
                </div>
                <p className="text-gray-300">Portfolio value increased by 2.4%</p>
                <p className="text-gray-400 text-sm mt-1">BTC price change</p>
              </div>
            </div>
          </div>
        </div>

        {/* Market Trends Panel */}
        <div className="bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Market Trends</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center mr-3">
                    <span className="font-bold text-black">₿</span>
                  </div>
                  <span>Bitcoin</span>
                </div>
                <span className="text-sm text-gray-400">
                  {/* Using direct price from shared source instead of calculated change */}
                  ${btcPrice ? btcPrice.toLocaleString() : '0.00'}
                </span>
              </div>
              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: '50%' }}
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <a href="#" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
              <span>View more market data</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}