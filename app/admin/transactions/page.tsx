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
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const endpoint = transaction.type === 'DEPOSIT' 
        ? '/api/transactions/deposit' 
        : '/api/transactions/withdraw';
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: transaction.id,
          status: approved ? 'COMPLETED' : 'FAILED',
          txHash: txHashInput || undefined,
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
      
      {/* Transactions table */}
      <div className="bg-dark-200 rounded-xl overflow-hidden shadow-md">
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
      
      {/* Transaction processing modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-dark-200 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              Process {selectedTransaction.type.toLowerCase()}
            </h3>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">User:</span>
                <span>{selectedTransaction.user.name || 'User'} ({selectedTransaction.user.email})</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Amount:</span>
                <span>{formatCrypto(selectedTransaction.amount, selectedTransaction.cryptoType)}</span>
              </div>
              {selectedTransaction.type === 'WITHDRAWAL' && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">To Address:</span>
                  <span className="text-xs break-all">{selectedTransaction.cryptoAddress}</span>
                </div>
              )}
              {selectedTransaction.type === 'DEPOSIT' && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">User's BTC Address:</span>
                  <span className="text-xs break-all">{selectedTransaction.user.btcAddress || 'Not set'}</span>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Transaction Hash (optional)
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="e.g. 7b5e72f023cd0121dbc4..."
                value={txHashInput}
                onChange={(e) => setTxHashInput(e.target.value)}
                disabled={isProcessing}
              />
              <p className="mt-1 text-xs text-gray-400">
                For {selectedTransaction.type === 'DEPOSIT' ? 'deposits' : 'withdrawals'}, you can record the on-chain transaction hash.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleApproveTransaction(selectedTransaction, true)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => handleApproveTransaction(selectedTransaction, false)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedTransaction(null)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
