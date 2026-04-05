import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Reliability Dashboard",
  description: "Monitor public API health, latency, and uptime status."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
