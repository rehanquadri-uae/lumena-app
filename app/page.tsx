"use client";
import { useEffect, useState } from "react";

// Google Sheet CSV link
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
  const [mounted, setMounted] = useState(false); // avoid hydration warning

  // avoid SSR/client mismatch
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function fetchCSV() {
      const res = await fetch(CSV_URL, { cache: "no-store" });
      const text = await res.text();

      const rows = text.trim().split("\n").slice(1); // skip header
      const parsed: Unit[] = rows.map((row) => {
        // NOTE: if your sheet ever contains commas inside quotes, we can swap to a real CSV parser.
        const [unit, floor, type, area, parking, status] = row.split(",");
        return {
          unit: (unit || "").trim(),
          floor: parseInt((floor || "0").trim(), 10),
          type: (type || "").trim(),
          area: (area || "").trim(),
          parking: (parking || "").trim(),
          // 🔑 normalize: trim + remove \r + lowercase
          status: ((status || "").trim().replace(/\r/g, "").toLowerCase() ||
            "available") as Status,
        };
      });

      setUnits(parsed);
    }

    fetchCSV();
    const id = setInterval(fetchCSV, 30000); // auto-refresh every 30s
    return () => clearInterval(id);
  }, []);

  // Counters (compare in lowercase)
  const counters = {
    Available: units.filter((u) => u.status === "available").length,
    "On Hold": units.filter((u) => u.status === "on hold").length,
    Booked: units.filter((u) => u.status === "booked").length,
    Sold: units.filter((u) => u.status === "sold").length,
  };

  // Colors keyed by lowercase statuses
  const colors: Record<Status, string> = {
    available: "bg-green-500 text-white",
    "on hold": "bg-amber-400 text-black",
    booked: "bg-blue-500 text-white",
    sold: "bg-red-600 text-white",
  };

  // Group by floor
  const grouped: Record<number, Unit[]> = units.reduce((acc, u) => {
    (acc[u.floor] ||= []).push(u);
    return acc;
  }, {} as Record<number, Unit[]>);

  if (!mounted) return null;

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
        {(
          [
            ["Available", "available"],
            ["On Hold", "on hold"],
            ["Booked", "booked"],
            ["Sold", "sold"],
          ] as const
        ).map(([label, key]) => (
          <div key={key} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded-full ${colors[key]}`} />
            {label}
          </div>
        ))}
      </div>

      {/* Floors */}
      <div className="space-y-8">
        {Object.keys(grouped)
          .map(Number)
          .sort((a, b) => b - a) // highest floor first
          .map((floor) => (
            <section key={floor}>
              <h2 className="text-xl font-semibold mb-2">Floor {floor}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {grouped[floor].map((u) => {
                  const isLocked = u.status === "sold" || u.status === "booked";
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
            </section>
          ))}
      </div>
    </main>
  );
}
