import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const leaseId = searchParams.get("leaseId");

    const where: any = {};

    // Tenants can only see their own payments
    if (session.user.role === "TENANT") {
      where.payerId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (leaseId) {
      where.leaseId = leaseId;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  select: {
                    name: true,
                    address: true,
                  }
                }
              }
            },
            tenant: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        dueDate: "desc"
      }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Verify lease exists
    const lease = await prisma.lease.findUnique({
      where: { id: body.leaseId }
    });

    if (!lease) {
      return NextResponse.json(
        { error: "Lease not found" },
        { status: 404 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        leaseId: body.leaseId,
        payerId: session.user.id,
        amount: body.amount,
        type: body.type || "RENT",
        status: body.status || "PENDING",
        dueDate: new Date(body.dueDate),
        paymentMethod: body.paymentMethod,
        notes: body.notes,
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              }
            }
          }
        },
        payer: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
