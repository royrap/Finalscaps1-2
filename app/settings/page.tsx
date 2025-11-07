"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, Settings2, Bell, Shield, CreditCard, Globe, Database, RefreshCw } from "lucide-react"
import RoleGuard from "@/components/RoleGuard"
import AdminNavigation from "@/components/AdminNavigation"

interface AppSetting {
  id: string
  key: string
  value: string
  description: string
  is_public: boolean
  created_at: string
  updated_at: string
}

interface SettingsForm {
  app_name: string
  app_description: string
  contact_email: string
  contact_phone: string
  platform_fee_percentage: string
  max_service_radius: string
  default_service_duration: string
  maintenance_mode: boolean
  allow_registrations: boolean
  require_email_verification: boolean
  enable_notifications: boolean
  enable_sms: boolean
  payment_gateway: string
  currency: string
  timezone: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [form, setForm] = useState<SettingsForm>({
    app_name: "TalyerOTG",
    app_description: "On-demand auto repair services",
    contact_email: "support@talyerotg.com",
    contact_phone: "+63 917 123 4567",
    platform_fee_percentage: "10",
    max_service_radius: "50",
    default_service_duration: "60",
    maintenance_mode: false,
    allow_registrations: true,
    require_email_verification: true,
    enable_notifications: true,
    enable_sms: false,
    payment_gateway: "paymongo",
    currency: "PHP",
    timezone: "Asia/Manila"
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('key')

      if (error) throw error

      setSettings(data || [])
      
      // Populate form with existing settings
      if (data) {
        const settingsMap = data.reduce((acc, setting) => {
          acc[setting.key] = setting.value
          return acc
        }, {} as any)

        setForm(prev => ({
          ...prev,
          ...settingsMap,
          maintenance_mode: settingsMap.maintenance_mode === 'true',
          allow_registrations: settingsMap.allow_registrations === 'true',
          require_email_verification: settingsMap.require_email_verification === 'true',
          enable_notifications: settingsMap.enable_notifications === 'true',
          enable_sms: settingsMap.enable_sms === 'true'
        }))
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      // Convert form data to array of settings
      const settingsToUpdate = Object.entries(form).map(([key, value]) => ({
        key,
        value: value.toString(),
        description: getSettingDescription(key),
        is_public: isPublicSetting(key)
      }))

      // Upsert each setting
      for (const setting of settingsToUpdate) {
        const { error } = await supabase
          .from('app_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            description: setting.description,
            is_public: setting.is_public,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'key'
          })

        if (error) throw error
      }

      setSuccess('Settings saved successfully!')
      fetchSettings()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const getSettingDescription = (key: string): string => {
    const descriptions: { [key: string]: string } = {
      app_name: "Application name displayed to users",
      app_description: "Brief description of the application",
      contact_email: "Main contact email for support",
      contact_phone: "Main contact phone number",
      platform_fee_percentage: "Percentage fee charged on transactions",
      max_service_radius: "Maximum service radius in kilometers",
      default_service_duration: "Default service duration in minutes",
      maintenance_mode: "Enable maintenance mode to disable user access",
      allow_registrations: "Allow new user registrations",
      require_email_verification: "Require email verification for new users",
      enable_notifications: "Enable push notifications",
      enable_sms: "Enable SMS notifications",
      payment_gateway: "Primary payment gateway provider",
      currency: "Application currency",
      timezone: "Application timezone"
    }
    return descriptions[key] || "Application setting"
  }

  const isPublicSetting = (key: string): boolean => {
    const publicSettings = ['app_name', 'app_description', 'currency', 'timezone']
    return publicSettings.includes(key)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['admin', 'super_admin']}>
      <AdminNavigation />
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-gray-600">Configure application settings and preferences</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
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

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">
              <Settings2 className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="business">
              <Globe className="h-4 w-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="app_name">Application Name</Label>
                    <Input
                      id="app_name"
                      value={form.app_name}
                      onChange={(e) => setForm(prev => ({ ...prev, app_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={form.currency} onValueChange={(value) => setForm(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="app_description">Application Description</Label>
                  <Textarea
                    id="app_description"
                    value={form.app_description}
                    onChange={(e) => setForm(prev => ({ ...prev, app_description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => setForm(prev => ({ ...prev, contact_email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={form.contact_phone}
                      onChange={(e) => setForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={form.timezone} onValueChange={(value) => setForm(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Manila">Asia/Manila</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="platform_fee_percentage">Platform Fee (%)</Label>
                    <Input
                      id="platform_fee_percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={form.platform_fee_percentage}
                      onChange={(e) => setForm(prev => ({ ...prev, platform_fee_percentage: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_service_radius">Max Service Radius (km)</Label>
                    <Input
                      id="max_service_radius"
                      type="number"
                      min="1"
                      max="1000"
                      value={form.max_service_radius}
                      onChange={(e) => setForm(prev => ({ ...prev, max_service_radius: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="default_service_duration">Default Duration (minutes)</Label>
                    <Input
                      id="default_service_duration"
                      type="number"
                      min="15"
                      max="480"
                      value={form.default_service_duration}
                      onChange={(e) => setForm(prev => ({ ...prev, default_service_duration: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenance_mode"
                    checked={form.maintenance_mode}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, maintenance_mode: checked }))}
                  />
                  <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                  {form.maintenance_mode && (
                    <Badge variant="destructive">Active</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow_registrations">Allow New Registrations</Label>
                    <p className="text-sm text-gray-500">Allow new users to register accounts</p>
                  </div>
                  <Switch
                    id="allow_registrations"
                    checked={form.allow_registrations}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, allow_registrations: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require_email_verification">Require Email Verification</Label>
                    <p className="text-sm text-gray-500">Require new users to verify their email</p>
                  </div>
                  <Switch
                    id="require_email_verification"
                    checked={form.require_email_verification}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, require_email_verification: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="payment_gateway">Primary Payment Gateway</Label>
                  <Select value={form.payment_gateway} onValueChange={(value) => setForm(prev => ({ ...prev, payment_gateway: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paymongo">PayMongo</SelectItem>
                      <SelectItem value="gcash">GCash</SelectItem>
                      <SelectItem value="paymaya">PayMaya</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable_notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Enable push notifications for users</p>
                  </div>
                  <Switch
                    id="enable_notifications"
                    checked={form.enable_notifications}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, enable_notifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable_sms">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Enable SMS notifications for important updates</p>
                  </div>
                  <Switch
                    id="enable_sms"
                    checked={form.enable_sms}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, enable_sms: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Current Settings Display */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Database className="h-5 w-5 inline mr-2" />
              Current Database Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings.map(setting => (
                <div key={setting.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{setting.key}</span>
                    {setting.is_public && <Badge variant="outline" className="text-xs">Public</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{setting.description}</p>
                  <p className="text-sm font-mono bg-gray-100 p-1 rounded">{setting.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
