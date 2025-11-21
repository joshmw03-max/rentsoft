import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: "admin@rentsoft.com" },
    update: {},
    create: {
      email: "admin@rentsoft.com",
      password: await hash("admin123", 10),
      name: "Admin User",
      phone: "555-0100",
      role: "ADMIN",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@rentsoft.com" },
    update: {},
    create: {
      email: "manager@rentsoft.com",
      password: await hash("manager123", 10),
      name: "Property Manager",
      phone: "555-0101",
      role: "PROPERTY_MANAGER",
    },
  });

  const tenant1 = await prisma.user.upsert({
    where: { email: "tenant1@example.com" },
    update: {},
    create: {
      email: "tenant1@example.com",
      password: await hash("tenant123", 10),
      name: "John Tenant",
      phone: "555-0102",
      role: "TENANT",
    },
  });

  const tenant2 = await prisma.user.upsert({
    where: { email: "tenant2@example.com" },
    update: {},
    create: {
      email: "tenant2@example.com",
      password: await hash("tenant123", 10),
      name: "Jane Tenant",
      phone: "555-0103",
      role: "TENANT",
    },
  });

  console.log("✅ Users created");

  // Create properties
  const property1 = await prisma.property.create({
    data: {
      name: "Sunset Apartments",
      type: "APARTMENT",
      status: "ACTIVE",
      address: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      description: "Modern apartment complex in the heart of the city",
      managerId: manager.id,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      name: "Riverside Condos",
      type: "CONDO",
      status: "ACTIVE",
      address: "456 River Road",
      city: "Oakland",
      state: "CA",
      zipCode: "94601",
      description: "Luxury condos with waterfront views",
      managerId: manager.id,
    },
  });

  console.log("✅ Properties created");

  // Create amenities
  await prisma.amenity.createMany({
    data: [
      { propertyId: property1.id, name: "Pool", description: "Heated outdoor pool" },
      { propertyId: property1.id, name: "Gym", description: "24/7 fitness center" },
      { propertyId: property1.id, name: "Parking", description: "Covered parking" },
      { propertyId: property2.id, name: "Concierge", description: "24/7 concierge service" },
      { propertyId: property2.id, name: "Rooftop Deck", description: "Shared rooftop terrace" },
    ],
  });

  console.log("✅ Amenities created");

  // Create units
  const unit1 = await prisma.unit.create({
    data: {
      propertyId: property1.id,
      unitNumber: "101",
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: 850,
      monthlyRent: 2500,
      securityDeposit: 2500,
      status: "OCCUPIED",
      description: "Cozy 2-bedroom apartment with balcony",
    },
  });

  const unit2 = await prisma.unit.create({
    data: {
      propertyId: property1.id,
      unitNumber: "102",
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 650,
      monthlyRent: 2000,
      securityDeposit: 2000,
      status: "AVAILABLE",
      description: "Modern 1-bedroom with city views",
    },
  });

  const unit3 = await prisma.unit.create({
    data: {
      propertyId: property2.id,
      unitNumber: "301",
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1200,
      monthlyRent: 3500,
      securityDeposit: 3500,
      status: "AVAILABLE",
      description: "Spacious 3-bedroom condo with river views",
    },
  });

  console.log("✅ Units created");

  // Create lease
  const lease1 = await prisma.lease.create({
    data: {
      unitId: unit1.id,
      tenantId: tenant1.id,
      status: "ACTIVE",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      monthlyRent: 2500,
      securityDeposit: 2500,
      lateFeeAmount: 50,
      lateFeeDay: 5,
      paymentDueDay: 1,
      terms: "Standard 12-month lease agreement",
      signedAt: new Date("2024-12-15"),
    },
  });

  console.log("✅ Lease created");

  // Create payments
  const currentMonth = new Date();
  currentMonth.setDate(1);

  await prisma.payment.create({
    data: {
      leaseId: lease1.id,
      payerId: tenant1.id,
      amount: 2500,
      type: "RENT",
      status: "COMPLETED",
      dueDate: currentMonth,
      paidDate: currentMonth,
      paymentMethod: "Credit Card",
      transactionId: "txn_12345",
    },
  });

  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.payment.create({
    data: {
      leaseId: lease1.id,
      payerId: tenant1.id,
      amount: 2500,
      type: "RENT",
      status: "PENDING",
      dueDate: nextMonth,
      paymentMethod: "Credit Card",
    },
  });

  console.log("✅ Payments created");

  // Create application
  await prisma.application.create({
    data: {
      unitId: unit2.id,
      applicantId: tenant2.id,
      status: "PENDING",
      firstName: "Jane",
      lastName: "Tenant",
      email: "tenant2@example.com",
      phone: "555-0103",
      currentAddress: "789 Oak Street, San Francisco, CA 94103",
      employmentStatus: "Employed",
      employer: "Tech Corp",
      monthlyIncome: 7000,
      moveInDate: new Date("2025-02-01"),
      numOccupants: 1,
      hasPets: false,
    },
  });

  console.log("✅ Application created");

  // Create maintenance request
  await prisma.maintenanceRequest.create({
    data: {
      unitId: unit1.id,
      tenantId: tenant1.id,
      title: "Leaky faucet in kitchen",
      description: "The kitchen sink faucet has been dripping constantly",
      priority: "MEDIUM",
      status: "OPEN",
      category: "Plumbing",
    },
  });

  console.log("✅ Maintenance request created");

  console.log("🎉 Seeding completed successfully!");
  console.log("\nDemo Login Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin:");
  console.log("  Email: admin@rentsoft.com");
  console.log("  Password: admin123");
  console.log("\nProperty Manager:");
  console.log("  Email: manager@rentsoft.com");
  console.log("  Password: manager123");
  console.log("\nTenant:");
  console.log("  Email: tenant1@example.com");
  console.log("  Password: tenant123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
