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

    // Tenants can only see their own applications
    if (session.user.role === "TENANT") {
      where.applicantId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (unitId) {
      where.unitId = unitId;
    }

    const applications = await prisma.application.findMany({
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
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        documents: true,
      },
      orderBy: {
        submittedAt: "desc"
      }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
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

    // Verify unit exists and is available
    const unit = await prisma.unit.findUnique({
      where: { id: body.unitId }
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 404 }
      );
    }

    const application = await prisma.application.create({
      data: {
        unitId: body.unitId,
        applicantId: session.user.id,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        currentAddress: body.currentAddress,
        employmentStatus: body.employmentStatus,
        employer: body.employer,
        monthlyIncome: body.monthlyIncome,
        moveInDate: body.moveInDate,
        numOccupants: body.numOccupants,
        hasPets: body.hasPets,
        petDescription: body.petDescription,
        emergencyContact: body.emergencyContact,
        emergencyPhone: body.emergencyPhone,
      },
      include: {
        unit: {
          include: {
            property: true,
          }
        },
        applicant: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
