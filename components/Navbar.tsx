"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? "bg-blue-700" : "";
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-2xl font-bold">
              RentSoft
            </Link>

            {session && (
              <div className="hidden md:flex space-x-4">
                {(session.user.role === "ADMIN" || session.user.role === "PROPERTY_MANAGER") && (
                  <>
                    <Link
                      href="/dashboard"
                      className={`px-3 py-2 rounded-md hover:bg-blue-700 transition ${isActive("/dashboard")}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/properties"
                      className={`px-3 py-2 rounded-md hover:bg-blue-700 transition ${isActive("/properties")}`}
                    >
                      Properties
                    </Link>
                    <Link
                      href="/leases"
                      className={`px-3 py-2 rounded-md hover:bg-blue-700 transition ${isActive("/leases")}`}
                    >
                      Leases
                    </Link>
                    <Link
                      href="/applications"
                      className={`px-3 py-2 rounded-md hover:bg-blue-700 transition ${isActive("/applications")}`}
                    >
                      Applications
                    </Link>
                    <Link
                      href="/maintenance"
                      className={`px-3 py-2 rounded-md hover:bg-blue-700 transition ${isActive("/maintenance")}`}
                    >
                      Maintenance
                    </Link>
                    <Link
                      href="/payments"
                      className={`px-3 py-2 rounded-md hover:bg-blue-700 transition ${isActive("/payments")}`}
                    >
                      Payments
                    </Link>
                  </>
                )}

                {session.user.role === "TENANT" && (
                  <>
                    <Link
                      href="/tenant"
                      className={`px-3 py-2 rounded-md hover:bg-blue-700 transition ${isActive("/tenant")}`}
                    >
                      My Portal
                    </Link>
                    <Link
                      href="/tenant/payments"
                      className={`px-3 py-2 rounded-md hover:bg-blue-700 transition ${isActive("/tenant/payments")}`}
                    >
                      Payments
                    </Link>
                    <Link
                      href="/tenant/maintenance"
                      className={`px-3 py-2 rounded-md hover:bg-blue-700 transition ${isActive("/tenant/maintenance")}`}
                    >
                      Maintenance
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <div className="text-sm">
                  <div className="font-medium">{session.user.name}</div>
                  <div className="text-blue-200 text-xs">{session.user.role}</div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-md transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-md transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
