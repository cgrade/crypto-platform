import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { generateQRCode, isValidBitcoinAddress } from "@/lib/qrcode";

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

// POST: Generate and set QR code for user's BTC address
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

    // In Next.js 14+, we need to await params
    const { id } = params;
    const userId = id;

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, btcAddress: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.btcAddress) {
      return NextResponse.json(
        { error: "User doesn't have a BTC address assigned" },
        { status: 400 }
      );
    }

    // Validate the Bitcoin address
    if (!isValidBitcoinAddress(user.btcAddress)) {
      return NextResponse.json(
        { error: "Invalid Bitcoin address format" },
        { status: 400 }
      );
    }

    // Generate QR code for the address
    const qrCodeDataUrl = await generateQRCode(user.btcAddress);

    // Update user with new QR code
    await prisma.user.update({
      where: { id: userId },
      data: { btcAddressQrCode: qrCodeDataUrl }
    });

    return NextResponse.json({
      success: true,
      message: "QR code generated successfully",
      qrCode: qrCodeDataUrl
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}

// PUT: Upload custom QR code for user
export async function PUT(
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

    // In Next.js 14+, we need to await params
    const { id } = params;
    const userId = id;
    const { qrCodeDataUrl } = await req.json();

    // Validate input
    if (!qrCodeDataUrl || !qrCodeDataUrl.startsWith('data:image/')) {
      return NextResponse.json(
        { error: "Invalid QR code data. Must be a data URL." },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user with new QR code
    await prisma.user.update({
      where: { id: userId },
      data: { btcAddressQrCode: qrCodeDataUrl }
    });

    return NextResponse.json({
      success: true,
      message: "Custom QR code uploaded successfully"
    });
  } catch (error) {
    console.error("Error uploading QR code:", error);
    return NextResponse.json(
      { error: "Failed to upload QR code" },
      { status: 500 }
    );
  }
}

// DELETE: Remove QR code from user
export async function DELETE(
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

    // In Next.js 14+, we need to await params
    const { id } = params;
    const userId = id;

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Remove QR code from user
    await prisma.user.update({
      where: { id: userId },
      data: { btcAddressQrCode: null }
    });

    return NextResponse.json({
      success: true,
      message: "QR code removed successfully"
    });
  } catch (error) {
    console.error("Error removing QR code:", error);
    return NextResponse.json(
      { error: "Failed to remove QR code" },
      { status: 500 }
    );
  }
}
