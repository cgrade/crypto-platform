import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// Use enum values via $Enums.ActivityType
import { $Enums } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, amount } = await req.json();
    if (!userId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 });
    }

    // Find user's portfolio and BTC asset
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId },
      include: { assets: true },
    });
    if (!portfolio) {
      return NextResponse.json({ error: 'User portfolio not found' }, { status: 404 });
    }
    const btcAsset = portfolio.assets.find((a) => a.symbol === 'BTC');
    if (!btcAsset) {
      // If no BTC asset, create it
      await prisma.cryptoAsset.create({
        data: {
          symbol: 'BTC',
          name: 'Bitcoin',
          amount,
          portfolioId: portfolio.id,
        },
      });
    } else {
      // Update BTC asset amount
      await prisma.cryptoAsset.update({
        where: { id: btcAsset.id },
        data: { amount: btcAsset.amount + amount },
      });
    }

    // Create transaction record for admin credit
    await prisma.transaction.create({
      data: {
        amount,
        type: 'DEPOSIT', // Or 'ADMIN_CREDIT' if you want to distinguish
        status: 'COMPLETED',
        cryptoType: 'BTC',
        cryptoAddress: null,
        txHash: null,
        userId,
      },
    });

    // Log activity
    const activityMessage = `Interest/profit of ${amount} BTC credited to your account.`;
    await prisma.activity.create({
      data: {
        userId,
        type: $Enums.ActivityType.PROFIT,
        message: activityMessage,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        message: activityMessage,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
