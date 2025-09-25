"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Unit = {
  unit: string;
  floor: string;
  type: string;
  area: string;
  parking: string;
  status: "Available" | "On Hold" | "Booked" | "Sold" | string;
};

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID!;
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY!;
const RANGE = "'First Release(in)'!A1:F1000";
const POLL_MS = 30_000;

/* ---------- Helpers ---------- */
function normalizeStatus(raw: string | undefined): Unit["status"] {
  const s = (raw ?? "").toLowerCase().trim();
  if (["available", "avail"].includes(s)) return "Available";
  if (["hold", "on hold", "on-hold"].includes(s)) return "On Hold";
  if (["booked", "reserve", "reserved"].includes(s)) return "Booked";
  if (["sold", "closed"].includes(s)) return "Sold";
  return (raw ?? "").toString();
}

function rowsToUnits(rows: string[][]): Unit[] {
  if (!rows || rows.length === 0) return [];
  const [header, ...values] = rows;
  const keys = header.map((h) => h.trim().toLowerCase());

  return values.map((row) => {
    const obj: Record<string, string> = {};
    keys.forEach((k, i) => (obj[k] = (row[i] ?? "").toString().trim()));
    obj["status"] = normalizeStatus(obj["status"]);
    return obj as Unit;
  });
}

function statusColors(status: string) {
  switch (status) {
    case "Available":
      return { border: "border-green-500", badge: "bg-green-500 text-white" };
    case "On Hold":
      return { border: "border-amber-500", badge: "bg-amber-500 text-white" };
    case "Booked":
      return { border: "border-blue-500", badge: "bg-blue-500 text-white" };
    case "Sold":
      return { border: "border-red-500", badge: "bg-red-500 text-white" };
    default:
      return { border: "border-gray-300", badge: "bg-gray-400 text-white" };
  }
}

/* ---------- Fetch ---------- */
async function fetchUnits(): Promise<Unit[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    RANGE
  )}?key=${API_KEY}`;
  const res = await fetch(url, { cache: "no-store" });
  const data: { values?: string[][] } = await res.json();
  return rowsToUnits(data.values ?? []);
}

/* ---------- Page ---------- */
export default function Page() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Unit | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await fetchUnits();
      setUnits(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const counts = useMemo(() => {
    const c = { total: units.length, available: 0, hold: 0, booked: 0, sold: 0 };
    for (const u of units) {
      if (u.status === "Available") c.available++;
      else if (u.status === "On Hold") c.hold++;
      else if (u.status === "Booked") c.booked++;
      else if (u.status === "Sold") c.sold++;
    }
    return c;
  }, [units]);

  // group by floor
  const grouped = useMemo(() => {
    const map: Record<string, Unit[]> = {};
    units.forEach((u) => {
      if (!map[u.floor]) map[u.floor] = [];
      map[u.floor].push(u);
    });
    return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [units]);

  return (
    <main className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header with Logo + Branding */}
        <header className="flex justify-center">
          <div className="flex items-center gap-3 -ml-10">
            <Image
              src="/logo.png"
              alt="Lumena Logo"
              width={70}
              height={70}
              priority
            />
            <div className="text-center">
              <h1
                className="text-4xl sm:text-6xl font-bold"
                style={{ fontFamily: "OptimaProBoldItalic", color: "#0A073E" }}
              >
                Lumena
              </h1>
              <p
                className="text-xl sm:text-2xl"
                style={{ fontFamily: "OptimaProMedium", color: "#0A073E" }}
              >
                by Omniyat
              </p>
            </div>
          </div>
        </header>

        {/* Counters */}
        <section className="flex justify-center">
          <div className="flex flex-wrap justify-center divide-x divide-gray-200 bg-white shadow-md rounded-2xl px-2 sm:px-8 py-4 max-w-full">
            <div className="px-3 sm:px-6 text-center">
              <p className="text-xs sm:text-sm text-gray-500">Total</p>
              <p className="text-xl sm:text-3xl font-semibold">{counts.total}</p>
            </div>
            <div className="px-3 sm:px-6 text-center">
              <p className="text-xs sm:text-sm text-gray-500">Available</p>
              <p className="text-xl sm:text-3xl font-semibold text-green-600">
                {counts.available}
              </p>
            </div>
            <div className="px-3 sm:px-6 text-center">
              <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                On Hold
              </p>
              <p className="text-xl sm:text-3xl font-semibold text-amber-600">
                {counts.hold}
              </p>
            </div>
            <div className="px-3 sm:px-6 text-center">
              <p className="text-xs sm:text-sm text-gray-500">Booked</p>
              <p className="text-xl sm:text-3xl font-semibold text-blue-600">
                {counts.booked}
              </p>
            </div>
            <div className="px-3 sm:px-6 text-center">
              <p className="text-xs sm:text-sm text-gray-500">Sold</p>
              <p className="text-xl sm:text-3xl font-semibold text-red-600">
                {counts.sold}
              </p>
            </div>
          </div>
        </section>

        {loading && <p className="text-center text-gray-500">Loading…</p>}
{/* Floors */}
<section className="space-y-10">
  {grouped.map(([floor, floorUnits]) => (
    <div key={floor} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 text-center">
        Floor {floor}
      </h2>
      {/* ✅ Wrapper flex keeps everything centered */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 lg:gap-5 place-items-center">
          {floorUnits.map((u) => {
            const colors = statusColors(u.status);
            const clickable =
              u.status === "Available" || u.status === "On Hold";
            return (
              <div
                key={u.unit}
                onClick={() => (clickable ? setSelected(u) : null)}
                className={`relative w-28 sm:w-32 h-20 flex items-center justify-center bg-white rounded-xl shadow border-2 ${colors.border} ${
                  clickable ? "cursor-pointer hover:shadow-lg" : ""
                }`}
              >
                <span
                  className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${colors.badge} whitespace-nowrap`}
                >
                  {u.status}
                </span>
                <span className="text-sm sm:text-lg font-semibold">
                  Unit {u.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ))}
</section>


        {/* Modal */}
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Unit {selected.unit}</h3>
                <button onClick={() => setSelected(null)}>✕</button>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Type:</span> {selected.type}
                </p>
                <p>
                  <span className="text-gray-500">Area:</span> {selected.area} sqft
                </p>
                <p>
                  <span className="text-gray-500">Parking:</span> {selected.parking}
                </p>
                <p>
                  <span className="text-gray-500">Status:</span> {selected.status}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
