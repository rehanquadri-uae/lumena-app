"use client";
import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function Home() {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Fetch CSV every 30s
  useEffect(() => {
    const fetchCSV = async () => {
      const response = await fetch(
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWv3b8HTs_2dVSAul-NwDABv3cIlDgYJBFKcdoWNpXS7N9WX42Fs3QEsWcyimgF-8K5NoD2SUyR41V/pub?output=csv",
        { cache: "no-store" }
      );
      const text = await response.text();
      const result = Papa.parse(text, { header: true });
      setUnits(result.data);
    };

    fetchCSV();
    const interval = setInterval(fetchCSV, 30000);
    return () => clearInterval(interval);
  }, []);

  // Group by floor
  const groupedByFloor = units.reduce((acc, unit) => {
    const floor = unit.floor;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(unit);
    return acc;
  }, {});

  // Counters
  const counts = {
    available: units.filter((u) => u.status?.toLowerCase() === "available").length,
    onHold: units.filter((u) => u.status?.toLowerCase() === "on hold").length,
    booked: units.filter((u) => u.status?.toLowerCase() === "booked").length,
    sold: units.filter((u) => ["sold", "booked"].includes(u.status?.toLowerCase())).length,
  };

  // Status colors
  const statusColor = {
    available: "bg-green-500 text-white",
    "on hold": "bg-amber-500 text-white",
    booked: "bg-blue-500 text-white",
    sold: "bg-red-500 text-white",
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
        🏢 Lumena by Omniyat
      </h1>

      {/* Counters */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{counts.available}</p>
          <p>Available</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{counts.onHold}</p>
          <p>On Hold</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{counts.booked}</p>
          <p>Booked</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{counts.sold}</p>
          <p>Sold</p>
        </div>
      </div>

      {/* Floors */}
      <div className="space-y-10">
        {Object.keys(groupedByFloor)
          .sort((a, b) => b - a)
          .map((floor) => (
            <div key={floor} className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Floor {floor}</h2>
              <div className="grid grid-cols-4 gap-4">
                {groupedByFloor[floor].map((unit, idx) => {
                  const status = unit.status?.toLowerCase() || "available";
                  const isClickable = status === "available" || status === "on hold";

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg shadow text-center font-semibold cursor-pointer transition transform hover:scale-105 ${statusColor[status]}`}
                      onClick={() => isClickable && setSelectedUnit(unit)}
                    >
                      Unit {unit.unit}
                      <p className="text-sm">{unit.status}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Modal for unit details */}
      {selectedUnit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-bold mb-4">
              Unit {selectedUnit.unit} Details
            </h3>
            <p>Floor: {selectedUnit.floor}</p>
            <p>Type: {selectedUnit.type}</p>
            <p>Area: {selectedUnit.area} sqft</p>
            <p>Parking: {selectedUnit.parking}</p>
            <p>Status: {selectedUnit.status}</p>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setSelectedUnit(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
