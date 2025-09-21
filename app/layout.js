import "./globals.css"

export const metadata = {
  title: "Lumena by Omniyat",
  description: "Luxury real estate tracker",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
