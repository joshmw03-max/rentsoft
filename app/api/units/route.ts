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
    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status");

    const where: any = {};

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (status) {
      where.status = status;
    }

    const units = await prisma.unit.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        },
        _count: {
          select: {
            leases: true,
            applications: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
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

    // Verify property access
    const property = await prisma.property.findUnique({
      where: { id: body.propertyId }
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (
      session.user.role === "PROPERTY_MANAGER" &&
      property.managerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const unit = await prisma.unit.create({
      data: {
        propertyId: body.propertyId,
        unitNumber: body.unitNumber,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        squareFeet: body.squareFeet,
        monthlyRent: body.monthlyRent,
        securityDeposit: body.securityDeposit,
        status: body.status || "AVAILABLE",
        description: body.description,
        imageUrls: body.imageUrls || [],
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        }
      }
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error: any) {
    console.error("Error creating unit:", error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Unit number already exists for this property" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 }
    );
  }
}
