import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import cryptoApi, { Crypto } from '@/lib/api/crypto';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Fetch real-time crypto prices with improved error handling
  let cryptoPrices: Crypto[] = [];
  try {
    cryptoPrices = await cryptoApi.getPrices(['bitcoin', 'ethereum']);
  } catch (error) {
    console.error('Failed to fetch crypto prices:', error);
  }

  // Fetch portfolio with user-friendly error handling
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
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-8 bg-gray-900 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {session?.user?.name || 'User'}</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Portfolio Summary Card - Add responsive classes */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Portfolio Summary</h2>
          <div className="p-4 bg-gray-700 rounded-lg">
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
              <p className="text-2xl font-bold text-gray-400">No portfolio data</p>
            )}
          </div>
          <div className="mt-4">
            <a href="/dashboard/portfolio" className="block text-center py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors">
              View Portfolio
            </a>
          </div>
        </div>
        {/* Similar changes for other cards, ensuring mobile-friendly layouts */}
      </div>
    </div>
  );
}