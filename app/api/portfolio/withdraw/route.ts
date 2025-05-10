import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// POST: Create a withdrawal transaction
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

    // Create a new withdrawal transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type: "WITHDRAWAL",
        status: "PENDING",
        cryptoType,
        cryptoAddress,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Withdrawal request created", transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating withdrawal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
