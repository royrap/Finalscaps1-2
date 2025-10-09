"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, UserPlus, LogOut, User, Settings } from "lucide-react"
import RoleGuard from "@/components/RoleGuard"
import AdminNavigation from "@/components/AdminNavigation"

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  user_type: string
  status: string
  created_at: string
  last_login_at: string | null
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Add user form state
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    user_type: "customer",
    phone_number: ""
  })

  useEffect(() => {
    getCurrentUser()
    fetchUsers()
  }, [])

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setCurrentUser({ ...user, ...profile })
      }
    } catch (error) {
      console.error('Error getting current user:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) {
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            user_type: newUser.user_type,
            phone_number: newUser.phone_number,
            status: 'active'
          })

        if (profileError) throw profileError

        setSuccess(`User ${newUser.first_name} ${newUser.last_name} created successfully!`)
        setNewUser({
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          user_type: "customer",
          phone_number: ""
        })
        setAddUserOpen(false)
        fetchUsers()
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error

      setSuccess('User deleted successfully')
      fetchUsers()
    } catch (error: any) {
      setError(error.message || 'Failed to delete user')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'super_admin': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-red-100 text-red-800'
      case 'talyer_owner': return 'bg-blue-100 text-blue-800'
      case 'mechanic': return 'bg-green-100 text-green-800'
      case 'customer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['admin', 'super_admin']}>
      <AdminNavigation />
      <div className="p-8 space-y-6">
        {/* Header with current user info */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600">Manage system users and their permissions</p>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {currentUser.first_name} {currentUser.last_name}
                </span>
                <Badge className={getUserTypeColor(currentUser.user_type)}>
                  {currentUser.user_type}
                </Badge>
              </div>
            )}
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
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

        {/* Add User Button */}
        <div className="flex justify-between items-center">
          <Badge variant="outline">
            {users.length} total users
          </Badge>
          <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User Manually
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with specified role and permissions
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={newUser.phone_number}
                    onChange={(e) => setNewUser({...newUser, phone_number: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="user_type">User Type</Label>
                  <Select
                    value={newUser.user_type}
                    onValueChange={(value) => setNewUser({...newUser, user_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">
                        <div className="flex flex-col">
                          <span>Customer</span>
                          <span className="text-xs text-gray-500">Regular users who request services</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mechanic">
                        <div className="flex flex-col">
                          <span>Mechanic</span>
                          <span className="text-xs text-gray-500">Individual service providers</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="talyer_owner">
                        <div className="flex flex-col">
                          <span>Shop Owner (Talyer Owner)</span>
                          <span className="text-xs text-gray-500">Business owners who manage shops and mechanics</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex flex-col">
                          <span>Admin</span>
                          <span className="text-xs text-gray-500">System administrators with limited permissions</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="super_admin">
                        <div className="flex flex-col">
                          <span>Super Admin</span>
                          <span className="text-xs text-gray-500">Full system access and control</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* User Type Description */}
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">User Type Permissions:</h4>
                    {newUser.user_type === 'customer' && (
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Book auto repair services</li>
                        <li>• Track service requests</li>
                        <li>• Rate and review providers</li>
                        <li>• Manage payment methods</li>
                      </ul>
                    )}
                    {newUser.user_type === 'mechanic' && (
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Accept and complete service requests</li>
                        <li>• Set availability and service areas</li>
                        <li>• Generate invoices and receive payments</li>
                        <li>• Build customer relationships</li>
                      </ul>
                    )}
                    {newUser.user_type === 'talyer_owner' && (
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Manage shop operations and staff</li>
                        <li>• Oversee multiple mechanics</li>
                        <li>• Handle business verifications</li>
                        <li>• Access shop analytics and reports</li>
                      </ul>
                    )}
                    {newUser.user_type === 'admin' && (
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Monitor system operations</li>
                        <li>• Handle customer support</li>
                        <li>• Manage user accounts</li>
                        <li>• Process verifications</li>
                      </ul>
                    )}
                    {newUser.user_type === 'super_admin' && (
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Full system administration</li>
                        <li>• Configure app settings</li>
                        <li>• Manage all user types</li>
                        <li>• Access financial data and analytics</li>
                        <li>• System maintenance and updates</li>
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setAddUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create User
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>User Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getUserTypeColor(user.user_type)}>
                          {user.user_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.last_login_at 
                          ? new Date(user.last_login_at).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
