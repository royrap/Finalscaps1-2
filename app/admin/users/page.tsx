"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Search, MoreHorizontal, Eye, Ban, CheckCircle, Plus, User, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  user_type: string
  status: string
  created_at: string
  last_login_at: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [addingUser, setAddingUser] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetailDialog, setShowUserDetailDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ userId: string; action: string } | null>(null)
  
  // New user form state
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    user_type: "customer"
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Fetch all users without limit
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching users:", error)
        // If error, set empty array
        setUsers([])
      } else {
        console.log(`Loaded ${data?.length || 0} users`)
        setUsers(data || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      // Prepare update data
      const updateData: any = { 
        status: newStatus,
        account_status: newStatus === 'suspended' ? 'suspended' : 'active'
      }

      // If suspending, lock the account for 30 days
      if (newStatus === 'suspended') {
        const lockUntil = new Date()
        lockUntil.setDate(lockUntil.getDate() + 30) // Lock for 30 days
        updateData.account_locked_until = lockUntil.toISOString()
        updateData.failed_login_attempts = 0 // Reset login attempts
      } else if (newStatus === 'active') {
        // If activating, clear the lock
        updateData.account_locked_until = null
        updateData.failed_login_attempts = 0
      }

      const { error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("id", userId)

      if (error) throw error

      // Show success message
      const action = newStatus === 'suspended' ? 'suspended and locked for 30 days' : 'activated'
      setSuccess(`User ${action} successfully!`)
      setTimeout(() => setSuccess(""), 3000)

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
      
      // Refresh the users list
      fetchUsers()
    } catch (error: any) {
      console.error("Error updating user status:", error)
      setError(`Failed to update user status: ${error.message}`)
      setTimeout(() => setError(""), 5000)
    }
  }

  const handleStatusChange = (userId: string, newStatus: string) => {
    setPendingAction({ userId, action: newStatus })
    setShowConfirmDialog(true)
  }

  const confirmStatusChange = async () => {
    if (pendingAction) {
      await updateUserStatus(pendingAction.userId, pendingAction.action)
      setShowConfirmDialog(false)
      setPendingAction(null)
    }
  }

  const addUser = async () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password || !newUser.phone_number) {
      setError("Please fill in all required fields")
      return
    }

    if (newUser.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setAddingUser(true)
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            phone_number: newUser.phone_number,
            user_type: newUser.user_type
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create the user profile
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            id: authData.user.id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            phone_number: newUser.phone_number,
            user_type: newUser.user_type,
            status: "active", // Default to active
            created_at: new Date().toISOString()
          })

        if (profileError) throw profileError

        setSuccess("User created successfully!")
        setShowAddUserDialog(false)
        setNewUser({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          phone_number: "",
          user_type: "customer"
        })
        
        // Refresh users list
        fetchUsers()
        
        // Auto-clear success message
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error: any) {
      setError(error.message)
      // Auto-clear error message
      setTimeout(() => setError(""), 5000)
    } finally {
      setAddingUser(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || user.user_type === filterType
    const matchesStatus = filterStatus === "all" || user.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "customer":
        return "bg-blue-100 text-blue-800"
      case "mechanic":
        return "bg-green-100 text-green-800"
      case "talyer_owner":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-orange-100 text-orange-800"
      case "super_admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "suspended":
        return "bg-yellow-100 text-yellow-800"
      case "banned":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-lg text-gray-600">Manage all users in the RoadAid system</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2 border-blue-300 bg-blue-50 text-blue-700 rounded-full">
            <User className="h-4 w-4 mr-2" />
            {filteredUsers.length} of {users.length} users
          </Badge>
          <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
            <DialogTrigger asChild>
              <Button className="admin-button px-6 py-3 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl">
                <Plus className="h-5 w-5 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account manually
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Enter password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={newUser.phone_number}
                    onChange={(e) => setNewUser({...newUser, phone_number: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user_type">User Type *</Label>
                  <Select value={newUser.user_type} onValueChange={(value) => setNewUser({...newUser, user_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="mechanic">Mechanic</SelectItem>
                      <SelectItem value="talyer_owner">Talyer Owner (Shop Owner)</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addUser} disabled={addingUser}>
                    {addingUser ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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

      <Card className="admin-card">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">User Management</CardTitle>
              <CardDescription className="text-gray-600">Manage all users in the RoadAid system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="mechanic">Mechanic</SelectItem>
                <SelectItem value="talyer_owner">Talyer Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone_number}</TableCell>
                    <TableCell>
                      <Badge className={getUserTypeColor(user.user_type)}>{user.user_type.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user)
                            setShowUserDetailDialog(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {user.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, "suspended")}
                              className="text-yellow-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend & Lock User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, "active")}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No users found matching your criteria</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={showUserDetailDialog} onOpenChange={setShowUserDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Full Name</Label>
                  <p className="text-lg">{selectedUser.first_name} {selectedUser.last_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">User Type</Label>
                  <Badge className={getUserTypeColor(selectedUser.user_type)}>
                    {selectedUser.user_type.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Email</Label>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Phone</Label>
                  <p>{selectedUser.phone_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <Badge className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Member Since</Label>
                  <p>{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-semibold">User ID</Label>
                  <p className="font-mono text-sm">{selectedUser.id}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowUserDetailDialog(false)}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => {
                  window.location.href = `/admin/users/${selectedUser.id}/edit`
                }}>
                  <User className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
                {selectedUser.status === "active" ? (
                  <Button variant="destructive" onClick={() => {
                    handleStatusChange(selectedUser.id, "suspended")
                    setShowUserDetailDialog(false)
                  }}>
                    <Ban className="h-4 w-4 mr-2" />
                    Suspend & Lock User
                  </Button>
                ) : (
                  <Button onClick={() => {
                    handleStatusChange(selectedUser.id, "active")
                    setShowUserDetailDialog(false)
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate User
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Status Change */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {pendingAction?.action === "suspended" 
                ? "Are you sure you want to suspend and lock this user? The account will be locked for 30 days."
                : "Are you sure you want to activate this user? This will unlock their account."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {pendingAction?.action === "suspended" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  The user will be unable to log in for 30 days. Their account_locked_until will be set.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowConfirmDialog(false)
                setPendingAction(null)
              }}>
                Cancel
              </Button>
              <Button 
                variant={pendingAction?.action === "suspended" ? "destructive" : "default"}
                onClick={confirmStatusChange}
              >
                {pendingAction?.action === "suspended" ? "Suspend & Lock" : "Activate"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
