import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface UserPageProps {
  params: {
    id: string;
  };
}

export default function UserDetailPage({ params }: UserPageProps) {
  // In a real application, we would fetch the user data based on the ID
  // This is sample data for demonstration
  const userId = params.id;
  
  const user = {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    joined: '2023-05-15',
    status: 'active',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    lastLogin: '2023-11-01T10:23:45Z',
  };
  
  const portfolio = {
    totalValue: 18420.69,
    assets: [
      { id: 1, name: 'Bitcoin', symbol: 'BTC', amount: 0.428, value: 12380, price: 28925.23, change: 2.5 },
      { id: 2, name: 'Ethereum', symbol: 'ETH', amount: 2.5, value: 4320, price: 1728, change: 3.2 },
      { id: 3, name: 'Tether', symbol: 'USDT', amount: 1720.69, value: 1720.69, price: 1, change: 0 },
    ],
    transactions: [
      { id: 1, type: 'DEPOSIT', amount: 5000, status: 'COMPLETED', date: '2023-10-25T14:30:00Z', cryptoType: 'USDT' },
      { id: 2, type: 'WITHDRAWAL', amount: 1500, status: 'COMPLETED', date: '2023-10-28T09:15:00Z', cryptoType: 'USDT' },
      { id: 3, type: 'DEPOSIT', amount: 0.15, status: 'PENDING', date: '2023-11-01T11:45:00Z', cryptoType: 'BTC' },
    ]
  };

  return (
    <div className="min-h-screen bg-dark-300 text-white">
      {/* Admin Header */}
      <header className="bg-dark-200 border-b border-dark-100 h-16 flex items-center px-6">
        <div className="flex-1 flex items-center gap-2">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl">CryptoPro</span>
          </Link>
          <span className="text-primary-500 ml-2">Admin</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-400 hover:text-white flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-primary-500 flex items-center justify-center text-white font-bold text-lg">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="default">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit User
            </Button>
            <Button variant="outline" size="default" className="text-red-500 border-red-500 hover:bg-red-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Suspend Account
            </Button>
          </div>
        </div>
        
        {/* User Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 bg-dark-200">
            <h2 className="text-lg font-medium text-white mb-4">User Information</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="text-white">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-white">{user.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Country</p>
                <p className="text-white">{user.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Joined</p>
                <p className="text-white">{new Date(user.joined).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Last Login</p>
                <p className="text-white">{new Date(user.lastLogin).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </p>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 card p-6 bg-dark-200">
            <h2 className="text-lg font-medium text-white mb-4">Manage Portfolio</h2>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-400">Total Portfolio Value</p>
                <p className="text-white font-bold">${portfolio.totalValue.toLocaleString()}</p>
              </div>
              <div className="w-full bg-dark-100 rounded-full h-1">
                <div className="bg-primary-500 h-1 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-white mb-3">Update Balances</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {portfolio.assets.map((asset) => (
                    <div key={asset.id} className="card bg-dark-100 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xs">
                          {asset.symbol.substring(0, 1)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{asset.name}</p>
                          <p className="text-xs text-gray-400">{asset.symbol}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-3">
                        <p className="text-sm text-gray-400">Current Balance:</p>
                        <p className="text-sm text-white ml-2">{asset.amount.toLocaleString()} {asset.symbol}</p>
                        <p className="text-xs text-gray-400 ml-2">(${asset.value.toLocaleString()})</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <input 
                            type="number" 
                            step="0.0001"
                            className="input w-full py-2" 
                            placeholder={`Enter new ${asset.symbol} amount`}
                            defaultValue={asset.amount}
                          />
                        </div>
                        <Button className="w-full">Update</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-white mb-3">Add New Asset</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select className="input bg-dark-300 py-2 px-4">
                    <option>Select Asset</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="USDT">Tether (USDT)</option>
                    <option value="BNB">Binance Coin (BNB)</option>
                    <option value="XRP">Ripple (XRP)</option>
                  </select>
                  <input 
                    type="number" 
                    step="0.0001"
                    className="input py-2" 
                    placeholder="Enter amount"
                  />
                  <Button>Add Asset</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Transactions */}
        <div className="card bg-dark-200 overflow-hidden">
          <div className="p-6 border-b border-dark-100">
            <h2 className="text-lg font-medium text-white">Recent Transactions</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-100 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {portfolio.transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-dark-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${
                          transaction.type === 'DEPOSIT' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        } flex items-center justify-center`}>
                          {transaction.type === 'DEPOSIT' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}</div>
                          <div className="text-xs text-gray-400">{transaction.cryptoType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {transaction.type === 'DEPOSIT' ? '+' : '-'}{transaction.amount} {transaction.cryptoType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{new Date(transaction.date).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                          transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {transaction.status.charAt(0) + transaction.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button className="text-primary-500 hover:text-primary-400">
                          View
                        </button>
                        {transaction.status === 'PENDING' && (
                          <>
                            <button className="text-green-500 hover:text-green-400">
                              Approve
                            </button>
                            <button className="text-red-500 hover:text-red-400">
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 border-t border-dark-100">
            <Button variant="outline" size="default">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Manual Transaction
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
