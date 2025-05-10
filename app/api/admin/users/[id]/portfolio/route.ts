import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

// GET: Fetch a specific user's portfolio (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authorization
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Get the specified user's portfolio with assets
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        userId,
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

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error("Error fetching user portfolio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update a user's asset balance (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authorization
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const userId = params.id;
    const { assetId, amount } = await req.json();

    // Validate input
    if (!assetId || amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the asset
    const asset = await prisma.cryptoAsset.findUnique({
      where: {
        id: assetId,
      },
      include: {
        portfolio: true,
      },
    });

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }

    // Verify the asset belongs to the specified user's portfolio
    if (asset.portfolio.userId !== userId) {
      return NextResponse.json(
        { error: "Asset does not belong to the specified user" },
        { status: 403 }
      );
    }

    // Update the asset balance
    const updatedAmount = parseFloat(amount);
    const priceDifference = (updatedAmount - asset.amount) * asset.value / asset.amount;
    
    const updatedAsset = await prisma.cryptoAsset.update({
      where: {
        id: assetId,
      },
      data: {
        amount: updatedAmount,
        value: (asset.value / asset.amount) * updatedAmount,
      },
    });

    // Update portfolio total value
    await prisma.portfolio.update({
      where: {
        id: asset.portfolioId,
      },
      data: {
        totalValue: {
          increment: priceDifference
        }
      }
    });

    // Create a record of this admin action
    await prisma.transaction.create({
      data: {
        amount: updatedAmount - asset.amount,
        type: "TRANSFER",
        status: "COMPLETED",
        cryptoType: asset.symbol as any,
        userId,
      }
    });

    return NextResponse.json({
      message: "Asset balance updated successfully",
      asset: updatedAsset,
    });
  } catch (error) {
    console.error("Error updating asset balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Add a new asset to user's portfolio (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authorization
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const userId = params.id;
    const { symbol, name, amount } = await req.json();

    // Validate input
    if (!symbol || !name || amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if portfolio exists
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        userId,
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "User portfolio not found" },
        { status: 404 }
      );
    }

    // Set a mock price for the asset (in real app, would fetch from API)
    const mockPrices: Record<string, number> = {
      BTC: 30000,
      ETH: 2000,
      USDT: 1,
      BNB: 300,
      XRP: 0.5,
    };

    const price = mockPrices[symbol] || 1;
    const value = parseFloat(amount) * price;

    // Add asset to portfolio
    const newAsset = await prisma.cryptoAsset.create({
      data: {
        symbol,
        name,
        amount: parseFloat(amount),
        value,
        portfolioId: portfolio.id,
      },
    });

    // Update portfolio total value
    await prisma.portfolio.update({
      where: {
        id: portfolio.id,
      },
      data: {
        totalValue: {
          increment: value
        }
      }
    });

    // Create a record of this admin action
    await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type: "DEPOSIT",
        status: "COMPLETED",
        cryptoType: symbol as any,
        userId,
      }
    });

    return NextResponse.json({
      message: "Asset added to portfolio successfully",
      asset: newAsset,
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding asset to portfolio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
