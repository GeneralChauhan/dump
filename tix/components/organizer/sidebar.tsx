"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  Building2,
  ScanLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { Organization } from "@/lib/types"

const navigation = [
  { name: "Dashboard", href: "/organizer", icon: LayoutDashboard },
  { name: "Events", href: "/organizer/events", icon: Calendar },
  { name: "Orders", href: "/organizer/orders", icon: Ticket },
  { name: "Attendees", href: "/organizer/attendees", icon: Users },
  { name: "Analytics", href: "/organizer/analytics", icon: BarChart3 },
  { name: "Staff", href: "/organizer/staff", icon: ScanLine },
  { name: "Settings", href: "/organizer/settings", icon: Settings },
]

interface OrganizerSidebarProps {
  organization: Organization
}

export function OrganizerSidebar({ organization }: OrganizerSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-border px-4", collapsed && "justify-center")}>
        {!collapsed && (
          <Link href="/organizer" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold truncate">{organization.name}</span>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/organizer" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Help link */}
      <div className="border-t border-border p-3">
        <Link
          href="/help"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Help & Support</span>}
        </Link>

        {/* Back to main site */}
        <Link
          href="/"
          className={cn(
            "mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
        >
          <ChevronLeft className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
      </div>

      {/* Collapse button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm"
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
      </Button>
    </aside>
  )
}
