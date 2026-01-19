import type React from "react"

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layout without auth check - auth will be handled in individual pages
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">{children}</main>
    </div>
  )
}

