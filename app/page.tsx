"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Counter {
  label: string;
  value: number;
  color: string;
}

export default function Page() {
  const [counters, setCounters] = useState<Counter[]>([
    { label: "Total", value: 0, color: "text-gray-900" },
    { label: "Available", value: 0, color: "text-green-600" },
    { label: "On Hold", value: 0, color: "text-amber-600" },
    { label: "Booked", value: 0, color: "text-blue-600" },
    { label: "Sold", value: 0, color: "text-red-600" },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const sheetId = "1iU0hB0vjj9B7qbf5Niu_YqsdfBrn0CaFd4HLjkS-_tI"; // <-- replace with your Google Sheet ID
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

        const res = await fetch(url);
        const text = await res.text();

        // Parse JSON-like response from Google Sheets
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;

        let available = 0,
          onHold = 0,
          booked = 0,
          sold = 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows.forEach((row: any) => {
          const status = row.c[1]?.v; // Column 2 = Status
          if (status === "Available") available++;
          if (status === "On Hold") onHold++;
          if (status === "Booked") booked++;
          if (status === "Sold") sold++;
        });

        const total = available + onHold + booked + sold;

        setCounters([
          { label: "Total", value: total, color: "text-gray-900" },
          { label: "Available", value: available, color: "text-green-600" },
          { label: "On Hold", value: onHold, color: "text-amber-600" },
          { label: "Booked", value: booked, color: "text-blue-600" },
          { label: "Sold", value: sold, color: "text-red-600" },
        ]);
      } catch (err) {
        console.error("Error fetching sheet data:", err);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start p-6">
      {/* Header above counters */}
      <div className="w-full max-w-6xl mb-8">
        <div className="flex items-center gap-4 justify-start">
          {/* Omniyat Logo (left) */}
          <Image
            src="/logo.png"
            alt="Omniyat Logo"
            width={120}
            height={40}
            className="object-contain"
          />

          {/* Lumena + By Omniyat (beside logo) */}
          <div className="flex flex-col">
            <h1
              className="font-medium text-black"
              style={{
                fontFamily: "Optima, Optima Pro, sans-serif",
                fontSize: "1.75rem",
                fontWeight: 600,
              }}
            >
              Lumena
            </h1>
            <p
              className="text-black"
              style={{
                fontFamily: "Optima, Optima Pro, sans-serif",
                fontSize: "1.2rem",
              }}
            >
              By Omniyat
            </p>
          </div>
        </div>
      </div>

      {/* Counters (5-column grid, always aligned) */}
      <div className="grid grid-cols-5 gap-4 w-full max-w-4xl mb-10">
        {counters.map((counter) => (
          <div
            key={counter.label}
            className="bg-gray-50 rounded-2xl shadow-md p-6 text-center"
          >
            <p className={`text-3xl font-bold ${counter.color}`}>
              {counter.value}
            </p>
            <p className="text-gray-600 mt-1">{counter.label}</p>
          </div>
        ))}
      </div>

      {/* Units Row (static example for now) */}
      <div className="w-full max-w-6xl overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-white border rounded-xl shadow-sm p-4 flex items-center justify-center w-40"
            >
              Unit {i + 1}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
