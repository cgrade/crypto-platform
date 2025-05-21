"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import cryptoApi from '@/lib/api/crypto';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  portfolioValue: number;
  status: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  cryptoType: string;
  cryptoAddress?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      id: '1', 
      amount: 2.5, 
      type: 'DEPOSIT', 
      status: 'PENDING', 
      cryptoType: 'BTC', 
      cryptoAddress: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
      createdAt: '2023-11-15T12:30:00Z',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }
    },
    { 
      id: '2', 
      amount: 5, 
      type: 'WITHDRAWAL', 
      status: 'PENDING', 
      cryptoType: 'ETH', 
      cryptoAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      createdAt: '2023-11-16T09:45:00Z',
      user: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
    },
    { 
      id: '3', 
      amount: 500, 
      type: 'DEPOSIT', 
      status: 'PENDING', 
      cryptoType: 'USDT', 
      cryptoAddress: 'TNPeeaaFT7rvY5mHhBkJXMXYb1h7YwSvCX',
      createdAt: '2023-11-17T15:20:00Z',
      user: {
        id: '3',
        name: 'Robert Johnson',
        email: 'robert@example.com'
      }
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [apiResponse, setApiResponse] = useState<{ success?: boolean; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<{
    BTC: number;
  }>({ BTC: 0 });
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  
  const fetcher = async () => {
    try {
      return await cryptoApi.getPrices(['bitcoin']);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`API Error: ${error.message}`);
      }
      throw error;
    }
  };
  
  const { data: cryptoData, error: cryptoError } = useSWR(
    isClient ? "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin" : null,
    fetcher,
    {
      refreshInterval: 30000, 
      revalidateOnFocus: true,
      dedupingInterval: 10000, 
      errorRetryCount: 3,
      onSuccess: (data) => {
        const btcData = data.find(crypto => crypto.id === 'bitcoin');
        
        if (btcData) {
          setCryptoPrices({
            BTC: btcData.current_price
          });
        }
        setIsLoadingPrices(false);
      }
    }
  );
  
  useEffect(() => {
    if (!isClient) return; 
    
    if (cryptoError) {
      console.error("Error fetching crypto prices:", cryptoError);
      setCryptoPrices({
        BTC: 45000
      });
      setIsLoadingPrices(false);
    }
  }, [cryptoError, isClient]);

  useEffect(() => {
    if (!isClient) return; 
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const usersResponse = await fetch('/api/admin/users');
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users);
        }
        
        const transactionsResponse = await fetch('/api/admin/transactions?status=PENDING');
        
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData.transactions);
        }
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isClient]);

  const analytics = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.status === 'active').length,
    totalPortfolioValue: users.reduce((total, user) => total + user.portfolioValue, 0),
    averagePortfolioValue: users.length > 0 
      ? users.reduce((total, user) => total + user.portfolioValue, 0) / users.length 
      : 0
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
    setApiResponse({});
  };

  const handleTransactionAction = async (action: 'approve' | 'reject') => {
    if (!selectedTransaction) return;
    
    setIsSubmitting(true);
    setApiResponse({});
    
    try {
      setTimeout(() => {
        setApiResponse({ 
          success: true, 
          message: `Transaction ${action === 'approve' ? 'approved' : 'rejected'} successfully!` 
        });
        
        setTransactions(transactions.filter(t => t.id !== selectedTransaction.id));
        
        setTimeout(() => {
          setIsTransactionModalOpen(false);
          setSelectedTransaction(null);
        }, 1500);
      }, 800);
      
    } catch (error: unknown) {
      setApiResponse({ success: false, message: String(error) });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fallback analytics data (when loading)
  const fallbackAnalytics = {
    totalUsers: 0,
    activeUsers: 0,
    totalPortfolioValue: 0,
    averagePortfolioValue: 0,
  };
  
  // Use real or fallback analytics data depending on loading state
  const displayAnalytics = isLoading ? fallbackAnalytics : analytics;

  // Avoid rendering complex UI until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="p-6 min-h-screen bg-dark-300">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-dark-200 rounded w-1/4"></div>
          <div className="h-32 bg-dark-200 rounded"></div>
          <div className="h-64 bg-dark-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users and platform settings</p>
        </div>
        <Link href="/admin/users">
          <Button>Manage Users</Button>
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-200 p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm mb-2">Bitcoin Price</h3>
          {isLoadingPrices ? (
            <div className="animate-pulse h-8 w-32 bg-dark-100 rounded"></div>
          ) : (
            <p className="text-2xl font-bold text-white">
              ${cryptoPrices.BTC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
          <div className="text-xs text-green-500 mt-1">Live market price</div>
        </div>
        <div className="bg-dark-200 p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-white">{displayAnalytics.totalUsers}</p>
          <div className="text-xs text-green-500 mt-1">+12% from last month</div>
        </div>
        <div className="bg-dark-200 p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm mb-2">Active Users</h3>
          <p className="text-2xl font-bold text-white">{displayAnalytics.activeUsers}</p>
          <div className="text-xs text-green-500 mt-1">+8% from last month</div>
        </div>
        <div className="bg-dark-200 p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm mb-2">Total Portfolio Value</h3>
          <p className="text-2xl font-bold text-white">${displayAnalytics.totalPortfolioValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</p>
          <div className="text-xs text-green-500 mt-1">+15% from last month</div>
        </div>
        <div className="bg-dark-200 p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm mb-2">Avg. Portfolio Value</h3>
          <p className="text-2xl font-bold text-white">${displayAnalytics.averagePortfolioValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</p>
          <div className="text-xs text-green-500 mt-1">+5% from last month</div>
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="bg-dark-200 rounded-xl overflow-hidden mb-8">
        <div className="p-6 border-b border-dark-100 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Pending Transactions</h2>
          <div className="text-sm text-gray-400">{transactions.length} transactions require your attention</div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No pending transactions to approve
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Crypto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-dark-100/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                          {transaction.user.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{transaction.user.name}</p>
                          <p className="text-xs text-gray-400">{transaction.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.type === 'DEPOSIT' 
                            ? 'bg-green-900/50 text-green-400' 
                            : transaction.type === 'WITHDRAWAL'
                              ? 'bg-red-900/50 text-red-400'
                              : 'bg-blue-900/50 text-blue-400'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.cryptoType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTransactionClick(transaction)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Users Preview */}
      <div className="bg-dark-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-dark-100 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Recent Users</h2>
          <Link href="/admin/users" className="text-primary-500 text-sm hover:underline">
            View all users
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Portfolio Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {users.slice(0, 5).map(user => (
                  <tr key={user.id} className="hover:bg-dark-100/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-900/50 text-green-400' 
                            : 'bg-yellow-900/50 text-yellow-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      ${user.portfolioValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Transaction Modal */}
      {isTransactionModalOpen && selectedTransaction && (
        <Modal
          isOpen={isTransactionModalOpen}
          onClose={() => {
            setIsTransactionModalOpen(false);
            setSelectedTransaction(null);
            setApiResponse({});
          }}
          title="Review Transaction"
        >
          <div className="p-6">
            {/* Transaction details */}
            <div className="mb-6 space-y-4">
              <div className="flex justify-between border-b border-dark-100 pb-2">
                <span className="text-gray-400">Transaction ID:</span>
                <span className="font-mono text-sm">{selectedTransaction.id}</span>
              </div>
              
              <div className="flex justify-between border-b border-dark-100 pb-2">
                <span className="text-gray-400">User:</span>
                <span>{selectedTransaction.user.name}</span>
              </div>
              
              <div className="flex justify-between border-b border-dark-100 pb-2">
                <span className="text-gray-400">Type:</span>
                <span className={
                  selectedTransaction.type === 'DEPOSIT' 
                    ? 'text-green-400' 
                    : selectedTransaction.type === 'WITHDRAWAL'
                      ? 'text-red-400'
                      : 'text-blue-400'
                }>{selectedTransaction.type}</span>
              </div>
              
              <div className="flex justify-between border-b border-dark-100 pb-2">
                <span className="text-gray-400">Amount:</span>
                <span className="font-medium">{selectedTransaction.amount} {selectedTransaction.cryptoType}</span>
              </div>
              
              <div className="flex justify-between border-b border-dark-100 pb-2">
                <span className="text-gray-400">Crypto Address:</span>
                <span className="font-mono text-sm truncate max-w-[200px]">{selectedTransaction.cryptoAddress}</span>
              </div>
              
              <div className="flex justify-between border-b border-dark-100 pb-2">
                <span className="text-gray-400">Date:</span>
                <span>{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
              </div>
            </div>
            
            {/* API response */}
            {apiResponse.message && (
              <div className={`p-4 mb-6 rounded-lg ${
                apiResponse.success 
                  ? 'bg-green-900/30 border border-green-800 text-green-400' 
                  : 'bg-red-900/30 border border-red-800 text-red-400'
              }`}>
                <p>{apiResponse.message}</p>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                disabled={isSubmitting || apiResponse.success}
                onClick={() => handleTransactionAction('reject')}
              >
                Reject
              </Button>
              <Button
                disabled={isSubmitting || apiResponse.success}
                onClick={() => handleTransactionAction('approve')}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : 'Approve'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
