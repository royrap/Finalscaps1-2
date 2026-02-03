"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const adminRoutes = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/verifications", label: "Verifications" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/settings", label: "Settings" },
]

export default function AdminNavigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8 h-16 overflow-x-auto">
          {adminRoutes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button
                variant={pathname === route.href ? "default" : "ghost"}
                className={cn(
                  "whitespace-nowrap",
                  pathname === route.href && "bg-blue-600 text-white"
                )}
              >
                {route.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
