import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tume ya Utumishi Serikalini — Zanzibar",
    template: "%s | Tume ya Utumishi Serikalini",
  },
  description:
    "Official website of the Civil Service Commission (Tume ya Utumishi Serikalini) — Zanzibar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}