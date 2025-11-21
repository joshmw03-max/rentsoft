"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: string;
  unit: {
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    property: {
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      manager: {
        name: string;
        email: string;
        phone: string;
      };
    };
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  type: string;
}

export default function TenantPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lease, setLease] = useState<Lease | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "TENANT") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session) {
      fetchTenantData();
    }
  }, [session]);

  const fetchTenantData = async () => {
    try {
      const [leasesRes, paymentsRes] = await Promise.all([
        fetch("/api/leases?status=ACTIVE"),
        fetch("/api/payments")
      ]);

      if (leasesRes.ok) {
        const leasesData = await leasesRes.json();
        if (leasesData.length > 0) {
          setLease(leasesData[0]);
        }
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error("Error fetching tenant data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "TENANT") {
    return null;
  }

  const pendingPayments = payments.filter(p => p.status === "PENDING");
  const nextPayment = pendingPayments.sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )[0];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Welcome, {session.user.name}!</h1>

      {!lease ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Lease</h3>
          <p className="text-gray-600">You don't have an active lease at the moment</p>
        </div>
      ) : (
        <>
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/tenant/payments"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">💰</div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Next Payment</div>
                  {nextPayment && (
                    <>
                      <div className="text-2xl font-bold text-gray-900">
                        ${nextPayment.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Due {new Date(nextPayment.dueDate).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                Make Payment
              </button>
            </Link>

            <Link
              href="/tenant/maintenance"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="font-semibold text-gray-900 mb-2">Maintenance Request</h3>
              <p className="text-sm text-gray-600 mb-4">Submit a new maintenance request</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Create Request →
              </button>
            </Link>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">📞</div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact Manager</h3>
              <p className="text-sm text-gray-600 mb-1">{lease.unit.property.manager.name}</p>
              <p className="text-sm text-gray-600">{lease.unit.property.manager.email}</p>
              {lease.unit.property.manager.phone && (
                <p className="text-sm text-gray-600">{lease.unit.property.manager.phone}</p>
              )}
            </div>
          </div>

          {/* Lease Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Lease</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Property</label>
                  <p className="text-gray-900 font-medium">{lease.unit.property.name}</p>
                  <p className="text-sm text-gray-600">
                    {lease.unit.property.address}<br />
                    {lease.unit.property.city}, {lease.unit.property.state} {lease.unit.property.zipCode}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Unit</label>
                  <p className="text-gray-900">
                    Unit {lease.unit.unitNumber} - {lease.unit.bedrooms} bed, {lease.unit.bathrooms} bath
                    {lease.unit.squareFeet && ` • ${lease.unit.squareFeet} sqft`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Lease Term</label>
                    <p className="text-gray-900">
                      {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Monthly Rent</label>
                    <p className="text-gray-900 font-semibold">${lease.monthlyRent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Payments</h2>
                <Link href="/tenant/payments" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All →
                </Link>
              </div>
              {payments.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No payment history yet</p>
              ) : (
                <div className="space-y-3">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{payment.type}</p>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${payment.amount.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          payment.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
