"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, Star, Phone, MessageCircle, CheckCircle, X, DollarSign } from "lucide-react"

const pendingBookings = [
  {
    id: "BK-2024-001",
    customer: "Juan Dela Cruz",
    service: "Oil Change",
    vehicle: "2020 Toyota Camry",
    location: "123 Ayala Avenue, Makati",
    distance: "0.8 km",
    urgency: "normal",
    estimatedPay: "₱1,200",
    timePosted: "5 mins ago",
  },
  {
    id: "BK-2024-002",
    customer: "Maria Santos",
    service: "Brake Repair",
    vehicle: "2018 Honda Civic",
    location: "456 EDSA, Quezon City",
    distance: "2.1 km",
    urgency: "high",
    estimatedPay: "₱2,500",
    timePosted: "12 mins ago",
  },
]

const activeBookings = [
  {
    id: "BK-2024-003",
    customer: "Pedro Garcia",
    service: "Engine Diagnostics",
    vehicle: "2019 Mitsubishi Montero",
    location: "789 Ortigas Avenue, Pasig",
    status: "en-route",
    estimatedPay: "₱800",
    startTime: "2:30 PM",
  },
]

export default function MechanicDashboard() {
  const [isOnline, setIsOnline] = useState(true)
  const [selectedTab, setSelectedTab] = useState("pending")

  const handleAcceptBooking = (bookingId: string) => {
    console.log("Accepting booking:", bookingId)
    // Handle booking acceptance
  }

  const handleDeclineBooking = (bookingId: string) => {
    console.log("Declining booking:", bookingId)
    // Handle booking decline
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800"
      case "emergency":
        return "bg-red-200 text-red-900"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold">Mechanic Dashboard</h1>
              <p className="text-sm text-gray-500">Mike's Auto Shop</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Offline</span>
                <Switch checked={isOnline} onCheckedChange={setIsOnline} />
                <span className="text-sm">Online</span>
              </div>
              <Badge className={isOnline ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {isOnline ? "Available" : "Offline"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-green-600">₱3,200</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Jobs Completed</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold">4.8</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Online Time</p>
                  <p className="text-2xl font-bold">6h 30m</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Requests ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="active">Active Jobs ({activeBookings.length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="font-semibold text-lg">{booking.customer}</h3>
                        <Badge className={getUrgencyColor(booking.urgency)}>{booking.urgency.toUpperCase()}</Badge>
                        <span className="text-sm text-gray-500">{booking.timePosted}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Service Needed</p>
                          <p className="font-medium">{booking.service}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Vehicle</p>
                          <p className="font-medium">{booking.vehicle}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            <p className="font-medium">{booking.location}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Distance</p>
                          <p className="font-medium">{booking.distance}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-green-600">Estimated Pay: {booking.estimatedPay}</div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleDeclineBooking(booking.id)}>
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                          <Button size="sm" onClick={() => handleAcceptBooking(booking.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="font-semibold text-lg">{booking.customer}</h3>
                        <Badge className="bg-yellow-100 text-yellow-800">{booking.status.toUpperCase()}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Service</p>
                          <p className="font-medium">{booking.service}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Vehicle</p>
                          <p className="font-medium">{booking.vehicle}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            <p className="font-medium">{booking.location}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Started</p>
                          <p className="font-medium">{booking.startTime}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-green-600">Pay: {booking.estimatedPay}</div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-1" />
                            Call Customer
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm">Update Status</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Job history will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
