"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';

// Transaction type definition
type Transaction = {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  cryptoType: 'BTC';
  cryptoAddress: string | null;
  txHash: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    btcAddress: string | null;
  };
};

export default function AdminTransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals'>('all');
  const [activeStatus, setActiveStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [txHashInput, setTxHashInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      let queryParams = '';
      if (activeTab === 'deposits') queryParams += 'type=DEPOSIT';
      if (activeTab === 'withdrawals') queryParams += 'type=WITHDRAWAL';
      if (activeStatus !== 'all') {
        if (queryParams) queryParams += '&';
        queryParams += `status=${activeStatus.toUpperCase()}`;
      }

      const response = await fetch(`/api/admin/transactions${queryParams ? '?' + queryParams : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setErrorMessage('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Load transactions on component mount and when filters change
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchTransactions();
    }
  }, [session, activeTab, activeStatus]);

  // Format currency for display
  const formatCurrency = (value: number, symbol: string = '$') => {
    return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format crypto amount
  const formatCrypto = (value: number, symbol: string) => {
    const precision = symbol === 'BTC' ? 8 : 2;
    return `${value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })} ${symbol}`;
  };

  // Handle deposit/withdrawal approval
  const handleApproveTransaction = async (transaction: Transaction, approved: boolean) => {
    if (!transaction) return;
    
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const response = await fetch(`/api/admin/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approved ? 'COMPLETED' : 'FAILED',
          txHash: txHashInput || null,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to process transaction');
      }
      
      setSuccessMessage(data.message || `${transaction.type.toLowerCase()} ${approved ? 'approved' : 'rejected'} successfully`);
      setSelectedTransaction(null);
      setTxHashInput('');
      
      // Refresh transactions list
      fetchTransactions();
    } catch (error) {
      console.error('Error processing transaction:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Transaction Management</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  // Render access denied if not admin
  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Transaction Management</h1>
        <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-lg">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transaction Management</h1>
      
      {/* Success/error messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-800 text-green-400 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-lg">
          {errorMessage}
        </div>
      )}
      
      {/* Transaction type tabs */}
      <div className="mb-6 border-b border-dark-100">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-1 ${
              activeTab === 'all'
                ? 'border-b-2 border-primary-500 text-primary-500 font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`pb-3 px-1 ${
              activeTab === 'deposits'
                ? 'border-b-2 border-primary-500 text-primary-500 font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Deposits
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`pb-3 px-1 ${
              activeTab === 'withdrawals'
                ? 'border-b-2 border-primary-500 text-primary-500 font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Withdrawals
          </button>
        </div>
      </div>
      
      {/* Status filter */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveStatus('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              activeStatus === 'all'
                ? 'bg-dark-100 text-white'
                : 'text-gray-400 hover:bg-dark-200'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setActiveStatus('pending')}
            className={`px-3 py-1 rounded-full text-sm ${
              activeStatus === 'pending'
                ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                : 'text-gray-400 hover:bg-dark-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveStatus('completed')}
            className={`px-3 py-1 rounded-full text-sm ${
              activeStatus === 'completed'
                ? 'bg-green-900/30 text-green-400 border border-green-800'
                : 'text-gray-400 hover:bg-dark-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveStatus('failed')}
            className={`px-3 py-1 rounded-full text-sm ${
              activeStatus === 'failed'
                ? 'bg-red-900/30 text-red-400 border border-red-800'
                : 'text-gray-400 hover:bg-dark-200'
            }`}
          >
            Failed
          </button>
        </div>
      </div>
      
      {/* Transactions table - Desktop */}
      <div className="bg-dark-200 rounded-xl overflow-hidden shadow-md hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-dark-100">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Type</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No transactions found matching your criteria
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-dark-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{format(new Date(transaction.createdAt), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-gray-400">{format(new Date(transaction.createdAt), 'HH:mm:ss')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{transaction.user.name || 'User'}</div>
                      <div className="text-xs text-gray-400">{transaction.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.type === 'DEPOSIT' 
                          ? 'bg-blue-900/30 text-blue-400 border border-blue-800' 
                          : 'bg-purple-900/30 text-purple-400 border border-purple-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-medium">{formatCrypto(transaction.amount, transaction.cryptoType)}</div>
                      <div className="text-xs text-gray-400">
                        {formatCurrency(transaction.amount * 50000)} {/* Using static $50k BTC price */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.status === 'PENDING' 
                          ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' 
                          : transaction.status === 'COMPLETED'
                          ? 'bg-green-900/30 text-green-400 border border-green-800'
                          : 'bg-red-900/30 text-red-400 border border-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {transaction.status === 'PENDING' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setTxHashInput('');
                          }}
                        >
                          Process
                        </Button>
                      ) : (
                        <div className="text-xs text-gray-400">
                          {transaction.txHash ? (
                            <span className="truncate max-w-[100px] inline-block">
                              Tx: {transaction.txHash.substring(0, 8)}...
                            </span>
                          ) : 'No tx hash'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile-friendly card view */}
      <div className="md:hidden space-y-4">
        {transactions.length === 0 ? (
          <div className="bg-dark-200 rounded-xl p-6 text-center text-gray-400">
            No transactions found matching your criteria
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="bg-dark-200 rounded-xl p-4 shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                    transaction.type === 'DEPOSIT' 
                      ? 'bg-blue-900/30 text-blue-400 border border-blue-800' 
                      : 'bg-purple-900/30 text-purple-400 border border-purple-800'
                  }`}>
                    {transaction.type}
                  </span>
                </div>
                <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                  transaction.status === 'PENDING' 
                    ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' 
                    : transaction.status === 'COMPLETED'
                    ? 'bg-green-900/30 text-green-400 border border-green-800'
                    : 'bg-red-900/30 text-red-400 border border-red-800'
                }`}>
                  {transaction.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm">
                  <div className="font-medium">{transaction.user.name || 'User'}</div>
                  <div className="text-xs text-gray-400">{transaction.user.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCrypto(transaction.amount, transaction.cryptoType)}</div>
                  <div className="text-xs text-gray-400">{formatCurrency(transaction.amount * 50000)}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-400">
                <div>{format(new Date(transaction.createdAt), 'MMM d, yyyy HH:mm')}</div>
                {transaction.status === 'PENDING' ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setTxHashInput('');
                    }}
                    className="w-full mt-2"
                  >
                    Process Transaction
                  </Button>
                ) : (
                  transaction.txHash && (
                    <div className="text-xs overflow-hidden text-ellipsis">
                      Tx: {transaction.txHash.substring(0, 8)}...
                    </div>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Transaction processing modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-dark-200 rounded-xl p-6 max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Process {selectedTransaction.type.toLowerCase()}
              </h3>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-dark-100"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Transaction status badge */}
            <div className="mb-4">
              <span className={`inline-block px-3 py-1.5 text-sm rounded-lg font-medium ${
                selectedTransaction.status === 'PENDING' 
                  ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' 
                  : selectedTransaction.status === 'COMPLETED'
                  ? 'bg-green-900/30 text-green-400 border border-green-800'
                  : 'bg-red-900/30 text-red-400 border border-red-800'
              }`}>
                {selectedTransaction.status}
              </span>
            </div>
            
            {/* Transaction details */}
            <div className="p-4 bg-dark-300 rounded-lg mb-4 space-y-3">
              <div>
                <div className="text-sm text-gray-400 mb-1">User</div>
                <div className="flex justify-between items-center">
                  <div className="font-medium">{selectedTransaction.user.name || 'User'}</div>
                  <div className="text-sm text-gray-400">{selectedTransaction.user.email}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Amount</div>
                <div className="flex justify-between items-center">
                  <div className="font-medium">{formatCrypto(selectedTransaction.amount, selectedTransaction.cryptoType)}</div>
                  <div className="text-sm text-gray-400">{formatCurrency(selectedTransaction.amount * 50000)}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Date</div>
                <div className="font-medium">{format(new Date(selectedTransaction.createdAt), 'MMM d, yyyy HH:mm:ss')}</div>
              </div>
              
              {selectedTransaction.type === 'DEPOSIT' && selectedTransaction.cryptoAddress && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">From Address</div>
                  <div className="font-medium break-all text-sm">{selectedTransaction.cryptoAddress}</div>
                </div>
              )}
              
              {selectedTransaction.type === 'WITHDRAWAL' && selectedTransaction.cryptoAddress && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">To Address</div>
                  <div className="font-medium break-all text-sm">{selectedTransaction.cryptoAddress}</div>
                </div>
              )}
            </div>
            
            {/* Transaction hash input for completed transactions */}
            <div className="mb-6">
              <label htmlFor="txHash" className="block text-sm font-medium text-gray-300 mb-2">
                Transaction Hash
              </label>
              <input
                type="text"
                id="txHash"
                value={txHashInput}
                onChange={(e) => setTxHashInput(e.target.value)}
                className="w-full p-3 bg-dark-100 rounded-lg border border-dark-50 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter blockchain transaction hash"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required when approving, optional when rejecting
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedTransaction(null)}
                disabled={isProcessing}
                className="w-full sm:w-auto order-3 sm:order-1"
              >
                Cancel
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleApproveTransaction(selectedTransaction, false)}
                disabled={isProcessing}
                className="w-full sm:w-auto order-2 bg-red-900/30 text-red-400 border-red-800 hover:bg-red-900/50 hover:text-red-300"
              >
                {isProcessing ? 'Processing...' : 'Reject'}
              </Button>
              
              <Button
                onClick={() => handleApproveTransaction(selectedTransaction, true)}
                disabled={isProcessing || (selectedTransaction.type === 'DEPOSIT' && !txHashInput)}
                className="w-full sm:w-auto order-1 sm:order-3"
              >
                {isProcessing ? 'Processing...' : 'Approve'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
