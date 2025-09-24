"use client";

import { useEffect, useState } from "react";

type Unit = {
  id: number;
  name: string;
  status: "Available" | "On Hold" | "Booked" | "Sold";
  floor: number;
};

type Floor = {
  number: number;
  units: Unit[];
};

export default function Home() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    onHold: 0,
    booked: 0,
    sold: 0,
  });

  // Mock fetch — replace with Supabase later
  useEffect(() => {
    const data: Unit[] = [
      { id: 1, name: "Unit 301", status: "Sold", floor: 3 },
      { id: 2, name: "Unit 302", status: "Sold", floor: 3 },
      { id: 3, name: "Unit 401", status: "Sold", floor: 4 },
      { id: 4, name: "Unit 402", status: "Sold", floor: 4 },
      { id: 5, name: "Unit 403", status: "Available", floor: 4 },
      { id: 6, name: "Unit 501", status: "Available", floor: 5 },
      { id: 7, name: "Unit 502", status: "On Hold", floor: 5 },
      { id: 8, name: "Unit 503", status: "Booked", floor: 5 },
    ];

    // Group by floor
    const grouped: Floor[] = [];
    data.forEach((unit) => {
      let floor = grouped.find((f) => f.number === unit.floor);
      if (!floor) {
        floor = { number: unit.floor, units: [] };
        grouped.push(floor);
      }
      floor.units.push(unit);
    });

    setFloors(grouped.sort((a, b) => a.number - b.number));

    // Stats
    setStats({
      total: data.length,
      available: data.filter((u) => u.status === "Available").length,
      onHold: data.filter((u) => u.status === "On Hold").length,
      booked: data.filter((u) => u.status === "Booked").length,
      sold: data.filter((u) => u.status === "Sold").length,
    });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      {/* Branding Row */}
      <div className="w-full max-w-2xl flex items-center justify-center mb-8">
        {/* Logo on Left */}
        <img
          src="/omniyat-logo.png"
          alt="Omniyat Logo"
          className="w-16 h-16 object-contain mr-4"
        />

        {/* Text */}
        <div className="leading-tight">
          <div
            className="text-3xl font-bold"
            style={{ fontFamily: "Optima, sans-serif" }}
          >
            Lumena
          </div>
          <div
            className="text-lg font-normal tracking-wide"
            style={{ fontFamily: "Optima, sans-serif" }}
          >
            By Omniyat
          </div>
        </div>
      </div>

      {/* Counters Row */}
      <div className="grid grid-cols-5 gap-2 sm:gap-4 w-full max-w-2xl mx-auto text-center bg-white shadow-md rounded-2xl py-4 px-2 mb-10">
        <div>
          <div className="text-sm font-medium">Total</div>
          <div className="text-lg font-bold">{stats.total}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-green-600">Available</div>
          <div className="text-lg font-bold text-green-600">
            {stats.available}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-amber-600">On Hold</div>
          <div className="text-lg font-bold text-amber-600">{stats.onHold}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-blue-600">Booked</div>
          <div className="text-lg font-bold text-blue-600">{stats.booked}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-red-600">Sold</div>
          <div className="text-lg font-bold text-red-600">{stats.sold}</div>
        </div>
      </div>

      {/* Floors & Units */}
      <div className="w-full max-w-6xl">
        {floors.map((floor) => (
          <div key={floor.number} className="mb-10">
            {/* Floor Heading */}
            <h2 className="text-lg font-semibold mb-4 text-center">
              Floor {floor.number}
            </h2>

            {/* Units Row */}
            <div className="flex flex-nowrap gap-4 overflow-x-auto scrollbar-hide px-2">
              {floor.units.map((unit) => (
                <div
                  key={unit.id}
                  className={`border-2 rounded-xl px-6 py-6 text-center relative shadow-sm min-w-[140px] ${
                    unit.status === "Available"
                      ? "border-green-500"
                      : unit.status === "On Hold"
                      ? "border-amber-500"
                      : unit.status === "Booked"
                      ? "border-blue-500"
                      : "border-red-500"
                  }`}
                >
                  {/* Status Badge */}
                  <span
                    className={`absolute top-1 right-1 text-xs px-2 py-1 rounded-full text-white ${
                      unit.status === "Available"
                        ? "bg-green-500"
                        : unit.status === "On Hold"
                        ? "bg-amber-500"
                        : unit.status === "Booked"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                  >
                    {unit.status}
                  </span>

                  {/* Unit Number */}
                  <div className="font-semibold">{unit.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
