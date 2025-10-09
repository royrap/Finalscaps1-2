"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { User, LogOut, Settings, Shield } from "lucide-react"
import Link from "next/link"

interface UserSession {
  id: string
  email: string
  first_name?: string
  last_name?: string
  user_type?: string
}

export default function UserStatus() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await getCurrentUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const getCurrentUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, user_type')
          .eq('id', authUser.id)
          .single()

        setUser({
          id: authUser.id,
          email: authUser.email || '',
          ...profile
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error getting user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link href="/login">
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Login
          </Button>
        </Link>
      </div>
    )
  }

  const isAdmin = user.user_type === 'admin' || user.user_type === 'super_admin'

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg">
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">
          {user.first_name} {user.last_name}
        </span>
        {isAdmin && (
          <Shield className="h-3 w-3 text-blue-600" />
        )}
      </div>
      
      {isAdmin && (
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Admin
          </Button>
        </Link>
      )}
      
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
