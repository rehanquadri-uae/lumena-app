import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lumena App",
  description: "Real-time unit tracker for Lumena by Omniyat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
