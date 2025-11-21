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

    const where: any = {};

    // Filter by manager for property managers
    if (session.user.role === "PROPERTY_MANAGER") {
      where.managerId = session.user.id;
    }

    // Fetch properties
    const properties = await prisma.property.findMany({
      where,
      include: {
        units: {
          include: {
            leases: {
              where: {
                status: "ACTIVE"
              }
            }
          }
        }
      }
    });

    const totalProperties = properties.length;
    const allUnits = properties.flatMap(p => p.units);
    const totalUnits = allUnits.length;
    const availableUnits = allUnits.filter(u => u.status === "AVAILABLE").length;
    const occupiedUnits = allUnits.filter(u => u.status === "OCCUPIED").length;

    // Fetch leases
    const leaseWhere: any = {
      status: "ACTIVE"
    };
    if (session.user.role === "TENANT") {
      leaseWhere.tenantId = session.user.id;
    }

    const activeLeases = await prisma.lease.count({
      where: leaseWhere
    });

    // Fetch applications
    const appWhere: any = {
      status: "PENDING"
    };
    if (session.user.role === "TENANT") {
      appWhere.applicantId = session.user.id;
    }

    const pendingApplications = await prisma.application.count({
      where: appWhere
    });

    // Fetch maintenance requests
    const maintWhere: any = {
      status: {
        in: ["OPEN", "IN_PROGRESS"]
      }
    };
    if (session.user.role === "TENANT") {
      maintWhere.tenantId = session.user.id;
    }

    const openMaintenance = await prisma.maintenanceRequest.count({
      where: maintWhere
    });

    // Fetch payments
    const paymentWhere: any = {};
    if (session.user.role === "TENANT") {
      paymentWhere.payerId = session.user.id;
    }

    const pendingPayments = await prisma.payment.count({
      where: {
        ...paymentWhere,
        status: "PENDING"
      }
    });

    const completedPayments = await prisma.payment.findMany({
      where: {
        ...paymentWhere,
        status: "COMPLETED"
      },
      select: {
        amount: true
      }
    });

    const totalRevenue = completedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    const stats = {
      totalProperties,
      totalUnits,
      availableUnits,
      occupiedUnits,
      activeLeases,
      pendingApplications,
      openMaintenance,
      totalRevenue,
      pendingPayments,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
