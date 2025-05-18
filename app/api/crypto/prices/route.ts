import { NextRequest, NextResponse } from 'next/server';
import { CryptoResponseSchema } from '@/lib/api/crypto';

// Add cache control headers to manage CoinGecko rate limits
export const revalidate = 60; // Revalidate data every minute

/**
 * Server-side proxy for CoinGecko API requests to solve CORS issues and manage rate limiting
 */
export async function GET(request: NextRequest) {
  try {
    // Get coins from query params or default to bitcoin
    const searchParams = request.nextUrl.searchParams;
    const coins = searchParams.get('coins') || 'bitcoin';
    
    console.log(`Fetching prices for: ${coins}`);
    
    // Add a random delay between 100-500ms to avoid immediate sequential requests
    // This helps prevent rate limiting when multiple components request data simultaneously
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));
    
    // Make the API request with our server as the origin
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coins}&order=market_cap_desc&per_page=100&page=1`,
      { 
        // Cache results longer to avoid rate limiting
        next: { revalidate: 120 }
      }
    );
    
    // Always return CoinGecko's response directly - no fallbacks
    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `CoinGecko API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Validate the data before returning it
    try {
      // Parse and validate the data
      const validatedData = CryptoResponseSchema.parse(data);
      
      // Log the BTC price for debugging
      if (coins.includes('bitcoin')) {
        console.log('API route direct BTC price from CoinGecko:', validatedData.find(c => c.id === 'bitcoin')?.current_price);
      }
      
      // Return the validated data
      return NextResponse.json(validatedData, {
        headers: {
          'Cache-Control': 'max-age=60, stale-while-revalidate=300',
        }
      });
    } catch (error) {
      console.error('Data validation error:', error);
      return NextResponse.json(
        { error: 'Invalid data format from CoinGecko API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Crypto prices proxy error:', error);
    // Never return fallback data - just return a clear error message
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency prices' },
      { status: 500 }
    );
  }
}

