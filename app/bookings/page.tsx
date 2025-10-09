"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Star, Phone, MessageCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

const activeBookings = [
  {
    id: "BK-2024-001",
    mechanic: "Mike's Auto Shop",
    service: "Oil Change",
    vehicle: "2020 Toyota Camry",
    status: "en-route",
    estimatedArrival: "10 mins",
    location: "123 Ayala Avenue, Makati",
    cost: "₱1,200",
    rating: 4.8,
    phone: "+63 917 123 4567",
  },
]

const completedBookings = [
  {
    id: "BK-2024-002",
    mechanic: "QuickFix Garage",
    service: "Brake Repair",
    vehicle: "2018 Honda Civic",
    status: "completed",
    completedDate: "Dec 8, 2024",
    location: "456 EDSA, Quezon City",
    cost: "₱2,500",
    rating: 4.6,
    customerRating: 5,
  },
  {
    id: "BK-2024-003",
    mechanic: "Pro Auto Care",
    service: "AC Repair",
    vehicle: "2019 Mitsubishi Montero",
    status: "completed",
    completedDate: "Dec 5, 2024",
    location: "789 Ortigas Avenue, Pasig",
    cost: "₱3,200",
    rating: 4.9,
    customerRating: 4,
  },
]

export default function BookingsPage() {
  const [selectedTab, setSelectedTab] = useState("active")

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
        return "Confirmed"
      case "en-route":
        return "En Route"
      case "arrived":
        return "Arrived"
      case "in-progress":
        return "In Progress"
      case "completed":
        return "Completed"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-xl font-semibold ml-4">My Bookings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
            <TabsTrigger value="history">History ({completedBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No active bookings</p>
                  <Link href="/">
                    <Button>Book a Service</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              activeBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Booking #{booking.id}</CardTitle>
                      <Badge className={getStatusColor(booking.status)}>{getStatusText(booking.status)}</Badge>
                    </div>
                    <CardDescription>
                      {booking.service} • {booking.vehicle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div>
                          <h3 className="font-semibold">{booking.mechanic}</h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span>{booking.rating}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">ETA: {booking.estimatedArrival}</p>
                          <p className="text-sm text-gray-500">Cost: {booking.cost}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.location}</span>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Mechanic
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Link href="/booking-confirmation" className="flex-1">
                          <Button size="sm" className="w-full">
                            Track Live
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {completedBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Booking #{booking.id}</CardTitle>
                    <Badge className={getStatusColor(booking.status)}>{getStatusText(booking.status)}</Badge>
                  </div>
                  <CardDescription>
                    {booking.service} • {booking.vehicle} • {booking.completedDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{booking.mechanic}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{booking.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{booking.cost}</p>
                        <div className="flex items-center text-sm">
                          <span>Your rating: </span>
                          <div className="flex ml-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < booking.customerRating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.location}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Book Again
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        View Receipt
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Leave Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
