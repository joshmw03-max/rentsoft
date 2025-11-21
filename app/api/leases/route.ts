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
    const unitId = searchParams.get("unitId");

    const where: any = {};

    // Tenants can only see their own leases
    if (session.user.role === "TENANT") {
      where.tenantId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (unitId) {
      where.unitId = unitId;
    }

    const leases = await prisma.lease.findMany({
      where,
      include: {
        unit: {
          include: {
            property: {
              select: {
                name: true,
                address: true,
                city: true,
                state: true,
              }
            }
          }
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        _count: {
          select: {
            payments: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(leases);
  } catch (error) {
    console.error("Error fetching leases:", error);
    return NextResponse.json(
      { error: "Failed to fetch leases" },
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

    if (session.user.role !== "ADMIN" && session.user.role !== "PROPERTY_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Verify unit is available
    const unit = await prisma.unit.findUnique({
      where: { id: body.unitId }
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 404 }
      );
    }

    const lease = await prisma.lease.create({
      data: {
        unitId: body.unitId,
        tenantId: body.tenantId,
        status: body.status || "DRAFT",
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        monthlyRent: body.monthlyRent,
        securityDeposit: body.securityDeposit,
        lateFeeAmount: body.lateFeeAmount,
        lateFeeDay: body.lateFeeDay,
        paymentDueDay: body.paymentDueDay,
        terms: body.terms,
        specialClauses: body.specialClauses,
      },
      include: {
        unit: {
          include: {
            property: true,
          }
        },
        tenant: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    // Update unit status to occupied when lease becomes active
    if (body.status === "ACTIVE") {
      await prisma.unit.update({
        where: { id: body.unitId },
        data: { status: "OCCUPIED" }
      });
    }

    return NextResponse.json(lease, { status: 201 });
  } catch (error) {
    console.error("Error creating lease:", error);
    return NextResponse.json(
      { error: "Failed to create lease" },
      { status: 500 }
    );
  }
}
