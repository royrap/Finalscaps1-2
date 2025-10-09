"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Settings, DollarSign, Wrench, Users, Activity, FileText, Plus, Edit, Trash } from "lucide-react"

// Fraud Detection Modal
export function FraudDetectionModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-16 flex-col">
          <AlertTriangle className="h-6 w-6 mb-2" />
          <span>Fraud Detection</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <span>Fraud Detection System</span>
          </DialogTitle>
          <DialogDescription>
            Monitor and manage fraud detection rules and alerts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Fraud Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <p className="font-semibold text-red-800">Suspicious Payment Pattern</p>
                  <p className="text-sm text-red-600">Multiple failed payments from same IP</p>
                  <p className="text-xs text-red-500">Detected: 2 hours ago</p>
                </div>
                <Badge variant="destructive">High Risk</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                <div>
                  <p className="font-semibold text-yellow-800">Account Creation Spike</p>
                  <p className="text-sm text-yellow-600">Unusual number of new accounts from same location</p>
                  <p className="text-xs text-yellow-500">Detected: 6 hours ago</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50">
                <div>
                  <p className="font-semibold text-blue-800">Transaction Volume Anomaly</p>
                  <p className="text-sm text-blue-600">Service provider processing unusually high volume</p>
                  <p className="text-xs text-blue-500">Detected: 1 day ago</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Low Risk</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Detection Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detection Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Failed Payment Threshold</p>
                    <p className="text-sm text-gray-600">Alert when &gt;5 failed payments per IP per hour</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Velocity Check</p>
                    <p className="text-sm text-gray-600">Flag accounts with &gt;10 transactions per hour</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Geographic Anomaly</p>
                    <p className="text-sm text-gray-600">Detect unusual geographic patterns</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button className="admin-button">
              Update Rules
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Pricing Rules Modal
export function PricingRulesModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-20 flex-col">
          <DollarSign className="h-6 w-6 mb-2" />
          <span>Pricing Rules</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-red-600" />
            <span>Pricing Rules Management</span>
          </DialogTitle>
          <DialogDescription>
            Configure platform fees, commission rates, and pricing policies
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Pricing Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Platform Commission (%)</Label>
                  <Input type="number" defaultValue="10" />
                </div>
                <div>
                  <Label>Minimum Service Fee (₱)</Label>
                  <Input type="number" defaultValue="50" />
                </div>
                <div>
                  <Label>Maximum Service Fee (₱)</Label>
                  <Input type="number" defaultValue="5000" />
                </div>
                <div>
                  <Label>Payment Processing Fee (%)</Label>
                  <Input type="number" defaultValue="2.5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Categories */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Service Category Rates</CardTitle>
                <Button size="sm" className="admin-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { category: "Engine Repair", rate: "12%", baseFee: "₱100" },
                  { category: "Brake Service", rate: "8%", baseFee: "₱75" },
                  { category: "Oil Change", rate: "5%", baseFee: "₱25" },
                  { category: "Tire Service", rate: "7%", baseFee: "₱50" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p className="text-sm text-gray-600">Commission: {item.rate} | Base Fee: {item.baseFee}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button className="admin-button">
              Save Pricing Rules
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Service Categories Modal
export function ServiceCategoriesModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-20 flex-col">
          <Wrench className="h-6 w-6 mb-2" />
          <span>Service Categories</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-red-600" />
            <span>Service Categories Management</span>
          </DialogTitle>
          <DialogDescription>
            Manage service categories, subcategories, and pricing
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Active Categories</CardTitle>
                <Button className="admin-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Engine Services", subcategories: 8, active: true },
                  { name: "Brake Services", subcategories: 5, active: true },
                  { name: "Electrical", subcategories: 12, active: true },
                  { name: "Body Work", subcategories: 6, active: false }
                ].map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.subcategories} subcategories</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={category.active ? "default" : "secondary"}>
                        {category.active ? "Active" : "Inactive"}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// User Permissions Modal  
export function UserPermissionsModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-20 flex-col">
          <Users className="h-6 w-6 mb-2" />
          <span>User Permissions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-red-600" />
            <span>User Permissions Management</span>
          </DialogTitle>
          <DialogDescription>
            Configure role-based access control and user permissions
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { role: "Super Admin", permissions: ["All System Access", "User Management", "Financial Control", "Settings"] },
                  { role: "Admin", permissions: ["User Management", "Service Requests", "Basic Reports"] },
                  { role: "Shop Owner", permissions: ["Manage Services", "View Bookings", "Payment History"] },
                  { role: "Mechanic", permissions: ["Accept Jobs", "Update Status", "View Profile"] }
                ].map((role, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{role.role}</h3>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission, pIndex) => (
                        <Badge key={pIndex} variant="secondary">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button className="admin-button">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// System Maintenance Modal
export function SystemMaintenanceModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-20 flex-col">
          <Activity className="h-6 w-6 mb-2" />
          <span>System Maintenance</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-red-600" />
            <span>System Maintenance Panel</span>
          </DialogTitle>
          <DialogDescription>
            Monitor system health and perform maintenance tasks
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-green-600">✓ Healthy</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">API Services</p>
                  <p className="text-sm text-green-600">✓ Running</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">File Storage</p>
                  <p className="text-sm text-yellow-600">⚠ 85% Full</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Background Jobs</p>
                  <p className="text-sm text-green-600">✓ Processing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Maintenance Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Clear Application Cache
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Optimize Database
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Clean Temporary Files
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600">
                Restart Services
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Backup & Restore Modal
export function BackupRestoreModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-20 flex-col">
          <FileText className="h-6 w-6 mb-2" />
          <span>Backup & Restore</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-red-600" />
            <span>Backup & Restore System</span>
          </DialogTitle>
          <DialogDescription>
            Manage system backups and restore operations
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create Backup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Backup Type</Label>
                <Select defaultValue="full">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full System Backup</SelectItem>
                    <SelectItem value="database">Database Only</SelectItem>
                    <SelectItem value="files">Files Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="admin-button">
                Create Backup Now
              </Button>
            </CardContent>
          </Card>

          {/* Recent Backups */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Backups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "2025-01-01 02:00", type: "Full", size: "2.3 GB", status: "Complete" },
                  { date: "2024-12-31 02:00", type: "Full", size: "2.1 GB", status: "Complete" },
                  { date: "2024-12-30 14:30", type: "Database", size: "450 MB", status: "Complete" }
                ].map((backup, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{backup.date}</p>
                      <p className="text-sm text-gray-600">{backup.type} - {backup.size}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="default">{backup.status}</Badge>
                      <Button size="sm" variant="outline">
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}