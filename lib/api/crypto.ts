import { z } from 'zod';

// Define type-safe schema for crypto API response using Zod
export const CryptoSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string(),
  current_price: z.number(),
  price_change_percentage_24h: z.number().nullable().default(0),
});

export const CryptoResponseSchema = z.array(CryptoSchema);

// Define TypeScript type from Zod schema
export type Crypto = z.infer<typeof CryptoSchema>;
export type CryptoResponse = z.infer<typeof CryptoResponseSchema>;

// Error handling class for API requests
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// API client for crypto data
export const cryptoApi = {
  /**
   * Fetch current cryptocurrency prices
   * @param coins Array of coin IDs to fetch (e.g., ['bitcoin', 'ethereum'])
   * @returns Promise with validated crypto data
   */
  async getPrices(coins: string[] = ['bitcoin']): Promise<CryptoResponse> {
    // Import the shared bitcoin price function
    const { getBitcoinPrice } = await import('@/lib/shared/bitcoin-price');

    if (coins.includes('bitcoin') && coins.length === 1) {
      // Directly use the shared bitcoin price function for BTC
      try {
        // Get pure Bitcoin price from shared source
        const price = await getBitcoinPrice();
        console.log('cryptoApi using SHARED Bitcoin price:', price);
        
        // Return in the expected format
        return [{
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
          current_price: price,
          price_change_percentage_24h: 0 // We don't have change data
        }];
      } catch (error) {
        console.error('Failed to get Bitcoin price from shared source:', error);
        throw new ApiError('Failed to get Bitcoin price', 500);
      }
    } else {
      // For other coins or multiple coins, use the CoinGecko API directly
      try {
        // Call CoinGecko API directly
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coins.join(',')}&order=market_cap_desc&per_page=100&page=1`
        );
        
        if (!response.ok) {
          throw new ApiError(`CoinGecko API error: ${response.statusText}`, response.status);
        }
        
        const data = await response.json();
        const validatedData = CryptoResponseSchema.parse(data);
        return validatedData;
      } catch (error) {
        console.error('Error fetching crypto prices from CoinGecko:', error);
        throw new ApiError('Failed to fetch cryptocurrency prices', 500);
      }
    }
  },
  
  /**
   * Format currency for display
   * @param value Number to format
   * @returns Formatted currency string
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  },
  
  /**
   * Format crypto amount with appropriate precision
   * @param value Amount to format
   * @param symbol Crypto symbol (e.g., 'BTC')
   * @returns Formatted amount string
   */
  formatCryptoAmount(value: number, symbol: string): string {
    // Use 8 decimal places for BTC, 2 for others
    const precision = symbol === 'BTC' ? 8 : 2;
    return value.toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });
  },
};

export default cryptoApi;
