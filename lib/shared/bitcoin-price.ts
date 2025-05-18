/**
 * CRITICAL: This is the single source of truth for Bitcoin price across the entire application.
 * Any component that needs the BTC price MUST use this function to ensure consistency.
 */

// For server-side caching between requests
let cachedPrice: number | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 60 seconds in ms

// Direct call to CoinGecko API with proper caching to avoid rate limits
export async function getBitcoinPrice(): Promise<number> {
  // Use cached price if available and not expired
  const now = Date.now();
  if (cachedPrice && (now - lastFetchTime < CACHE_DURATION)) {
    console.log('[SHARED] Using cached Bitcoin price:', cachedPrice);
    return cachedPrice;
  }
  
  try {
    // Always use the full URL for both client and server compatibility
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
      // Cache for 60 seconds to avoid rate limits
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Bitcoin price: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const btcPrice = data.bitcoin?.usd;
    
    if (!btcPrice) {
      throw new Error('Invalid Bitcoin price data from CoinGecko API');
    }
    
    // Update cache
    cachedPrice = btcPrice;
    lastFetchTime = now;
    
    console.log('[SHARED] Fresh Bitcoin price from CoinGecko:', btcPrice);
    return btcPrice;
  } catch (error) {
    console.error('Error in shared Bitcoin price function:', error);
    throw error;
  }
}
