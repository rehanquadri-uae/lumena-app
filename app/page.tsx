"use client";

export const dynamic = "force-dynamic"; // ✅ Ensure client-side only rendering on Vercel

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

export default function Page() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window === "undefined") return; // ✅ only run client-side

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
              unit: unit.trim(),
              floor: parseInt(floor.trim(), 10),
              type: type.trim(),
              area: area.trim(),
              parking: parking.trim(),
              status: (status.trim().toLowerCase() || "available") as Status,
            };
          })
          .filter((u): u is Unit => u !== null);

        setUnits(parsed);
        setError(null);
      } catch (err) {
        console.error("CSV fetch error:", err);
        setError("⚠️ Failed to load data. Please check the Google Sheet URL.");
      }
    }

    fetchCSV();
  }, []);

  if (!mounted) return <div className="p-6">Loading app...</div>;

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 p-4 bg-white rounded shadow">
          {error}
        </div>
      </main>
    );
  }

  // Counters
  const counters = {
    Available: units.filter((u) => u.status === "available").length,
    "On Hold": units.filter((u) => u.status === "on hold").length,
    Booked: units.filter((u) => u.status === "booked").length,
    Sold: units.filter((u) => u.status === "sold").length,
  };

  // Color map: border + text
  const colors: Record<Status, string> = {
    available: "border-green-600 text-green-600",
    "on hold": "border-amber-500 text-amber-500",
    booked: "border-blue-600 text-blue-600",
    sold: "border-red-600 text-red-600",
  };

  const counterColors: Record<string, string> = {
    Available: "text-green-600 border-green-600",
    "On Hold": "text-amber-500 border-amber-500",
    Booked: "text-blue-600 border-blue-600",
    Sold: "text-red-600 border-red-600",
  };

  const grouped: Record<number, Unit[]> = units.reduce((acc, u) => {
    (acc[u.floor] ||= []).push(u);
    return acc;
  }, {} as Record<number, Unit[]>);

  return (
    <main className="min-h-screen bg-gray-50 font-[Optima]">
      {/* Header with logo */}
      <header className="flex items-center justify-center gap-3 py-6">
        <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
        <h1 className="text-3xl font-bold">Lumena by Omniyat</h1>
      </header>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 max-w-3xl mx-auto px-4">
        {Object.entries(counters).map(([label, value]) => (
          <div
            key={label}
            className={`bg-white shadow-lg rounded-xl p-6 text-center border-2 ${
              counterColors[label]?.split(" ")[1] || "border-gray-300"
            }`}
          >
            <div
              className={`text-3xl font-bold ${
                counterColors[label]?.split(" ")[0] || "text-gray-900"
              }`}
            >
              {value}
            </div>
            <div className="text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Floors */}
      <div className="max-w-3xl mx-auto px-4 space-y-10">
        {Object.keys(grouped)
          .map(Number)
          .sort((a, b) => b - a)
          .map((floor) => (
            <section key={floor}>
              <h2 className="bg-[#0A073E] text-white px-4 py-2 rounded-md text-lg font-semibold mb-4 text-center shadow">
                Floor {floor}
              </h2>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${grouped[floor].length}, minmax(0, 1fr))`,
                }}
              >
                {grouped[floor].map((u) => {
                  const borderClass = colors[u.status].split(" ")[0]; // border-...
                  const textClass = colors[u.status].split(" ")[1]; // text-...

                  return (
                    <div
                      key={u.unit}
                      onClick={() =>
                        u.status === "available" && setSelectedUnit(u)
                      }
                      className={`p-6 rounded-lg shadow-md text-center cursor-pointer bg-[#F5F5DC] border-2 ${borderClass}`}
                    >
                      <div className={`font-bold ${textClass}`}>{u.unit}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
      </div>

      {/* Modal */}
      {selectedUnit && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedUnit(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedUnit(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">
              Unit {selectedUnit.unit} Details
            </h3>
            <p>
              <strong>Floor:</strong> {selectedUnit.floor}
            </p>
            <p>
              <strong>Type:</strong> {selectedUnit.type}
            </p>
            <p>
              <strong>Area:</strong> {selectedUnit.area} sqft
            </p>
            <p>
              <strong>Parking:</strong> {selectedUnit.parking}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`${colors[selectedUnit.status]}`}>
                {selectedUnit.status.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
