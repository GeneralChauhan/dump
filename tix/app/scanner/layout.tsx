import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ticket Scanner | EventHub Staff",
  description: "Staff ticket scanner for event entry",
}

export default function ScannerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-background">{children}</div>
}
