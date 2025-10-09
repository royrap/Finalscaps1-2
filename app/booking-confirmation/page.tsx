"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, MapPin, Clock, Phone, MessageCircle, Car } from "lucide-react"
import Link from "next/link"

export default function BookingConfirmationPage() {
  const [status, setStatus] = useState("confirmed")
  const [mechanicLocation, setMechanicLocation] = useState("Preparing to depart")

  const booking = {
    id: "BK-2024-001",
    mechanic: {
      name: "Mike's Auto Shop",
      phone: "+63 917 123 4567",
      rating: 4.8,
      vehicle: "Red Service Van",
    },
    service: "Oil Change",
    estimatedArrival: "15-20 mins",
    location: "123 Ayala Avenue, Makati City",
  }

  useEffect(() => {
    // Simulate real-time updates
    const timer = setTimeout(() => {
      setStatus("en-route")
      setMechanicLocation("5 minutes away")
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "en-route":
        return "bg-yellow-100 text-yellow-800"
      case "arrived":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Booking Confirmed"
      case "en-route":
        return "Mechanic En Route"
      case "arrived":
        return "Mechanic Arrived"
      case "in-progress":
        return "Service In Progress"
      case "completed":
        return "Service Completed"
      default:
        return "Unknown Status"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold">Booking Status</h1>
            <Link href="/bookings">
              <Button variant="outline">View All Bookings</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600">Your mechanic is on the way</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Status Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Booking #{booking.id}</CardTitle>
                  <Badge className={getStatusColor(status)}>{getStatusText(status)}</Badge>
                </div>
                <CardDescription>Track your service request in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Car className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{booking.mechanic.name}</h3>
                        <p className="text-sm text-gray-600">{booking.mechanic.vehicle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{mechanicLocation}</p>
                      <p className="text-sm text-gray-500">ETA: {booking.estimatedArrival}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Service Location</p>
                        <p className="text-sm text-gray-600">{booking.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Service Type</p>
                        <p className="text-sm text-gray-600">{booking.service}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Live Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Live map tracking would appear here</p>
                    <p className="text-sm text-gray-400">Showing mechanic location in real-time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Mechanic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-transparent" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call {booking.mechanic.name}
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <p className="text-xs text-gray-500 text-center">Available 24/7 for support</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Booking Confirmed</p>
                      <p className="text-xs text-gray-500">2:30 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${status === "en-route" ? "bg-yellow-500" : "bg-gray-300"}`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium">Mechanic Dispatched</p>
                      <p className="text-xs text-gray-500">{status === "en-route" ? "2:33 PM" : "Pending"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Service Started</p>
                      <p className="text-xs text-gray-500">Pending</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Service Completed</p>
                      <p className="text-xs text-gray-500">Pending</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full mb-2 bg-transparent">
                  Cancel Booking
                </Button>
                <Button variant="ghost" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
