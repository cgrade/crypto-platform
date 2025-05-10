"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import PriceChart from '@/components/ui/Chart';
import cryptoApi, { ApiError } from '@/lib/api/crypto';

// Function to generate mock historical data based on current price
function generateMockHistoricalData(currentPrice: number, days: number) {
  // Generate realistic price fluctuations around the current price
  const prices: number[] = [];
  const labels: string[] = [];
  const volatility = 0.02; // 2% daily volatility
  
  let price = currentPrice * (1 - (Math.random() * volatility * days)); // Start a bit lower
  
  for (let i = days; i >= 0; i--) {
    // Random walk with slight upward bias
    const changePercent = (Math.random() - 0.45) * volatility;
    price = price * (1 + changePercent);
    prices.push(price);
    
    // Create date labels
    const date = new Date();
    date.setDate(date.getDate() - i);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    labels.push(`${month} ${day}`);
  }
  
  return { prices, labels };
}

export default function BitcoinChart() {
  const [historyPeriod, setHistoryPeriod] = useState<7 | 14 | 30>(7);
  const [priceData, setPriceData] = useState<{ prices: number[], labels: string[] }>({
    prices: [],
    labels: []
  });
  
  // Function to fetch real-time Bitcoin price
  const fetcher = async (url: string) => {
    try {
      return await cryptoApi.getPrices(['bitcoin']);
    } catch (error) {
      console.error("Failed to fetch Bitcoin price:", error);
      throw error;
    }
  };
  
  // Use SWR for real-time price updates
  const { data: cryptoData, error: cryptoError } = useSWR(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin",
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );
  
  // Generate historical data when we have the current price
  useEffect(() => {
    if (cryptoData && cryptoData.length > 0) {
      const currentPrice = cryptoData[0].current_price;
      const historicalData = generateMockHistoricalData(currentPrice, historyPeriod);
      setPriceData(historicalData);
    }
  }, [cryptoData, historyPeriod]);
  
  // Determine if the overall trend is positive
  const isPositiveTrend = priceData.prices.length > 1 && 
    priceData.prices[priceData.prices.length - 1] > priceData.prices[0];
  
  if (cryptoError) {
    return (
      <div className="bg-dark-200 p-4 rounded-xl text-center">
        <p className="text-red-400">Failed to load Bitcoin price data</p>
      </div>
    );
  }
  
  return (
    <div className="bg-dark-200 p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Bitcoin Price Chart</h2>
        <div className="flex rounded-lg overflow-hidden bg-dark-300">
          <button 
            onClick={() => setHistoryPeriod(7)}
            className={`px-3 py-1 text-sm ${historyPeriod === 7 ? 'bg-primary-600 text-white' : 'text-gray-400'}`}
          >
            7D
          </button>
          <button 
            onClick={() => setHistoryPeriod(14)}
            className={`px-3 py-1 text-sm ${historyPeriod === 14 ? 'bg-primary-600 text-white' : 'text-gray-400'}`}
          >
            14D
          </button>
          <button 
            onClick={() => setHistoryPeriod(30)}
            className={`px-3 py-1 text-sm ${historyPeriod === 30 ? 'bg-primary-600 text-white' : 'text-gray-400'}`}
          >
            30D
          </button>
        </div>
      </div>
      
      {!cryptoData ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <span className="text-2xl font-bold">${cryptoData[0].current_price.toLocaleString()}</span>
            <span className={`ml-2 text-sm ${(cryptoData[0].price_change_percentage_24h || 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(cryptoData[0].price_change_percentage_24h || 0) > 0 ? '+' : ''}
              {(cryptoData[0].price_change_percentage_24h || 0).toFixed(2)}% (24h)
            </span>
          </div>
          
          <PriceChart 
            data={priceData.prices} 
            labels={priceData.labels} 
            isPositive={isPositiveTrend}
          />
        </>
      )}
    </div>
  );
}
