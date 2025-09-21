"use client";
import { useEffect, useMemo, useState } from "react";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWv3b8HTs_2dVSAul-NwDABv3cIlDgYJBFKcdoWNpXS7N9WX42Fs3QEsWcyimgF-8K5NoD2SUyR41V/pub?output=csv";

export default function Page() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchCSV() {
    try {
      const res = await fetch(CSV_URL, { cache: "no-store" });
      const text = await res.text();

      // very simple CSV parser (fits our sheet shape)
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());
      const data = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        const obj = Object.fromEntries(headers.map((h, i) => [h, cols[i] || ""]));
        // normalize
        let status = (obj.status || "").trim();
        if (status.toLowerCase() === "booked") status = "Sold"; // treat booked as sold
        let floor = obj.floor?.trim();
        if (!floor && obj.unit) {
          const n = parseInt(obj.unit, 10);
          if (!Number.isNaN(n)) floor = String(Math.floor(n / 100));
        }
        return { ...obj, status, floor };
      });

      setRows(data.filter((r) => r.unit));
    } catch (e) {
      console.error("CSV fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCSV();                     // initial load
    const id = setInterval(fetchCSV, 30_000); // auto-refresh every 30s
    return () => clearInterval(id);
  }, []);

  const colors = {
    Available: "bg-green-500 text-white",
    "On Hold": "bg-amber-500 text-black",
    Sold: "bg-red-600 text-white",
  };

  // counters
  const counts = useMemo(() => {
    const c = { Available: 0, "On Hold": 0, Booked: 0, Sold: 0 };
    for (const r of rows) {
      const s = (r.status || "").trim();
      if (s === "Available") c.Available++;
      else if (s === "On Hold") c["On Hold"]++;
      else if (s === "Sold") c.Sold++;
      else if (s === "Booked") c.Booked++; // should be zero since we convert, but kept for display
    }
    return c;
  }, [rows]);

  // group by floor (top → bottom)
  const grouped = useMemo(() => {
    const g = {};
    for (const r of rows) {
      const key = r.floor || "Unknown";
      if (!g[key]) g[key] = [];
      g[key].push(r);
    }
    return Object.fromEntries(
      Object.entries(g).sort(
        ([a], [b]) => (Number(b) || 0) - (Number(a) || 0)
      )
    );
  }, [rows]);

  return (
    <main className="min-h-screen bg-[#FAF9F6] p-6">
      {/* Header */}
      <h1 className="text-4xl font-extrabold text-center mb-6 flex items-center justify-center gap-2 text-[#0A073E]">
        🏢 Lumena by Omniyat
      </h1>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
        {[
          ["Available", counts.Available, "text-green-600"],
          ["On Hold", counts["On Hold"], "text-amber-600"],
          ["Booked", counts.Booked, "text-blue-600"],
          ["Sold", counts.Sold, "text-red-600"],
        ].map(([label, val, tint]) => (
          <div key={label} className="bg-white rounded-2xl shadow p-5 text-center">
            <div className={`text-3xl font-bold ${tint}`}>{val}</div>
            <div className="text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-8 text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span> Available
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span> On Hold
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span> Booked
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600"></span> Sold
        </span>
      </div>

      {/* Floors / Building */}
      <div className="space-y-8 max-w-5xl mx-auto">
        {loading && <div className="text-center text-gray-500">Loading…</div>}

        {Object.entries(grouped).map(([floor, units]) => (
          <section
            key={floor}
            className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-[#0A073E]">
                Floor {floor}
              </h2>
              <div className="text-sm text-gray-500">{units.length} unit{units.length > 1 ? "s" : ""}</div>
            </div>

            {/* Center the units; row adapts to 1/2/3/4+ */}
            <div className="flex justify-center gap-4 flex-wrap">
              {units.map((u, i) => {
                const status = (u.status || "").trim();
                const isLocked = status === "Sold" || status === "Booked";
                const color =
                  status === "Available"
                    ? colors.Available
                    : status === "On Hold"
                    ? colors["On Hold"]
                    : colors.Sold; // Sold/Booked

                return (
                  <button
                    key={`${u.unit}-${i}`}
                    type="button"
                    disabled={isLocked}
                    onClick={() => !isLocked && setSelected(u)}
                    className={`w-28 h-20 rounded-xl shadow text-center px-3 py-2 font-semibold
                      ${color}
                      ${isLocked ? "opacity-75 cursor-not-allowed" : "hover:scale-105 transition"}
                    `}
                  >
                    <div className="leading-tight">
                      <div className="text-sm">Unit {u.unit}</div>
                      <div className="text-xs font-normal mt-1">
                        {status}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Details modal (only for Available / On Hold) */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4 text-[#0A073E]">
              Unit {selected.unit}
            </h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Floor:</strong> {selected.floor}</p>
              <p><strong>Type:</strong> {selected.type}</p>
              <p><strong>Area:</strong> {selected.area} sq.ft.</p>
              <p><strong>Parking:</strong> {selected.parking}</p>
              <p><strong>Status:</strong> {selected.status}</p>
            </div>
            <button
              className="mt-6 w-full py-2 bg-[#0A073E] text-white rounded-lg hover:bg-[#2a255c] transition"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
