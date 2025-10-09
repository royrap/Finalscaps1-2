"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  user_type: string
  status: string
  address: string
  date_of_birth: string
  emergency_contact: string
  emergency_phone: string
  created_at: string
  updated_at: string
}

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      setUser(data)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch user details')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setUser(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          user_type: user.user_type,
          status: user.status,
          address: user.address,
          date_of_birth: user.date_of_birth,
          emergency_contact: user.emergency_contact,
          emergency_phone: user.emergency_phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      setSuccess("User profile updated successfully!")
      
      // Redirect back to users page after 2 seconds
      setTimeout(() => {
        router.push('/admin/users')
      }, 2000)

    } catch (error: any) {
      setError(error.message || 'Failed to update user profile')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'super_admin': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'talyer_owner': return 'bg-orange-100 text-orange-800'
      case 'mechanic': return 'bg-green-100 text-green-800'
      case 'customer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/admin/users')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Loading User...
          </h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/admin/users')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-red-600">User Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">The requested user could not be found.</p>
            <Button onClick={() => router.push('/admin/users')} className="mt-4">
              Back to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/admin/users')} className="p-2 hover:bg-red-50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Edit User Profile
            </h1>
            <p className="text-gray-600 mt-1">Update user information and permissions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getUserTypeColor(user.user_type)} variant="secondary">
            {user.user_type.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getStatusColor(user.status)} variant="secondary">
            {user.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* User Info Summary */}
      <Card className="admin-card border-red-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">
                {user.first_name} {user.last_name}
              </CardTitle>
              <CardDescription className="text-gray-600 flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </span>
                {user.phone && (
                  <span className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-red-600" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={user.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={user.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed from admin panel</p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={user.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={user.date_of_birth || ''}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={user.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span>Account Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userType">User Type</Label>
              <Select
                value={user.user_type}
                onValueChange={(value) => handleInputChange('user_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="mechanic">Mechanic</SelectItem>
                  <SelectItem value="talyer_owner">Shop Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Account Status</Label>
              <Select
                value={user.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Emergency Contact */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Emergency Contact</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="emergencyContact">Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={user.emergency_contact || ''}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="Emergency contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={user.emergency_phone || ''}
                    onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Account Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Updated: {new Date(user.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/users')}
          className="px-6"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="admin-button px-6"
        >
          {saving ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}