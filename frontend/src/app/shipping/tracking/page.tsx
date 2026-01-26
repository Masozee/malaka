'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Input } from '@/components/ui/input'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    Search01Icon,
    Location01Icon,
    PackageIcon,
    DeliveryTruck01Icon,
    CheckmarkCircle01Icon,
    Time04Icon,
    UserIcon,
    Call02Icon
} from '@hugeicons/core-free-icons'
import { Separator } from '@/components/ui/separator'

// Mock Tracking Data
const mockTrackingResult = {
    trackingNumber: 'JNE123456789',
    courier: 'JNE Express',
    service: 'Regular',
    status: 'In Transit',
    estimatedDelivery: '2024-07-26',
    origin: 'Jakarta',
    destination: 'Surabaya',
    weight: '2.5 kg',
    recipient: 'Budi Santoso',
    timeline: [
        {
            date: '2024-07-25',
            time: '14:30',
            status: 'Departed from Transit Facility',
            location: 'Jakarta Logistics Hub',
            icon: DeliveryTruck01Icon,
            color: 'text-foreground',
            bgCallback: 'bg-muted'
        },
        {
            date: '2024-07-25',
            time: '09:15',
            status: 'Arrived at Sorting Center',
            location: 'Jakarta Sorting Center',
            icon: PackageIcon,
            color: 'text-foreground',
            bgCallback: 'bg-muted'
        },
        {
            date: '2024-07-24',
            time: '18:45',
            status: 'Picked up by Courier',
            location: 'Malaka Store Jakarta',
            icon: UserIcon,
            color: 'text-foreground',
            bgCallback: 'bg-muted'
        },
        {
            date: '2024-07-24',
            time: '16:30',
            status: 'Shipment Created',
            location: 'System',
            icon: CheckmarkCircle01Icon,
            color: 'text-foreground',
            bgCallback: 'bg-muted'
        }
    ]
}

export default function TrackingPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [trackingData, setTrackingData] = useState<typeof mockTrackingResult | null>(null)
    const [isSearching, setIsSearching] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery) return

        setIsSearching(true)
        // Simulate API call
        setTimeout(() => {
            setTrackingData(mockTrackingResult)
            setIsSearching(false)
        }, 800)
    }

    const breadcrumbs = [
        { label: 'Shipping', href: '/shipping' },
        { label: 'Tracking', href: '/shipping/tracking' }
    ]

    return (
        <TwoLevelLayout>
            <div className="flex-1 space-y-6">
                <Header
                    title="Track Shipment"
                    description="Real-time tracking for all your shipments"
                    breadcrumbs={breadcrumbs}
                />

                {/* Search Section */}
                <div className="max-w-2xl mx-auto w-full">
                    <Card className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Enter tracking number (e.g. JNE123...)"
                                    className="pl-10 h-12 text-lg"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button type="submit" size="lg" className="h-12 px-8" disabled={isSearching}>
                                {isSearching ? 'Searching...' : 'Track'}
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Tracking Results */}
                {trackingData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Main Status */}
                        <Card className="lg:col-span-2 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">{trackingData.trackingNumber}</h2>
                                    <p className="text-muted-foreground">{trackingData.courier} • {trackingData.service}</p>
                                </div>
                                <Badge variant="secondary" className="text-lg px-4 py-1">
                                    {trackingData.status}
                                </Badge>
                            </div>

                            <div className="border-l-2 border-gray-100 ml-4 space-y-8 pl-8 relative">
                                {trackingData.timeline.map((event, index) => (
                                    <div key={index} className="relative">
                                        <div className={`absolute -left-[41px] p-2 rounded-full ${event.bgCallback} border-4 border-white`}>
                                            <HugeiconsIcon icon={event.icon} className={`h-5 w-5 ${event.color}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">{event.status}</p>
                                            <p className="text-muted-foreground mb-1">{event.location}</p>
                                            <div className="flex items-center text-sm text-gray-500 space-x-2">
                                                <HugeiconsIcon icon={Time04Icon} className="h-4 w-4" />
                                                <span>{event.date} at {event.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Shipment Details */}
                        <div className="space-y-6">
                            <Card className="p-6">
                                <h3 className="font-semibold text-lg mb-4">Shipment Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                                        <p className="font-medium text-lg">{trackingData.estimatedDelivery}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Origin</p>
                                        <div className="flex items-center mt-1">
                                            <HugeiconsIcon icon={Location01Icon} className="h-4 w-4 mr-2 text-gray-400" />
                                            <p className="font-medium">{trackingData.origin}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Destination</p>
                                        <div className="flex items-center mt-1">
                                            <HugeiconsIcon icon={Location01Icon} className="h-4 w-4 mr-2 text-gray-400" />
                                            <p className="font-medium">{trackingData.destination}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Recipient</p>
                                        <div className="flex items-center mt-1">
                                            <HugeiconsIcon icon={UserIcon} className="h-4 w-4 mr-2 text-gray-400" />
                                            <p className="font-medium">{trackingData.recipient}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Weight</p>
                                        <div className="flex items-center mt-1">
                                            <HugeiconsIcon icon={PackageIcon} className="h-4 w-4 mr-2 text-gray-400" />
                                            <p className="font-medium">{trackingData.weight}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t">
                                    <Button variant="outline" className="w-full">
                                        <HugeiconsIcon icon={Call02Icon} className="h-4 w-4 mr-2" />
                                        Contact Support
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </TwoLevelLayout>
    )
}
