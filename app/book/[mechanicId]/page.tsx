"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Star, Car } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function BookingPage({ params }: { params: { mechanicId: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    vehicleType: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    location: "",
    description: "",
    urgency: "normal",
  })

  const mechanic = {
    id: params.mechanicId,
    name: "Mike's Auto Shop",
    rating: 4.8,
    distance: "0.5 km",
    specialties: ["Engine", "Brakes"],
    estimatedArrival: "15-20 mins",
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate booking creation
    router.push("/booking-confirmation")
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
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold ml-4">Book Service</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>Please provide details about your vehicle and the service needed</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicleType">Vehicle Type</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="hatchback">Hatchback</SelectItem>
                          <SelectItem value="pickup">Pickup Truck</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="vehicleMake">Make</Label>
                      <Input
                        id="vehicleMake"
                        placeholder="e.g., Toyota, Honda"
                        value={formData.vehicleMake}
                        onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicleModel">Model</Label>
                      <Input
                        id="vehicleModel"
                        placeholder="e.g., Camry, Civic"
                        value={formData.vehicleModel}
                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicleYear">Year</Label>
                      <Input
                        id="vehicleYear"
                        placeholder="e.g., 2020"
                        value={formData.vehicleYear}
                        onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Your Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter your address or landmark"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Problem Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the issue with your vehicle..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Can wait a few hours</SelectItem>
                        <SelectItem value="normal">Normal - Within 1-2 hours</SelectItem>
                        <SelectItem value="high">High - ASAP</SelectItem>
                        <SelectItem value="emergency">Emergency - Vehicle not drivable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Confirm Booking
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Mechanic Info & Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Selected Mechanic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{mechanic.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{mechanic.rating}</span>
                      <span className="mx-2">•</span>
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{mechanic.distance}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Specialties:</span>
                    <div className="flex space-x-1">
                      {mechanic.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estimated Arrival:</span>
                    <span className="font-medium text-green-600">{mechanic.estimatedArrival}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>₱500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Travel Fee</span>
                    <span>₱100</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Parts & Labor</span>
                    <span>TBD</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Initial Total</span>
                    <span>₱600</span>
                  </div>
                  <p className="text-xs text-gray-500">Final cost will be determined after diagnosis</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
