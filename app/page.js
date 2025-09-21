"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [units, setUnits] = useState([]);

  // Fetch data from your API/DB
  useEffect(() => {
    async function fetchData() {
      // Replace with your Supabase/Sheets fetch
      const data = [
        { unit: "4601", status: "Available" },
        { unit: "4602", status: "Sold" },
        { unit: "4501", status: "On Hold" },
        { unit: "4502", status: "Booked" },
      ];
      setUnits(data);
    }
    fetchData();

    // Auto refresh every 30s
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Count stats
  const counts = {
    Available: units.filter((u) => u.status === "Available").length,
    "On Hold": units.filter((u) => u.status === "On Hold").length,
    Booked: units.filter((u) => u.status === "Booked").length,
    Sold: units.filter((u) => u.status === "Sold").length,
  };

  const statusColors = {
    Available: "border-green-500 text-green-600",
    "On Hold": "border-amber-500 text-amber-600",
    Booked: "border-blue-500 text-blue-600",
    Sold: "border-red-500 text-red-600",
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
        🏢 Lumena by Omniyat
      </h1>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.keys(counts).map((status) => (
          <div
            key={status}
            className={`rounded-xl border-2 p-4 text-center shadow-sm ${statusColors[status]}`}
          >
            <p className="font-semibold">{status}</p>
            <p className="text-2xl font-bold">{counts[status]}</p>
          </div>
        ))}
      </div>

      {/* Units */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Units</h2>
        <div className="flex flex-wrap gap-4">
          {units.map((u) => (
            <div
              key={u.unit}
              className={`w-20 h-20 flex items-center justify-center rounded-xl border-2 text-sm font-bold ${statusColors[u.status]} ${
                u.status === "Available" || u.status === "On Hold"
                  ? "cursor-pointer hover:bg-gray-100"
                  : "opacity-50 pointer-events-none"
              }`}
            >
              {u.unit}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
