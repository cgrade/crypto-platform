"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import cryptoApi, { Crypto, ApiError } from '@/lib/api/crypto';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import BitcoinChart from '@/components/dashboard/BitcoinChart';

// Using the Crypto type from our API client

export default function PortfolioPage() {
  // Authenticate with NextAuth
  const { data: session } = useSession();
  
  // Track client-side rendering to prevent hydration errors
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  const router = useRouter();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [depositForm, setDepositForm] = useState({
    amount: '',
    cryptoType: 'BTC',
    cryptoAddress: ''
  });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    cryptoType: 'BTC',
    cryptoAddress: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState<{ success?: boolean; message?: string }>({});
  const [cryptoPrices, setCryptoPrices] = useState<{
    BTC: number;
  }>({ BTC: 0 });
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  
  // User portfolio data
  const [userPortfolio, setUserPortfolio] = useState({
    id: '',
    totalValue: 0,
    assets: []
  });
  
  // Formatted portfolio data for display
  const [portfolioDisplay, setPortfolioDisplay] = useState([
    { id: 1, asset: 'BTC', balance: 0, price: 0, value: 0, change24h: 0 }
  ]);
  
  // Fetch user portfolio data from backend
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('/api/user/portfolio');
        if (response.ok) {
          const data = await response.json();
          console.log('Portfolio data from API:', data);
          
          if (data.success && data.portfolio) {
            setUserPortfolio(data.portfolio);
          }
        } else {
          console.error('Failed to fetch portfolio data');
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      }
    };
    
    // Only fetch if the session exists (user is authenticated)
    if (session) {
      fetchPortfolio();
    }
  }, [session]);
  
  // Define the SWR fetcher function using our type-safe API client
  const fetcher = async (url: string) => {
    try {
      // Extract the coin IDs from the URL
      const urlObj = new URL(url);
      const coinsParam = urlObj.searchParams.get('ids') || 'bitcoin';
      const coins = coinsParam.split(',');
      
      // Use our type-safe API client
      return await cryptoApi.getPrices(coins);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`API Error (${error.status}): ${error.message}`);
      }
      throw error;
    }
  };
  
  // Use SWR for real-time crypto prices
  const { data: cryptoData, error: cryptoError } = useSWR(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h",
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      errorRetryCount: 3,
      onSuccess: () => {}
    }
  );
  
  useEffect(() => {
    if (userPortfolio.assets?.length > 0) {
      // Get the BTC price - prefer the API price, fall back to the price from our backend API
      const btcPriceFromApi = cryptoData ? cryptoData[0]?.current_price : 0;
      const btcPriceFromBackend = (userPortfolio as any).btcPrice || 0;
      const btcPrice = btcPriceFromApi || btcPriceFromBackend;
      
      // Update crypto prices state for other components to use
      setCryptoPrices({
        BTC: btcPrice
      });
      
      // Format portfolio data for display
      const displayData = userPortfolio.assets.map(asset => {
        // Get price from various sources in order of preference
        let currentPrice = 0;
        if (asset.symbol === 'BTC') {
          // 1. Use price from CoinGecko API if available
          if (btcPriceFromApi) {
            currentPrice = btcPriceFromApi;
          }
          // 2. Use currentPrice from our backend API if available  
          else if ((asset as any).currentPrice) {
            currentPrice = (asset as any).currentPrice;
          }
          // 3. Use the price from our backend
          else if (btcPriceFromBackend) {
            currentPrice = btcPriceFromBackend;
          }
        }
        
        // Calculate asset value based on amount and price
        const assetValue = asset.amount * currentPrice;
        
        return {
          id: asset.id,
          asset: asset.symbol,
          balance: asset.amount,
          price: currentPrice,
          value: assetValue,
          change24h: asset.symbol === 'BTC' && cryptoData ? (cryptoData[0]?.price_change_percentage_24h || 0) : 0
        };
      });
      
      // Update the portfolio display state
      setPortfolioDisplay(displayData);
      setIsLoadingPrices(false);
      
      console.log('Updated portfolio display:', displayData);
    } else if (cryptoError) {
      console.error('Error fetching crypto prices:', cryptoError);
      setIsLoadingPrices(false);
    } else if (!userPortfolio.assets?.length && !cryptoError) {
      setIsLoadingPrices(true);
    }
  }, [cryptoData, cryptoError, userPortfolio]);
  
  // This useEffect was duplicating functionality - removed
  
  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDepositForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleWithdrawChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWithdrawForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateDepositForm = () => {
    const errors: Record<string, string> = {};
    
    if (!depositForm.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(Number(depositForm.amount)) || Number(depositForm.amount) <= 0) {
      errors.amount = 'Please enter a valid positive number';
    }
    
    if (!depositForm.cryptoAddress) {
      errors.cryptoAddress = 'Crypto address is required';
    } else {
      // Basic validation for crypto addresses
      if (depositForm.cryptoType === 'BTC' && !depositForm.cryptoAddress.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/)) {
        errors.cryptoAddress = 'Invalid Bitcoin address format';
      }
    }
    
    return errors;
  };
  
  const validateWithdrawForm = () => {
    const errors: Record<string, string> = {};
    
    if (!withdrawForm.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(Number(withdrawForm.amount)) || Number(withdrawForm.amount) <= 0) {
      errors.amount = 'Please enter a valid positive number';
    } else {
      // Check if user has enough balance
      const asset = portfolioDisplay.find(item => item.asset === withdrawForm.cryptoType);
      if (asset && Number(withdrawForm.amount) > asset.balance) {
        errors.amount = `Insufficient ${withdrawForm.cryptoType} balance`;
      }
    }
    
    if (!withdrawForm.cryptoAddress) {
      errors.cryptoAddress = 'Crypto address is required';
    } else {
      // Basic validation for crypto addresses
      if (withdrawForm.cryptoType === 'BTC' && !withdrawForm.cryptoAddress.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/)) {
        errors.cryptoAddress = 'Invalid Bitcoin address format';
      }
    }
    
    return errors;
  };
  
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateDepositForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      setApiResponse({});
      
      try {
        // In a real app, you would call your API here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network request
        
        // Show success message
        setApiResponse({
          success: true,
          message: `Successfully generated deposit address for ${depositForm.amount} ${depositForm.cryptoType}`
        });
        
        // Reset form
        setDepositForm({
          amount: '',
          cryptoType: 'BTC',
          cryptoAddress: ''
        });
      } catch (error) {
        console.error('Error submitting deposit form:', error);
        setApiResponse({
          success: false,
          message: 'Failed to process deposit. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateWithdrawForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      setApiResponse({});
      
      try {
        // In a real app, you would call your API here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network request
        
        // Show success message
        setApiResponse({
          success: true,
          message: `Withdrawal request for ${withdrawForm.amount} ${withdrawForm.cryptoType} to ${withdrawForm.cryptoAddress} has been submitted.`
        });
        
        // Reset form
        setWithdrawForm({
          amount: '',
          cryptoType: 'BTC',
          cryptoAddress: ''
        });
        
        // Update simulated portfolio balances
        setPortfolioDisplay(prev => prev.map(asset => {
          if (asset.asset === withdrawForm.cryptoType) {
            const newBalance = asset.balance - Number(withdrawForm.amount);
            return {
              ...asset,
              balance: newBalance,
              value: newBalance * asset.price
            };
          }
          return asset;
        }));
      } catch (error) {
        console.error('Error submitting withdrawal form:', error);
        setApiResponse({
          success: false,
          message: 'Failed to process withdrawal. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Calculate total portfolio value
  const totalPortfolioValue = portfolioDisplay.reduce((sum, asset) => sum + asset.value, 0);
  
  // Return simplified UI during pre-hydration to prevent errors
  if (!isClient) {
    return (
      <div className="space-y-8 min-h-screen bg-dark-300">
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-8 bg-dark-200 rounded w-1/3"></div>
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
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-gray-400">Manage your crypto assets</p>
        </div>
        <div className="flex space-x-4">
          <Button onClick={() => {
            setIsDepositModalOpen(true);
            setApiResponse({});
            setFormErrors({});
          }}>
            Deposit
          </Button>
          <Button variant="outline" onClick={() => {
            setIsWithdrawModalOpen(true);
            setApiResponse({});
            setFormErrors({});
          }}>
            Withdraw
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <BitcoinChart />
        </div>
        
        <div className="md:col-span-4 grid grid-cols-1 gap-6">
          <div className="bg-dark-200 p-6 rounded-xl">
            <div className="text-sm text-gray-400 mb-1">Total Portfolio Value</div>
            <div className="text-2xl font-bold">
              {isLoadingPrices ? (
                <div className="animate-pulse h-8 w-32 bg-dark-100 rounded"></div>
              ) : (
                `$${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </div>
          </div>
          
          <div className="bg-dark-200 p-6 rounded-xl">
            <div className="text-sm text-gray-400 mb-1">Assets</div>
            <div className="text-2xl font-bold">{portfolioDisplay.length}</div>
            <div className="mt-2 text-sm text-gray-400">
              {isLoadingPrices ? (
                <div className="animate-pulse h-4 w-24 bg-dark-100 rounded"></div>
              ) : (
                <span className={cryptoData && (cryptoData[0].price_change_percentage_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {cryptoData && cryptoData[0].price_change_percentage_24h
                    ? `${cryptoData[0].price_change_percentage_24h > 0 ? '+' : ''}${cryptoData[0].price_change_percentage_24h.toFixed(2)}% today` 
                    : '0.00% today'
                  }
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setIsDepositModalOpen(true);
                setApiResponse({});
                setFormErrors({});
              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Deposit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsWithdrawModalOpen(true);
                setApiResponse({});
                setFormErrors({});
              }}
              className="flex-1 border-red-600 text-red-500 hover:bg-red-900/20"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-dark-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-dark-100">
          <h2 className="text-lg font-semibold">Your Assets</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-dark-100">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Asset</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Balance</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Price</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Value</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">24h Change</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {isLoadingPrices ? (
                Array(2).fill(0).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="animate-pulse h-6 w-20 bg-dark-100 rounded"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="animate-pulse h-6 w-16 bg-dark-100 rounded ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="animate-pulse h-6 w-20 bg-dark-100 rounded ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="animate-pulse h-6 w-24 bg-dark-100 rounded ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="animate-pulse h-6 w-16 bg-dark-100 rounded ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="animate-pulse h-8 w-28 bg-dark-100 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : (
                portfolioDisplay.map(asset => (
                  <tr key={asset.id} className="hover:bg-dark-100/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                          ₿
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">Bitcoin</div>
                          <div className="text-sm text-gray-400">{asset.asset}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {asset.balance.toLocaleString(undefined, { minimumFractionDigits: asset.asset === 'BTC' ? 8 : 2, maximumFractionDigits: asset.asset === 'BTC' ? 8 : 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      ${cryptoApi.formatCurrency(asset.price)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ${cryptoApi.formatCurrency(asset.value)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="px-2 py-1 text-xs font-medium text-green-500 hover:text-green-400 border border-green-500 hover:border-green-400 rounded">
                          Buy
                        </button>
                        <button className="px-2 py-1 text-xs font-medium text-red-500 hover:text-red-400 border border-red-500 hover:border-red-400 rounded">
                          Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        title="Deposit Funds"
        onClose={() => setIsDepositModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsDepositModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleDepositSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Deposit'}
            </Button>
          </div>
        }
      >
        {apiResponse.message ? (
          <div className={`p-4 rounded-lg mb-4 ${apiResponse.success ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
            {apiResponse.message}
          </div>
        ) : (
          <form className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="text"
                className={`input w-full ${formErrors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
                value={depositForm.amount}
                onChange={handleDepositChange}
                disabled={isSubmitting}
              />
              {formErrors.amount && <p className="mt-1 text-xs text-red-500">{formErrors.amount}</p>}
            </div>
            
            <div>
              <label htmlFor="cryptoType" className="block text-sm font-medium text-gray-300 mb-1">
                Select Cryptocurrency
              </label>
              <select
                id="cryptoType"
                name="cryptoType"
                className={`input w-full ${formErrors.cryptoType ? 'border-red-500' : ''}`}
                value={depositForm.cryptoType}
                onChange={handleDepositChange}
                disabled={isSubmitting}
              >
                <option value="BTC">Bitcoin (BTC) - ${cryptoPrices.BTC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</option>
              </select>
              {formErrors.cryptoType && <p className="mt-1 text-xs text-red-500">{formErrors.cryptoType}</p>}
            </div>
            
            <div>
              <label htmlFor="cryptoAddress" className="block text-sm font-medium text-gray-300 mb-1">
                Your {depositForm.cryptoType} Address
              </label>
              <input
                id="cryptoAddress"
                name="cryptoAddress"
                type="text"
                className={`input w-full ${formErrors.cryptoAddress ? 'border-red-500' : ''}`}
                placeholder={`Enter your ${depositForm.cryptoType} address`}
                value={depositForm.cryptoAddress}
                onChange={handleDepositChange}
                disabled={isSubmitting}
              />
              {formErrors.cryptoAddress && <p className="mt-1 text-xs text-red-500">{formErrors.cryptoAddress}</p>}
              <p className="mt-1 text-xs text-gray-400">
                Please ensure you have entered the correct address. We cannot recover funds sent to incorrect addresses.
              </p>
            </div>
          </form>
        )}
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        title="Withdraw Funds"
        onClose={() => setIsWithdrawModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsWithdrawModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleWithdrawSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Withdraw'}
            </Button>
          </div>
        }
      >
        {apiResponse.message ? (
          <div className={`p-4 rounded-lg mb-4 ${apiResponse.success ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
            {apiResponse.message}
          </div>
        ) : (
          <form className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="text"
                className={`input w-full ${formErrors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
                value={withdrawForm.amount}
                onChange={handleWithdrawChange}
                disabled={isSubmitting}
              />
              {formErrors.amount && <p className="mt-1 text-xs text-red-500">{formErrors.amount}</p>}
            </div>
            
            <div>
              <label htmlFor="cryptoType" className="block text-sm font-medium text-gray-300 mb-1">
                Select Cryptocurrency
              </label>
              <select
                id="cryptoType"
                name="cryptoType"
                className={`input w-full ${formErrors.cryptoType ? 'border-red-500' : ''}`}
                value={withdrawForm.cryptoType}
                onChange={handleWithdrawChange}
                disabled={isSubmitting}
              >
                <option value="BTC">Bitcoin (BTC) - ${cryptoPrices.BTC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</option>
              </select>
              {formErrors.cryptoType && <p className="mt-1 text-xs text-red-500">{formErrors.cryptoType}</p>}
            </div>
            
            <div>
              <label htmlFor="cryptoAddress" className="block text-sm font-medium text-gray-300 mb-1">
                Destination {withdrawForm.cryptoType} Address
              </label>
              <input
                id="cryptoAddress"
                name="cryptoAddress"
                type="text"
                className={`input w-full ${formErrors.cryptoAddress ? 'border-red-500' : ''}`}
                placeholder={`Enter destination ${withdrawForm.cryptoType} address`}
                value={withdrawForm.cryptoAddress}
                onChange={handleWithdrawChange}
                disabled={isSubmitting}
              />
              {formErrors.cryptoAddress && <p className="mt-1 text-xs text-red-500">{formErrors.cryptoAddress}</p>}
              <p className="mt-1 text-xs text-gray-400">
                Please double-check the address. We cannot recover funds sent to incorrect addresses.
              </p>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
