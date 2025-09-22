"use client";
import { useEffect, useState } from "react";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWv3b8HTs_2dVSAul-NwDABv3cIlDgYJBFKcdoWNpXS7N9WX42Fs3QEsWcyimgF-8K5NoD2SUyR41V/pub?output=csv";

type Status = "available" | "on hold" | "booked" | "sold";

type Unit = {
  unit: string;
  floor: number;
  type: string;
  area: string;
  parking: string;
  status: Status;
};

// Normalize status strings from CSV
function normalizeStatus(s: string): Status {
  const clean = s.trim().toLowerCase().replace(/\s+/g, " ");
  if (clean === "on hold") return "on hold";
  if (clean === "booked") return "booked";
  if (clean === "sold") return "sold";
  return "available";
}

export default function Page() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function fetchCSV() {
      try {
        const res = await fetch(CSV_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("CSV fetch failed");

        const text = await res.text();
        const rows = text.trim().split("\n").slice(1);

        const parsed: Unit[] = rows
          .map((row) => {
            const cols = row.split(",");
            if (cols.length < 6) return null;
            const [unit, floor, type, area, parking, status] = cols;
            return {
              unit: (unit || "").trim(),
              floor: parseInt((floor || "0").trim(), 10),
              type: (type || "").trim(),
              area: (area || "").trim(),
              parking: (parking || "").trim(),
              status: normalizeStatus(status || ""),
            };
          })
          .filter(Boolean) as Unit[];

        setUnits(parsed);
      } catch (err) {
        console.error("CSV fetch error:", err);
      }
    }

    fetchCSV();
  }, []);

  if (!mounted) return <div className="p-6">Loading app...</div>;

  // Counters
  const counters = {
    Available: units.filter((u) => u.status === "available").length,
    "On Hold": units.filter((u) => u.status === "on hold").length,
    Booked: units.filter((u) => u.status === "booked").length,
    Sold: units.filter((u) => u.status === "sold").length,
  };

  const borderColors: Record<Status, string> = {
    available: "border-green-500 text-green-600",
    "on hold": "border-amber-500 text-amber-600",
    booked: "border-blue-500 text-blue-600",
    sold: "border-red-500 text-red-600",
  };

  const counterColors: Record<string, string> = {
    Available: "border-green-500 text-green-600",
    "On Hold": "border-amber-500 text-amber-600",
    Booked: "border-blue-500 text-blue-600",
    Sold: "border-red-500 text-red-600",
  };

  const grouped: Record<number, Unit[]> = units.reduce((acc, u) => {
    (acc[u.floor] ||= []).push(u);
    return acc;
  }, {} as Record<number, Unit[]>);

  return (
    <main className="min-h-screen bg-gray-50 p-6 font-['Optima']">
      {/* Header */}
      <div className="flex items-center justify-center mb-6 gap-4">
        <img src="/logo.png" alt="Logo" className="h-10" />
        <h1 className="text-3xl font-bold">Lumena by Omniyat</h1>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(counters).map(([label, value]) => (
          <div
            key={label}
            className={`bg-white shadow rounded-xl p-4 text-center border-2 ${counterColors[label]}`}
          >
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Floors */}
      {Object.keys(grouped)
        .map(Number)
        .sort((a, b) => b - a)
        .map((floor) => (
          <section key={floor} className="mb-8">
            <h2 className="bg-[#0A073E] text-white text-center font-semibold py-2 rounded">
              Floor {floor}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {grouped[floor].map((u) => (
                <div
                  key={u.unit}
                  onClick={() =>
                    u.status === "available" ? setSelectedUnit(u) : null
                  }
                  className={`bg-[#f5f5dc] rounded-lg shadow text-center py-6 cursor-pointer border-2 ${borderColors[u.status]}`}
                >
                  <div className="font-bold">{u.unit}</div>
                </div>
              ))}
            </div>
          </section>
        ))}

      {/* Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setSelectedUnit(null)}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">Unit {selectedUnit.unit}</h3>
            <p>Floor: {selectedUnit.floor}</p>
            <p>Type: {selectedUnit.type}</p>
            <p>Area: {selectedUnit.area} sqft</p>
            <p>Parking: {selectedUnit.parking}</p>
            <p>Status: {selectedUnit.status}</p>
          </div>
        </div>
      )}
    </main>
  );
}
