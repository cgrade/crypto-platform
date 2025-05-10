"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export default function DepositPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [depositAddresses, setDepositAddresses] = useState({
    BTC: 'bc1q3v5cu3zgev8mcptgj79nnzr9vj2qzcd0g5lph9'
  });
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [copySuccess, setCopySuccess] = useState('');
  
  const supportedCryptos = [
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      logo: '₿',
      networkInfo: 'Bitcoin Network (BTC)'
    }
  ];

  useEffect(() => {
    // Here you would normally fetch user deposit addresses from your API
    // For demo purposes we use the hardcoded addresses
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(depositAddresses[selectedCrypto as keyof typeof depositAddresses])
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Deposit Crypto</h1>
          <p className="text-gray-400">Send cryptocurrency to your CryptoPro wallet</p>
        </div>
      </div>

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
          ) : (
            <div className="bg-dark-100 rounded-lg p-6">
              <h3 className="font-medium mb-4">
                {selectedCrypto} Deposit Address ({supportedCryptos.find(c => c.symbol === selectedCrypto)?.networkInfo})
              </h3>
              
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white p-4 rounded-lg mb-4">
                  {/* QR Code would go here - replaced with a placeholder */}
                  <div className="w-[180px] h-[180px] bg-gray-800 flex items-center justify-center text-white">
                    QR Code for {selectedCrypto}
                  </div>
                </div>
                <div className="text-sm text-gray-400 mb-2">Scan QR code or copy address</div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <div className="relative">
                    <input 
                      type="text"
                      readOnly
                      value={depositAddresses[selectedCrypto as keyof typeof depositAddresses]}
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
          
          <div className="mt-8 p-4 bg-dark-100 border border-amber-800/50 rounded-lg">
            <h4 className="font-medium text-amber-400 mb-2">Important Instructions</h4>
            <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
              <li>Only send {selectedCrypto} to this address.</li>
              <li>Confirm you're on the correct network ({supportedCryptos.find(c => c.symbol === selectedCrypto)?.networkInfo}).</li>
              <li>Your deposit will be credited after {selectedCrypto === 'BTC' ? '3 confirmations' : '15 confirmations'}.</li>
              <li>Minimum deposit: {selectedCrypto === 'BTC' ? '0.0001 BTC' : '10 USDT'}.</li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-dark-200 rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Deposit FAQ</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">How long do deposits take?</h3>
                <p className="text-sm text-gray-400">Bitcoin deposits typically take 30-60 minutes. USDT deposits usually take 5-10 minutes.</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Are there any fees?</h3>
                <p className="text-sm text-gray-400">We don't charge deposit fees, but you'll pay network transaction fees.</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Is there a minimum deposit?</h3>
                <p className="text-sm text-gray-400">Yes, the minimum deposit is 0.0001 BTC or 10 USDT.</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">What if my deposit doesn't arrive?</h3>
                <p className="text-sm text-gray-400">Contact our support team with your transaction details and we'll help track it.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
