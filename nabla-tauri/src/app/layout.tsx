import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nabla Simulator",
  description: "A fast rocket flight simulator ported from miniQuabla to Rust",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
