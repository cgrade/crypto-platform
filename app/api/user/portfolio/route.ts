import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Function to fetch current BTC price
async function getBitcoinPrice() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    if (!response.ok) {
      console.error('Failed to fetch Bitcoin price:', response.statusText);
      return 50000; // Fallback price
    }
    
    const data = await response.json();
    return data.bitcoin.usd;
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    return 50000; // Fallback price
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
    
    // Fetch current Bitcoin price
    const btcPrice = await getBitcoinPrice();
    console.log('Current BTC price from API:', btcPrice);
    
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
  } catch (error) {
    console.error('User portfolio fetch error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
