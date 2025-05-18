import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import cryptoApi from "@/lib/api/crypto";

// GET: Fetch the current user's portfolio
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user's portfolio with assets
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        assets: true,
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }
    
    // Fetch latest Bitcoin price from CoinGecko API
    try {
      const cryptoPrices = await cryptoApi.getPrices(['bitcoin']);
      
      // Add current Bitcoin price from CoinGecko to the portfolio response
      const portfolioWithPrice = {
        ...portfolio,
        btcPrice: cryptoPrices[0]?.current_price || null,
        priceSource: 'CoinGecko API'
      };
      
      console.log('Portfolio API using BTC price from CoinGecko:', cryptoPrices[0]?.current_price);
      
      return NextResponse.json({ portfolio: portfolioWithPrice });
    } catch (priceError) {
      console.error('Error fetching Bitcoin price:', priceError);
      // Still return the portfolio even if price fetch fails
      return NextResponse.json({ portfolio });
    }
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a deposit transaction
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { amount, cryptoType, cryptoAddress } = await req.json();

    // Validate input
    if (!amount || !cryptoType || !cryptoAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a new deposit transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type: "DEPOSIT",
        status: "PENDING",
        cryptoType,
        cryptoAddress,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Deposit request created", transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating deposit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
