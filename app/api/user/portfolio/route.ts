import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import cryptoApi from '@/lib/api/crypto';

// Use the shared cryptoApi to ensure price consistency across the application
async function getBitcoinPrice() {
  try {
    // Use the same API call as the dashboard to ensure consistent pricing
    const cryptoPrices = await cryptoApi.getPrices(['bitcoin']);
    if (!cryptoPrices || cryptoPrices.length === 0) {
      throw new Error('No price data available');
    }
    
    const btcPrice = cryptoPrices[0].current_price;
    console.log('User portfolio API using shared BTC price:', btcPrice);
    return btcPrice;
  } catch (error) {
    console.error('Error fetching Bitcoin price from shared API:', error);
    throw error; // No fallbacks - propagate the error
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Fetch current Bitcoin price using the shared API client
    // This will throw an error if CoinGecko API is unavailable - no fallbacks
    const btcPrice = await getBitcoinPrice();
    console.log('Current BTC price from CoinGecko API:', btcPrice);
    
    // Get user portfolio with crypto assets
    let portfolio = await prisma.portfolio.findFirst({
      where: {
        userId: session.user.id
      },
      include: {
        assets: true
      }
    });
    
    // If user doesn't have a portfolio yet, create one with default BTC asset
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: session.user.id,
          totalValue: 0,
          assets: {
            create: [
              {
                symbol: 'BTC',
                name: 'Bitcoin',
                amount: 0,
                frozen: 0,
                lastPrice: btcPrice, // Dynamic price from API
              }
            ]
          }
        },
        include: {
          assets: true
        }
      });
    } else {
      // Instead of updating the database, we'll just attach the current price to the response
      // This avoids issues with the Prisma schema and lastPrice field
      
      // Add the current Bitcoin price to the response
      const portfolioWithPrices = {
        ...portfolio,
        btcPrice: btcPrice, // Add current BTC price as a separate field in the response
        assets: portfolio.assets.map(asset => {
          if (asset.symbol === 'BTC') {
            // For BTC assets, attach the current price (but don't try to update the database)
            return {
              ...asset,
              currentPrice: btcPrice
            };
          }
          return asset;
        })
      };
      
      // Calculate total value based on current prices
      const totalValue = portfolio.assets.reduce((sum, asset) => {
        const price = asset.symbol === 'BTC' ? btcPrice : 0;
        return sum + (asset.amount * price);
      }, 0);
      
      // Just update the in-memory object without trying to write the lastPrice field
      portfolioWithPrices.totalValue = totalValue;
      
      // Replace the portfolio reference with our enhanced version
      portfolio = portfolioWithPrices;
    }
    
    return NextResponse.json({
      success: true,
      portfolio
    });
  } catch (error: unknown) {
    console.error('User portfolio fetch error:', error);
    
    // Be explicit about CoinGecko API dependency in error message
    const errorMessage = error instanceof Error && error.message.includes('price') ? 
      'Failed to fetch current Bitcoin price from CoinGecko API' : 
      'Failed to fetch portfolio';
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        source: 'CoinGecko API',
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
