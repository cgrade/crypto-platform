"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';

type Transaction = {
  id: string;
  amount: number;
  type: string;
  status: string;
  cryptoType: string;
  createdAt: string;
  updatedAt: string;
  txHash?: string;
};

export default function DepositPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ amount: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [depositAddress, setDepositAddress] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [copySuccess, setCopySuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [completedTransactions, setCompletedTransactions] = useState<Transaction[]>([]);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  
  const supportedCryptos = [
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      logo: '₿',
      networkInfo: 'Bitcoin Network (BTC)',
      minDeposit: 0.0001
    }
  ];

  // Fetch user's deposit address and transaction history
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch user profile to get BTC address
        const profileResponse = await fetch('/api/user/profile');
        const profileData = await profileResponse.json();
        console.log('Profile API response:', profileData);
        
        if (profileResponse.ok) {
          if (profileData.user?.btcAddress) {
            console.log('Setting BTC address:', profileData.user.btcAddress);
            setDepositAddress(profileData.user.btcAddress);
          } else {
            console.log('No BTC address found in user profile');
          }
          
          if (profileData.user?.btcAddressQrCode) {
            console.log('Setting QR code URL:', profileData.user.btcAddressQrCode);
            setQrCodeUrl(profileData.user.btcAddressQrCode);
          } else {
            console.log('No QR code found in user profile');
          }
        } else {
          console.error('Failed to fetch profile:', profileData);
        }

        // Fetch user's deposit transactions
        const transactionsResponse = await fetch('/api/user/transactions?type=DEPOSIT');
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          
          // Filter transactions by status
          setPendingTransactions(transactionsData.transactions.filter(
            (tx: Transaction) => tx.status === 'PENDING'
          ));
          
          setCompletedTransactions(transactionsData.transactions.filter(
            (tx: Transaction) => tx.status === 'COMPLETED'
          ));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrorMessage('Failed to load your deposit information');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCopyAddress = () => {
    if (!depositAddress) return;
    
    navigator.clipboard.writeText(depositAddress)
      .then(() => {
        setCopySuccess('Address copied!');
        setTimeout(() => setCopySuccess(''), 3000);
      })
      .catch(err => {
        console.error('Failed to copy address: ', err);
      });
  };

  const handleCryptoChange = (crypto: string) => {
    setSelectedCrypto(crypto);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid positive number';
    } else {
      const minAmount = supportedCryptos.find(c => c.symbol === selectedCrypto)?.minDeposit || 0;
      if (Number(formData.amount) < minAmount) {
        errors.amount = `Minimum deposit amount is ${minAmount} ${selectedCrypto}`;
      }
    }
    
    return errors;
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug current deposit address state
    console.log('Submitting deposit with address:', depositAddress);
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    if (!depositAddress) {
      setErrorMessage('No deposit address is assigned to your account');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(formData.amount),
          cryptoType: selectedCrypto
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit deposit request');
      }
      
      // Add the new transaction to pending list
      setPendingTransactions(prev => [data.transaction, ...prev]);
      
      setSuccessMessage('Deposit request submitted successfully. Please wait for admin approval.');
      setFormData({ amount: '' });
      
    } catch (error) {
      console.error('Error submitting deposit:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit deposit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug information to help troubleshoot
  useEffect(() => {
    console.log('Current deposit address state:', depositAddress);
    console.log('Current QR code state:', qrCodeUrl);
  }, [depositAddress, qrCodeUrl]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Deposit Crypto</h1>
          <p className="text-gray-400">Send cryptocurrency to your CryptPro wallet</p>
        </div>
      </div>
      
      {/* Success/error messages */}
      {successMessage && (
        <div className="p-4 bg-green-900/30 border border-green-800 rounded-lg">
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}
      
      {errorMessage && (
        <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg">
          <p className="text-red-400">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-dark-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Select Cryptocurrency</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            {supportedCryptos.map(crypto => (
              <div 
                key={crypto.symbol}
                className={`cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-colors ${
                  selectedCrypto === crypto.symbol 
                    ? 'border-primary-500 bg-primary-500/10' 
                    : 'border-dark-100 hover:border-primary-400/50'
                }`}
                onClick={() => handleCryptoChange(crypto.symbol)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {crypto.logo}
                </div>
                <div>
                  <div className="font-medium">{crypto.name}</div>
                  <div className="text-sm text-gray-400">{crypto.symbol}</div>
                </div>
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              <p className="mt-4 text-gray-400">Loading your deposit address...</p>
            </div>
          ) : !depositAddress ? (
            <div className="bg-dark-100 rounded-lg p-6 text-center">
              <p className="text-gray-300 mb-4">No deposit address has been assigned to your account yet.</p>
              <p className="text-gray-400 text-sm">Please contact an administrator to get your deposit address.</p>
            </div>
          ) : (
            <div className="bg-dark-100 rounded-lg p-6">
              <h3 className="font-medium mb-4">
                {selectedCrypto} Deposit Address ({supportedCryptos.find(c => c.symbol === selectedCrypto)?.networkInfo})
              </h3>
              
              <div className="flex flex-col items-center mb-6">
                {qrCodeUrl ? (
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <img src={qrCodeUrl} alt="QR Code" className="w-[180px] h-[180px]" />
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <div className="w-[180px] h-[180px] bg-gray-800 flex items-center justify-center text-white">
                      No QR Code Available
                    </div>
                  </div>
                )}
                <div className="text-sm text-gray-400 mb-2">Scan QR code or copy address</div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <div className="relative">
                    <input 
                      type="text"
                      readOnly
                      value={depositAddress}
                      className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {copySuccess && (
                      <div className="absolute -top-8 right-0 bg-green-900/80 text-green-400 px-3 py-1 rounded text-sm">
                        {copySuccess}
                      </div>
                    )}
                  </div>
                </div>
                <Button onClick={handleCopyAddress}>
                  Copy Address
                </Button>
              </div>
            </div>
          )}
          
          {depositAddress && (
            <form onSubmit={handleSubmitDeposit} className="mt-8 space-y-6 bg-dark-300 rounded-lg p-6 border border-dark-100">
              <h3 className="font-semibold text-lg">Submit Deposit Request</h3>
              <p className="text-gray-400 text-sm">
                After sending your {selectedCrypto} to the address above, please submit a deposit request for admin confirmation.
              </p>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                  Deposit Amount
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-grow">
                    <input
                      id="amount"
                      name="amount"
                      type="text"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full bg-dark-200 border border-dark-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder={`Min: ${supportedCryptos.find(c => c.symbol === selectedCrypto)?.minDeposit} ${selectedCrypto}`}
                      disabled={isSubmitting}
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <span className="text-gray-400">{selectedCrypto}</span>
                    </div>
                  </div>
                </div>
                {formErrors.amount && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.amount}</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative"
                >
                  {isSubmitting ? (
                    <>
                      <span className="opacity-0">Submit Deposit Request</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></div>
                      </div>
                    </>
                  ) : (
                    'Submit Deposit Request'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-dark-200 rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <button
                onClick={() => setShowTransactionHistory(!showTransactionHistory)}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                {showTransactionHistory ? 'Hide' : 'Show All'}
              </button>
            </div>
            
            <div className="space-y-6">
              {pendingTransactions.length === 0 && completedTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              ) : (
                <>
                  {pendingTransactions.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-300 mb-3 text-sm uppercase">Pending Deposits</h3>
                      <div className="space-y-3">
                        {pendingTransactions.slice(0, showTransactionHistory ? undefined : 3).map(tx => (
                          <div key={tx.id} className="bg-dark-100 p-3 rounded-lg border border-dark-50">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium">{tx.amount} {tx.cryptoType}</div>
                              <div className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs">
                                {tx.status}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {completedTransactions.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-300 mb-3 text-sm uppercase">Completed Deposits</h3>
                      <div className="space-y-3">
                        {completedTransactions.slice(0, showTransactionHistory ? undefined : 3).map(tx => (
                          <div key={tx.id} className="bg-dark-100 p-3 rounded-lg border border-dark-50">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium">{tx.amount} {tx.cryptoType}</div>
                              <div className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">
                                {tx.status}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 flex justify-between">
                              <span>{format(new Date(tx.createdAt), 'MMM d, yyyy')}</span>
                              {tx.txHash && (
                                <a
                                  href={`https://www.blockchain.com/explorer/transactions/btc/${tx.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-400 hover:text-primary-300"
                                >
                                  View Tx
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
