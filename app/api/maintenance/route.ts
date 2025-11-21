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
    const priority = searchParams.get("priority");
    const unitId = searchParams.get("unitId");

    const where: any = {};

    // Tenants can only see their own requests
    if (session.user.role === "TENANT") {
      where.tenantId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (unitId) {
      where.unitId = unitId;
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where,
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
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: [
        {
          priority: "desc"
        },
        {
          createdAt: "desc"
        }
      ]
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance requests" },
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

    // Verify unit exists
    const unit = await prisma.unit.findUnique({
      where: { id: body.unitId }
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 404 }
      );
    }

    const request_data = await prisma.maintenanceRequest.create({
      data: {
        unitId: body.unitId,
        tenantId: session.user.id,
        title: body.title,
        description: body.description,
        priority: body.priority || "MEDIUM",
        category: body.category,
        imageUrls: body.imageUrls || [],
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

    return NextResponse.json(request_data, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance request:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance request" },
      { status: 500 }
    );
  }
}
