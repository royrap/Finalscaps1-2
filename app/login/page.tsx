"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, DownloadCloud } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Get user profile to check role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_type, first_name, last_name')
          .eq('id', data.user.id)
          .single()

        setSuccess(`Welcome back, ${profile?.first_name || 'User'}! Redirecting...`)
        
        // Redirect based on user type
        setTimeout(() => {
          if (profile?.user_type === 'admin' || profile?.user_type === 'super_admin') {
            window.location.href = '/admin'
          } else {
            window.location.href = '/user-management'
          }
        }, 1500)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const message = error?.message || String(error)

      // Handle invalid refresh token specifically
      if (message.includes('Invalid Refresh Token') || message.includes('Refresh Token Not Found')) {
        try {
          // try to clear the current session
          await supabase.auth.signOut()
        } catch (e) {
          console.warn('Error signing out after invalid refresh token:', e)
        }
        setError('Session expired or invalid refresh token. Please refresh the page and try logging in again.')
      } else {
        setError(message || 'An error occurred during login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            TalyerOTG Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

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

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Download APK button - opens external link */}
              <Button
                type="button"
                className="w-full mt-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-95 font-medium py-2 rounded-lg flex items-center justify-center gap-2"
                onClick={() => window.open('https://drive.google.com/file/d/1NWL2_yTm2CFWuIpkcjBpAlMyCJ6gNdbv/view', '_blank')}
              >
                <DownloadCloud className="h-4 w-4" />
                <span>Download APK</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            For admin access or new account, contact your system administrator
          </p>
        </div>
      </div>
    </div>
  )
}
