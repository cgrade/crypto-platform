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
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coins.join(',')}&order=market_cap_desc&per_page=${coins.length}&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch crypto prices: ${response.statusText}`, response.status);
      }
      
      const data = await response.json();
      
      // Validate response against schema
      const validatedData = CryptoResponseSchema.parse(data);
      return validatedData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new ApiError(`Invalid data format: ${error.message}`, 422);
      }
      throw new ApiError('Failed to fetch crypto prices', 500);
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
  }
};

export default cryptoApi;
