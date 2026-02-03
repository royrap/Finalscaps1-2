"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Users, Wrench, CreditCard, CheckCircle, Settings, BarChart3, Menu, LogOut, Home, Activity } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Service Requests", href: "/admin/requests", icon: Wrench },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Verifications", href: "/admin/verifications", icon: CheckCircle },
  { name: "System Audit", href: "/admin/audit", icon: Activity },
  // { name: "Settings", href: "/admin/settings", icon: Settings },
]

interface UserProfile {
  first_name: string | null
  last_name: string | null
  email: string | null
  user_type: string | null
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, email, user_type')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      setUserProfile(profile)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getUserInitials = () => {
    if (!userProfile) return 'A'
    const firstName = userProfile.first_name || ''
    const lastName = userProfile.last_name || ''
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    if (firstName) return firstName.charAt(0).toUpperCase()
    if (userProfile.email) return userProfile.email.charAt(0).toUpperCase()
    return 'A'
  }

  const getUserDisplayName = () => {
    if (!userProfile) return 'Loading...'
    const firstName = userProfile.first_name || ''
    const lastName = userProfile.last_name || ''
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    if (firstName) return firstName
    if (userProfile.email) return userProfile.email
    return 'Admin'
  }

  const getUserRole = () => {
    if (!userProfile) return 'System Administrator'
    if (userProfile.user_type === 'admin' || userProfile.user_type === 'super_admin') {
      return 'System Administrator'
    }
    return 'User'
  }

  const Sidebar = ({ mobile = false }) => (
    <div className="flex h-full flex-col admin-sidebar">
      <div className="flex h-20 shrink-0 items-center justify-center px-6 admin-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <Wrench className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">RoadAid Admin</h1>
        </div>
      </div>
      <nav className="flex flex-1 flex-col px-4 py-6">
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          <li>
            <ul role="list" className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`admin-nav-item group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium smooth-transition ${
                        isActive 
                          ? "admin-nav-item active text-white shadow-lg" 
                          : "text-gray-700 hover:text-red-700 hover:bg-red-50"
                      }`}
                      onClick={() => mobile && setSidebarOpen(false)}
                    >
                      <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-red-500'}`} />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
          <li className="mt-auto">
            <Button 
              variant="ghost" 
              className="w-full justify-start p-3 rounded-xl hover:bg-red-50 hover:text-red-700 smooth-transition"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3 text-red-500" />
              <span className="font-medium">Sign out</span>
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  )

  return (
    <div className="h-screen flex bg-gradient-to-br from-red-50 via-white to-red-100">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto shadow-2xl">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 border-red-200">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="lg:pl-80 flex flex-col flex-1">
        <div className="sticky top-0 z-40 flex h-18 shrink-0 items-center gap-x-4 border-b border-red-200 glass-effect px-4 shadow-xl sm:gap-x-6 sm:px-6 lg:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden hover:bg-red-50 hover:text-red-700 p-2 rounded-xl smooth-transition"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          </Sheet>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Admin Dashboard
              </h2>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
                  <div className="text-xs text-red-600">{getUserRole()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto admin-gradient">
          <div className="p-6 sm:p-8 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
