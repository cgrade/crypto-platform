"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export default function WithdrawPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    cryptoType: 'BTC',
    withdrawalAddress: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Simulate fetching the user's balances from the API
  const [balances, setBalances] = useState({
    BTC: { available: 0.05, frozen: 0.01 }
  });
  
  const supportedCryptos = [
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      logo: '₿',
      networkInfo: 'Bitcoin Network (BTC)',
      minWithdrawal: 0.0002,
      fee: 0.0001,
      precision: 8
    }
  ];

  useEffect(() => {
    // In a real app, you'd fetch user balances here
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear previous error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCryptoChange = (crypto: string) => {
    setFormData(prev => ({
      ...prev,
      cryptoType: crypto,
      amount: ''
    }));
  };
  
  const handleMaxAmount = () => {
    const availableBalance = balances[formData.cryptoType as keyof typeof balances]?.available || 0;
    const fee = supportedCryptos.find(c => c.symbol === formData.cryptoType)?.fee || 0;
    const maxAmount = Math.max(0, availableBalance - fee).toString();
    
    setFormData(prev => ({
      ...prev,
      amount: maxAmount
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    const selectedCrypto = formData.cryptoType;
    const crypto = supportedCryptos.find(c => c.symbol === selectedCrypto);
    
    if (!crypto) {
      errors.cryptoType = 'Invalid cryptocurrency selected';
    }
    
    if (!formData.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid positive number';
    } else {
      const minAmount = supportedCryptos.find(c => c.symbol === formData.cryptoType)?.minWithdrawal || 0;
      if (Number(formData.amount) < minAmount) {
        errors.amount = `Minimum withdrawal amount is ${minAmount} ${formData.cryptoType}`;
      }
      
      const availableBalance = balances[formData.cryptoType as keyof typeof balances]?.available || 0;
      if (Number(formData.amount) > availableBalance) {
        errors.amount = `Insufficient ${formData.cryptoType} balance`;
      }
    }
    
    if (!formData.withdrawalAddress) {
      errors.withdrawalAddress = 'Withdrawal address is required';
    } else if (formData.cryptoType === 'BTC' && !formData.withdrawalAddress.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/)) {
      errors.withdrawalAddress = 'Invalid Bitcoin address format';
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      try {
        // In a real app, you would call your API here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network request
        
        // Simulate successful withdrawal request
        setSuccessMessage(`Your withdrawal request for ${formData.amount} ${formData.cryptoType} has been submitted for processing. Please allow 30-60 minutes for the transaction to be confirmed on the blockchain.`);
        
        // Reset form
        setFormData({
          amount: '',
          cryptoType: 'BTC',
          withdrawalAddress: ''
        });
        
        // Update simulated balances
        const amount = parseFloat(formData.amount);
        const crypto = formData.cryptoType as keyof typeof balances;
        setBalances(prev => ({
          ...prev,
          [crypto]: {
            ...prev[crypto],
            available: prev[crypto].available - amount
          }
        }));
        
      } catch (error) {
        setErrorMessage('An error occurred while processing your withdrawal. Please try again.');
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Withdraw Crypto</h1>
          <p className="text-gray-400">Withdraw cryptocurrency to an external wallet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-dark-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Select Cryptocurrency</h2>
          
          {/* Success message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg">
              <p className="text-green-400">{successMessage}</p>
            </div>
          )}
          
          {/* Error message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg">
              <p className="text-red-400">{errorMessage}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            {supportedCryptos.map(crypto => (
              <div 
                key={crypto.symbol}
                className={`cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-colors ${
                  formData.cryptoType === crypto.symbol 
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
              <p className="mt-4 text-gray-400">Loading your balances...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-dark-100 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Available Balance:</span>
                  <span className="font-medium">
                    {balances[formData.cryptoType as keyof typeof balances].available} {formData.cryptoType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processing/Locked:</span>
                  <span className="text-yellow-500">
                    {balances[formData.cryptoType as keyof typeof balances].frozen} {formData.cryptoType}
                  </span>
                </div>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                  Amount to Withdraw
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-grow">
                    <input
                      id="amount"
                      name="amount"
                      type="text"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder={`Min: ${supportedCryptos.find(c => c.symbol === formData.cryptoType)?.minWithdrawal} ${formData.cryptoType}`}
                      disabled={isSubmitting}
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <span className="text-gray-400">{formData.cryptoType}</span>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleMaxAmount}
                    disabled={isSubmitting}
                  >
                    MAX
                  </Button>
                </div>
                {formErrors.amount && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.amount}</p>
                )}
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-gray-400">
                    Fee: {supportedCryptos.find(c => c.symbol === formData.cryptoType)?.fee} {formData.cryptoType}
                  </span>
                  <span className="text-gray-400">
                    You will receive: {
                      formData.amount 
                        ? (parseFloat(formData.amount) - (supportedCryptos.find(c => c.symbol === formData.cryptoType)?.fee || 0)).toFixed(
                            supportedCryptos.find(c => c.symbol === formData.cryptoType)?.precision || 8
                          )
                        : '0'
                    } {formData.cryptoType}
                  </span>
                </div>
              </div>
              
              <div>
                <label htmlFor="withdrawalAddress" className="block text-sm font-medium text-gray-300 mb-1">
                  Withdrawal Address ({supportedCryptos.find(c => c.symbol === formData.cryptoType)?.networkInfo})
                </label>
                <input
                  id="withdrawalAddress"
                  name="withdrawalAddress"
                  type="text"
                  value={formData.withdrawalAddress}
                  onChange={handleChange}
                  className="w-full bg-dark-300 border border-dark-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder={`Enter your ${formData.cryptoType} address`}
                  disabled={isSubmitting}
                />
                {formErrors.withdrawalAddress && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.withdrawalAddress}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Double-check your address before submitting. We cannot recover funds sent to incorrect addresses.
                </p>
              </div>
              
              <div className="p-4 bg-dark-100 border border-amber-800/50 rounded-lg">
                <h4 className="font-medium text-amber-400 mb-2">Withdrawal Security Notice</h4>
                <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                  <li>All withdrawal requests are manually reviewed for security purposes.</li>
                  <li>Withdrawals are usually processed within 30-60 minutes during business hours.</li>
                  <li>Always double-check your withdrawal address before confirming.</li>
                  <li>We highly recommend using whitelisted addresses.</li>
                </ul>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="min-w-[160px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Withdraw'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="bg-dark-200 rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Withdrawal Info</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Processing Time</h3>
                <p className="text-sm text-gray-400">Withdrawals are processed within 30-60 minutes during business hours. During peak times or weekends, it may take longer.</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Network Fees</h3>
                <p className="text-sm text-gray-400">
                  BTC withdrawal fee: 0.0001 BTC (fixed)
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Minimum Withdrawal</h3>
                <p className="text-sm text-gray-400">
                  Minimum BTC withdrawal: 0.0002 BTC
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Network</h3>
                <p className="text-sm text-gray-400">
                  Bitcoin Network (BTC)
                </p>
              </div>
              
              <div className="pt-4 border-t border-dark-100">
                <h3 className="font-medium mb-1 text-amber-400">Security Tip</h3>
                <p className="text-sm text-gray-400">Enable 2FA on your account for additional security when making withdrawals.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
