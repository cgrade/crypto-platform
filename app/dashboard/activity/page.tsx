import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Fetch all user transactions
  let transactions = [];
  try {
    transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 bg-gray-900 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Transaction History</h1>
        <Link href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Link 
          href="/dashboard/activity" 
          className="px-4 py-2 bg-blue-600 rounded-lg text-white"
        >
          All
        </Link>
        <Link 
          href="/dashboard/activity?type=DEPOSIT" 
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
        >
          Deposits
        </Link>
        <Link 
          href="/dashboard/activity?type=WITHDRAWAL" 
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
        >
          Withdrawals
        </Link>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`${transaction.type === 'DEPOSIT' ? 'bg-green-500' : 'bg-red-500'} rounded-full p-1.5 mr-3`}>
                          {transaction.type === 'DEPOSIT' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0v-1m6 0H7" />
                            </svg>
                          )}
                        </div>
                        <span>{transaction.cryptoType} {transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${transaction.type === 'DEPOSIT' ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.type === 'DEPOSIT' ? '+' : '-'}{transaction.amount} {transaction.cryptoType}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 
                        transaction.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.status.charAt(0) + transaction.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center">
                        <span className="font-mono text-xs">{transaction.id.substring(0, 8)}...</span>
                        {transaction.txHash && (
                          <Link 
                            href={`https://www.blockchain.com/explorer/transactions/btc/${transaction.txHash}`}
                            target="_blank"
                            className="ml-2 text-blue-400 hover:text-blue-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-gray-400 text-lg">No transactions found</p>
            <p className="text-gray-500 mt-2">Your transaction history will appear here</p>
            <div className="mt-6">
              <Link href="/dashboard/deposit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
                Make your first deposit
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
