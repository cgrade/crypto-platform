import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Admin privileges required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, txHash } = body;

    // Validate status
    if (!['COMPLETED', 'FAILED'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the transaction (with userId, amount, type, status, cryptoType)
      const transaction = await tx.transaction.findUnique({
        where: { id },
      });
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      // Update transaction status and txHash
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: {
          status,
          txHash: txHash || undefined,
          updatedAt: new Date(),
        },
      });
      // If completed, update user portfolio balance based on transaction type
      if (status === 'COMPLETED') {
        // Find user's portfolio
        const portfolio = await tx.portfolio.findFirst({
          where: { userId: transaction.userId },
          include: {
            assets: {
              where: { symbol: transaction.cryptoType }
            }
          }
        });
        
        if (!portfolio) {
          throw new Error('User portfolio not found');
        }
        
        // Use static BTC price for calculations (in a real app, use market price API)
        const btcPrice = 50000;
        
        if (transaction.type === 'DEPOSIT') {
          // Handle deposit approval - increase balance
          console.log(`Processing approved deposit of ${transaction.amount} ${transaction.cryptoType} for user ${transaction.userId}`);
          
          if (portfolio.assets.length > 0) {
            // Update existing asset
            const asset = portfolio.assets[0];
            await tx.cryptoAsset.update({
              where: { id: asset.id },
              data: {
                amount: asset.amount + transaction.amount,
                updatedAt: new Date()
              }
            });
          } else {
            // Create new asset if it doesn't exist
            await tx.cryptoAsset.create({
              data: {
                symbol: transaction.cryptoType,
                name: transaction.cryptoType === 'BTC' ? 'Bitcoin' : transaction.cryptoType,
                amount: transaction.amount,
                portfolioId: portfolio.id
              }
            });
          }
          
          // Increase portfolio total value
          await tx.portfolio.update({
            where: { id: portfolio.id },
            data: {
              totalValue: {
                increment: transaction.amount * btcPrice
              },
              updatedAt: new Date()
            }
          });
          
          // Create notification for the user
          await tx.notification.create({
            data: {
              userId: transaction.userId,
              message: `Your deposit of ${transaction.amount} ${transaction.cryptoType} has been approved and added to your balance.`
            }
          });
          
        } else if (transaction.type === 'WITHDRAWAL') {
          // Handle withdrawal approval - decrease balance
          if (!portfolio || portfolio.assets.length === 0) {
            throw new Error('User portfolio or asset not found');
          }
          
          const asset = portfolio.assets[0];
          // Final balance check
          if (asset.amount < transaction.amount) {
            throw new Error('Insufficient balance for withdrawal');
          }
          
          // Update crypto asset amount
          await tx.cryptoAsset.update({
            where: { id: asset.id },
            data: {
              amount: asset.amount - transaction.amount,
              updatedAt: new Date()
            }
          });
          
          // Update total portfolio value
          await tx.portfolio.update({
            where: { id: portfolio.id },
            data: {
              totalValue: {
                decrement: transaction.amount * btcPrice
              },
              updatedAt: new Date()
            }
          });
          
          // Create notification for the user
          await tx.notification.create({
            data: {
              userId: transaction.userId,
              message: `Your withdrawal of ${transaction.amount} ${transaction.cryptoType} has been approved.`
            }
          });
        }
      }
      return updatedTransaction;
    });
    return NextResponse.json({ success: true, transaction: result });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ success: false, message: 'Failed to update transaction' }, { status: 500 });
  }
}
