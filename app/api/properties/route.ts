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

    const where: any = {};

    // Filter by manager for property managers
    if (session.user.role === "PROPERTY_MANAGER") {
      where.managerId = session.user.id;
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        units: {
          select: {
            id: true,
            unitNumber: true,
            status: true,
            monthlyRent: true,
          }
        },
        _count: {
          select: {
            units: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
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

    const property = await prisma.property.create({
      data: {
        name: body.name,
        type: body.type,
        status: body.status || "ACTIVE",
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country || "USA",
        description: body.description,
        imageUrl: body.imageUrl,
        managerId: session.user.role === "ADMIN" ? body.managerId : session.user.id,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
