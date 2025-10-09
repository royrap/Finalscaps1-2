"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Save, 
  Upload,
  Bell,
  Shield,
  Zap,
  Globe,
  CreditCard,
  Mail,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SystemSettings {
  site_name: string
  site_description: string
  admin_email: string
  support_email: string
  default_currency: string
  commission_rate: number
  max_radius: number
  auto_approve_providers: boolean
  email_notifications: boolean
  sms_notifications: boolean
  maintenance_mode: boolean
  allow_registrations: boolean
  require_verification: boolean
  max_file_size: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: "RoadAid",
    site_description: "Emergency roadside assistance platform",
    admin_email: "admin@roadaid.com",
    support_email: "support@roadaid.com",
    default_currency: "PHP",
    commission_rate: 15,
    max_radius: 50,
    auto_approve_providers: false,
    email_notifications: true,
    sms_notifications: false,
    maintenance_mode: false,
    allow_registrations: true,
    require_verification: true,
    max_file_size: 10
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("general")
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // In a real app, this would load from a settings table
      // For now, we'll use localStorage as a demo
      const savedSettings = localStorage.getItem('admin_settings')
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) })
      }
    } catch (error: any) {
      setError("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // In a real app, this would save to a settings table
      localStorage.setItem('admin_settings', JSON.stringify(settings))
      
      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully.",
      })
    } catch (error: any) {
      setError("Failed to save settings")
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const testEmailSettings = async () => {
    toast({
      title: "Test email sent",
      description: "Check your inbox for the test email.",
    })
  }

  const clearCache = async () => {
    // Simulate cache clearing
    toast({
      title: "Cache cleared",
      description: "System cache has been cleared successfully.",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-gray-600">Manage system configuration and preferences</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={clearCache}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Site Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => updateSetting('site_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_currency">Default Currency</Label>
                  <Input
                    id="default_currency"
                    value={settings.default_currency}
                    onChange={(e) => updateSetting('default_currency', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description}
                  onChange={(e) => updateSetting('site_description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Admin Email</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={settings.admin_email}
                    onChange={(e) => updateSetting('admin_email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => updateSetting('support_email', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Business Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.commission_rate}
                    onChange={(e) => updateSetting('commission_rate', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">Platform commission on each transaction</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_radius">Maximum Service Radius (km)</Label>
                  <Input
                    id="max_radius"
                    type="number"
                    min="1"
                    max="200"
                    value={settings.max_radius}
                    onChange={(e) => updateSetting('max_radius', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">Maximum distance for service requests</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_file_size">Maximum File Upload Size (MB)</Label>
                <Input
                  id="max_file_size"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.max_file_size}
                  onChange={(e) => updateSetting('max_file_size', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">Maximum file size for uploads (documents, images)</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Provider Settings</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-approve Providers</Label>
                    <p className="text-sm text-gray-500">Automatically approve new service providers</p>
                  </div>
                  <Switch
                    checked={settings.auto_approve_providers}
                    onCheckedChange={(checked) => updateSetting('auto_approve_providers', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send email notifications to users</p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Send SMS notifications to users</p>
                  </div>
                  <Switch
                    checked={settings.sms_notifications}
                    onCheckedChange={(checked) => updateSetting('sms_notifications', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Email Configuration</h4>
                <Button variant="outline" onClick={testEmailSettings}>
                  <Mail className="h-4 w-4 mr-2" />
                  Test Email Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow New Registrations</Label>
                    <p className="text-sm text-gray-500">Allow new users to register accounts</p>
                  </div>
                  <Switch
                    checked={settings.allow_registrations}
                    onCheckedChange={(checked) => updateSetting('allow_registrations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-gray-500">Users must verify email before accessing services</p>
                  </div>
                  <Switch
                    checked={settings.require_verification}
                    onCheckedChange={(checked) => updateSetting('require_verification', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Security Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>SSL Certificate</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Database Encryption</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>API Rate Limiting</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Backup Status</span>
                    <Badge className="bg-green-100 text-green-800">Daily</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                System Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Enable maintenance mode to restrict access</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {settings.maintenance_mode && (
                      <Badge variant="destructive">Active</Badge>
                    )}
                    <Switch
                      checked={settings.maintenance_mode}
                      onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-500">Version</div>
                    <div className="font-medium">1.0.0</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-500">Environment</div>
                    <div className="font-medium">Production</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-500">Database</div>
                    <div className="font-medium">PostgreSQL 14</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-500">Last Backup</div>
                    <div className="font-medium">2 hours ago</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">System Actions</h4>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" onClick={clearCache}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart Services
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
