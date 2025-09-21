"use client";
import { useEffect, useState } from "react";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWv3b8HTs_2dVSAul-NwDABv3cIlDgYJBFKcdoWNpXS7N9WX42Fs3QEsWcyimgF-8K5NoD2SUyR41V/pub?output=csv";

type Unit = {
  unit: string;
  floor: number;
  type: string;
  area: string;
  parking: string;
  status: "Available" | "On Hold" | "Booked" | "Sold";
};

export default function Page() {
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    async function fetchCSV() {
      const response = await fetch(CSV_URL);
      const text = await response.text();

      const rows = text.trim().split("\n").slice(1); // skip header
      const parsed = rows.map((row) => {
        const [unit, floor, type, area, parking, status] = row.split(",");
        return {
          unit,
          floor: parseInt(floor, 10),
          type,
          area,
          parking,
          // trim spaces + normalize case
          status: status.trim().replace(/\r/g, "") as Unit["status"],
        };
      });
      setUnits(parsed);
    }

    fetchCSV();
  }, []);

  // Group by floor
  const grouped: Record<number, Unit[]> = units.reduce((acc, u) => {
    if (!acc[u.floor]) acc[u.floor] = [];
    acc[u.floor].push(u);
    return acc;
  }, {} as Record<number, Unit[]>);

  // Status counters
  const counters = {
    Available: units.filter((u) => u.status === "Available").length,
    "On Hold": units.filter((u) => u.status === "On Hold").length,
    Booked: units.filter((u) => u.status === "Booked").length,
    Sold: units.filter((u) => u.status === "Sold").length,
  };

  // Color map
  const colors: Record<Unit["status"], string> = {
    Available: "bg-green-500 text-white",
    "On Hold": "bg-amber-400 text-black",
    Booked: "bg-blue-500 text-white",
    Sold: "bg-red-600 text-white",
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
        🏢 Lumena by Omniyat
      </h1>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(counters).map(([label, value]) => (
          <div
            key={label}
            className="bg-white shadow rounded-xl p-4 text-center"
          >
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 text-sm">
        {Object.entries(colors).map(([label, cls]) => (
          <div key={label} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded-full ${cls}`} />
            {label}
          </div>
        ))}
      </div>

      {/* Floors */}
      <div className="space-y-8">
        {Object.keys(grouped)
          .sort((a, b) => Number(b) - Number(a)) // highest floor first
          .map((floor) => (
            <div key={floor}>
              <h2 className="text-xl font-semibold mb-2">Floor {floor}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {grouped[Number(floor)].map((u) => {
                  const isLocked =
                    u.status === "Sold" || u.status === "Booked";
                  return (
                    <div
                      key={u.unit}
                      className={`p-4 rounded-lg shadow text-center ${colors[u.status]} ${
                        isLocked
                          ? "opacity-70 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      <div className="font-bold">Unit {u.unit}</div>
                      {!isLocked && (
                        <div className="text-sm mt-1">
                          {u.type}, {u.area} sqft, Parking {u.parking}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
