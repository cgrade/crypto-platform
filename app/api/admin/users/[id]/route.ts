import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

// GET: Fetch user details (admin only)
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

    // In Next.js 14+, properly await params before using
    const userId = await params.id;

    // Get the specified user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
        btcAddress: true,
        btcAddressQrCode: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update user deposit address details (admin only)
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

    // In Next.js 14+, properly await params before using
    const userId = await params.id;
    const { btcAddress, btcAddressQrCode, role, investmentPlan } = await req.json();

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Validate BTC address if provided
    if (btcAddress && !btcAddress.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/)) {
      return NextResponse.json(
        { error: "Invalid Bitcoin address format" },
        { status: 400 }
      );
    }
    
    // Validate role if provided
    if (role && !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be USER or ADMIN" },
        { status: 400 }
      );
    }

    // Update user with new data
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        btcAddress,
        btcAddressQrCode,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        investmentPlan: investmentPlan || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        btcAddress: true,
        btcAddressQrCode: true,
      },
    });

    // Determine which fields were updated for the response message
    const updatedFields = [];
    if (btcAddress !== undefined || btcAddressQrCode !== undefined) updatedFields.push("deposit address");
    if (role !== undefined) updatedFields.push("role");

    return NextResponse.json({
      message: `User ${updatedFields.join(" and ")} updated successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user (admin only)
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

    // In Next.js 14+, properly await params before using
    const userId = await params.id;

    // Prevent deleting the last admin
    const adminCount = await prisma.user.count({
      where: {
        role: "ADMIN",
      },
    });

    const userToDelete = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deleting the last admin
    if (userToDelete.role === "ADMIN" && adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last admin user" },
        { status: 400 }
      );
    }

    // Delete the user and all associated data
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
