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
    { label: "Total", value: 120, color: "text-gray-900" },
    { label: "Available", value: 45, color: "text-green-600" },
    { label: "On Hold", value: 15, color: "text-amber-600" },
    { label: "Booked", value: 20, color: "text-blue-600" },
    { label: "Sold", value: 40, color: "text-red-600" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refresh triggered");
      // Fetch fresh data here
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start p-6">
      {/* Header with Logo + Lumena Text */}
      <div className="flex flex-col items-center mb-8">
        {/* Omniyat Logo */}
        <div className="mb-2">
          <Image
            src="/omniyat-logo.png"
            alt="Omniyat Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Lumena + By Omniyat */}
        <div className="text-center">
          <h1
            className="font-medium"
            style={{
              fontFamily: "Optima, Optima Pro, sans-serif",
              fontSize: "1.75rem",
              letterSpacing: "0.02em",
              fontWeight: 600,
            }}
          >
            Lumena
          </h1>
          <p
            className="mt-1"
            style={{
              fontFamily: "Optima, Optima Pro, sans-serif",
              fontSize: "1.2rem",
              letterSpacing: "0.02em",
            }}
          >
            By Omniyat
          </p>
        </div>
      </div>

      {/* Counters */}
      <div className="flex flex-wrap justify-center gap-6 mb-10">
        {counters.map((counter) => (
          <div
            key={counter.label}
            className="bg-gray-50 rounded-2xl shadow-md p-6 w-40 text-center"
          >
            <p className={`text-3xl font-bold ${counter.color}`}>
              {counter.value}
            </p>
            <p className="text-gray-600 mt-1">{counter.label}</p>
          </div>
        ))}
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="bg-white border rounded-xl shadow-sm p-4 flex items-center justify-center"
          >
            Unit {i + 1}
          </div>
        ))}
      </div>
    </main>
  );
}
