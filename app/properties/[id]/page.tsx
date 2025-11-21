"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
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
  description: string;
  manager: {
    name: string;
    email: string;
    phone: string;
  };
  units: Array<{
    id: string;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    monthlyRent: number;
    status: string;
  }>;
  amenities: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export default function PropertyDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session && params.id) {
      fetchProperty();
    }
  }, [session, params.id]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      } else {
        router.push("/properties");
      }
    } catch (error) {
      console.error("Error fetching property:", error);
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

  if (!session || !property) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "OCCUPIED":
        return "bg-blue-100 text-blue-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      case "RESERVED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/properties"
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
          >
            ← Back to Properties
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
          <p className="text-gray-600">{property.type.replace("_", " ")}</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            property.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {property.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Property Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Address</label>
                <p className="text-gray-900">
                  {property.address}<br />
                  {property.city}, {property.state} {property.zipCode}
                </p>
              </div>
              {property.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900">{property.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Units */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Units ({property.units.length})
              </h2>
              {(session.user.role === "ADMIN" || session.user.role === "PROPERTY_MANAGER") && (
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">
                  + Add Unit
                </button>
              )}
            </div>

            {property.units.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No units added yet</p>
            ) : (
              <div className="space-y-3">
                {property.units.map((unit) => (
                  <div
                    key={unit.id}
                    className="border rounded-lg p-4 hover:border-blue-300 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Unit {unit.unitNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {unit.bedrooms} bed • {unit.bathrooms} bath
                          {unit.squareFeet && ` • ${unit.squareFeet} sqft`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                        {unit.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-lg font-semibold text-gray-900">
                        ${unit.monthlyRent.toLocaleString()}/mo
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Manager */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Manager</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{property.manager.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{property.manager.email}</p>
              </div>
              {property.manager.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{property.manager.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="space-y-2">
                {property.amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <div>
                      <p className="font-medium text-gray-900">{amenity.name}</p>
                      {amenity.description && (
                        <p className="text-sm text-gray-600">{amenity.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Units</span>
                <span className="font-semibold text-gray-900">{property.units.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available</span>
                <span className="font-semibold text-green-600">
                  {property.units.filter(u => u.status === "AVAILABLE").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Occupied</span>
                <span className="font-semibold text-blue-600">
                  {property.units.filter(u => u.status === "OCCUPIED").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
