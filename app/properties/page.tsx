"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Property {
  id: string;
  name: string;
  type: string;
  status: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  manager: {
    name: string;
  };
  units: {
    id: string;
    status: string;
  }[];
  _count: {
    units: number;
  };
}

export default function PropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchProperties();
    }
  }, [session]);

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties");
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
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

  const availableCount = (property: Property) =>
    property.units.filter(u => u.status === "AVAILABLE").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        {(session.user.role === "ADMIN" || session.user.role === "PROPERTY_MANAGER") && (
          <Link
            href="/properties/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            + Add Property
          </Link>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first property</p>
          {(session.user.role === "ADMIN" || session.user.role === "PROPERTY_MANAGER") && (
            <Link
              href="/properties/new"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Add Your First Property
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 block"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {property.name}
                  </h3>
                  <p className="text-sm text-gray-600">{property.type.replace("_", " ")}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    property.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {property.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start text-sm text-gray-600">
                  <span className="mr-2">📍</span>
                  <div>
                    {property.address}<br />
                    {property.city}, {property.state} {property.zipCode}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">👤</span>
                  {property.manager.name}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">
                    {property._count.units}
                  </span>
                  <span className="text-gray-600"> total units</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-green-600">
                    {availableCount(property)}
                  </span>
                  <span className="text-gray-600"> available</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
