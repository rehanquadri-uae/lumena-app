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

  useEffect(() => {
    async function fetchData() {
      try {
        const sheetId = "1iU0hB0vjj9B7qbf5Niu_YqsdfBrn0CaFd4HLjkS-_tI"; // your sheet ID
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

        const res = await fetch(url);
        const text = await res.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;

        let available = 0,
          onHold = 0,
          booked = 0,
          sold = 0;

        const units: Unit[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows.forEach((row: any, index: number) => {
          const name = row.c[0]?.v; // Unit name in column A
          const status = row.c[1]?.v; // Status in column B
          const floor = parseInt(row.c[2]?.v); // Floor number in column C

          if (!name || !status || isNaN(floor)) return;

          if (status === "Available") available++;
          if (status === "On Hold") onHold++;
          if (status === "Booked") booked++;
          if (status === "Sold") sold++;

          units.push({
            id: index,
            name,
            status,
            floor,
          });
        });

        const total = available + onHold + booked + sold;

        // Group units by floor
        const grouped: Floor[] = [];
        units.forEach((unit) => {
          let floorGroup = grouped.find((f) => f.number === unit.floor);
          if (!floorGroup) {
            floorGroup = { number: unit.floor, units: [] };
            grouped.push(floorGroup);
          }
          floorGroup.units.push(unit);
        });

        setStats({ total, available, onHold, booked, sold });
        setFloors(grouped.sort((a, b) => a.number - b.number));
      } catch (err) {
        console.error("Error fetching sheet data:", err);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      {/* Logo */}
      <div className="mb-6">
        <img
          src="/logo.png"
          alt="Lumena Logo"
          className="w-24 h-24 object-contain mx-auto"
        />
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
            <h2 className="text-lg font-semibold mb-4 text-center">
              Floor {floor.number}
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
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
