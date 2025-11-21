"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  availableUnits: number;
  occupiedUnits: number;
  activeLeases: number;
  pendingApplications: number;
  openMaintenance: number;
  totalRevenue: number;
  pendingPayments: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back, {session.user.name}!
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={stats?.totalProperties || 0}
          icon="🏢"
          color="blue"
        />
        <StatCard
          title="Total Units"
          value={stats?.totalUnits || 0}
          subtitle={`${stats?.availableUnits || 0} available`}
          icon="🏠"
          color="green"
        />
        <StatCard
          title="Active Leases"
          value={stats?.activeLeases || 0}
          icon="📄"
          color="purple"
        />
        <StatCard
          title="Pending Applications"
          value={stats?.pendingApplications || 0}
          icon="📋"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Open Maintenance"
          value={stats?.openMaintenance || 0}
          icon="🔧"
          color="red"
        />
        <StatCard
          title="Pending Payments"
          value={stats?.pendingPayments || 0}
          icon="💰"
          color="orange"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon="💵"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {(session.user.role === "ADMIN" || session.user.role === "PROPERTY_MANAGER") && (
              <>
                <button
                  onClick={() => router.push("/properties/new")}
                  className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                >
                  ➕ Add New Property
                </button>
                <button
                  onClick={() => router.push("/leases/new")}
                  className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition"
                >
                  📝 Create New Lease
                </button>
                <button
                  onClick={() => router.push("/applications")}
                  className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                >
                  👥 Review Applications
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="text-gray-600">
            Activity feed coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  color: string;
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    emerald: "bg-emerald-500",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-2">
        <div className="text-3xl">{icon}</div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-full opacity-10`}></div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}
