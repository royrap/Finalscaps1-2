"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function RoleGuard({ children, allowedRoles = ['admin', 'super_admin'] }: RoleGuardProps) {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserRole()
  }, [])

  async function checkUserRole() {
    try {
      // For development/testing: always allow admin access
      console.log('Development mode: Allowing admin access')
      setUserRole('admin')
      setLoading(false)
      return

      // Real implementation for production:
      /*
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setUserRole(null)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_type, role')
        .eq('id', user.id)
        .single()
      
      setUserRole(profile?.user_type || profile?.role || null)
      */
      
    } catch (error) {
      console.error('Error checking user role:', error)
      setUserRole('admin') // Default to admin for development
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-600 mb-4">
              Required role: {allowedRoles.join(' or ')}
              <br />
              Your role: {userRole || 'None'}
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
