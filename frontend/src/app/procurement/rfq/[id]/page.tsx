'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { rfqService, RFQ } from '@/services/rfq'
import Link from 'next/link'

export default function RFQDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [rfq, setRfq] = useState<RFQ | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadRFQ()
  }, [params.id])

  const loadRFQ = async () => {
    try {
      setLoading(true)
      const data = await rfqService.getRFQById(params.id as string)
      setRfq(data)
    } catch (error) {
      console.error('Error loading RFQ:', error)
      setRfq(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!rfq) return
    if (window.confirm('Are you sure you want to delete this RFQ? This action cannot be undone.')) {
      try {
        await rfqService.deleteRFQ(rfq.id)
        router.push('/procurement/rfq')
      } catch (error) {
        console.error('Error deleting RFQ:', error)
        alert('Failed to delete RFQ. Please try again.')
      }
    }
  }

  const handlePublish = async () => {
    if (!rfq) return
    try {
      await rfqService.publishRFQ(rfq.id)
      loadRFQ()
    } catch (error) {
      console.error('Error publishing RFQ:', error)
      alert('Failed to publish RFQ. Please try again.')
    }
  }

  const handleClose = async () => {
    if (!rfq) return
    try {
      await rfqService.closeRFQ(rfq.id)
      loadRFQ()
    } catch (error) {
      console.error('Error closing RFQ:', error)
      alert('Failed to close RFQ. Please try again.')
    }
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Loading..."
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'RFQ', href: '/procurement/rfq' },
            { label: 'Loading...' },
          ]}
        />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (!rfq) {
    return (
      <TwoLevelLayout>
        <Header
          title="RFQ Not Found"
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'RFQ', href: '/procurement/rfq' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">RFQ not found</h3>
            <p className="text-muted-foreground mb-4">
              The RFQ you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/procurement/rfq">
              <Button variant="outline">Back to RFQ List</Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'RFQ', href: '/procurement/rfq' },
    { label: rfq.rfq_number },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title={rfq.title}
        description={rfq.rfq_number}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            {rfq.status === 'draft' && (
              <>
                <Button variant="outline" onClick={handlePublish}>
                  Publish RFQ
                </Button>
                <Link href={`/procurement/rfq/${rfq.id}/edit`}>
                  <Button>Edit RFQ</Button>
                </Link>
              </>
            )}
            {rfq.status === 'published' && (
              <Button onClick={handleClose}>Close RFQ</Button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge className={rfqService.getStatusColor(rfq.status)}>
              {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
            </Badge>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Priority</p>
            <Badge className={rfqService.getPriorityColor(rfq.priority)}>
              {rfq.priority.charAt(0).toUpperCase() + rfq.priority.slice(1)}
            </Badge>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Items</p>
            <p className="text-lg font-semibold">{rfq.items?.length || 0}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Due Date</p>
            <p className="text-lg font-semibold">
              {rfqService.formatDate(rfq.due_date)}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* RFQ Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">RFQ Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">RFQ Number</p>
                  <p className="font-medium">{rfq.rfq_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">{rfq.created_by}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="font-medium">
                    {rfqService.formatDate(rfq.created_at)}
                  </p>
                </div>
                {rfq.published_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Published Date</p>
                    <p className="font-medium">
                      {rfqService.formatDate(rfq.published_at)}
                    </p>
                  </div>
                )}
                {rfq.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{rfq.description}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Items */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Requested Items</h3>
              <div className="space-y-4">
                {rfq.items?.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{item.item_name}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      {item.target_price > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Target Price</p>
                          <p className="font-medium">
                            {rfqService.formatCurrency(item.target_price)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quantity:</span> {item.quantity} {item.unit}
                      </div>
                      {item.specification && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Spec:</span> {item.specification}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Supplier Responses */}
            {rfq.responses && rfq.responses.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Supplier Responses</h3>
                <div className="space-y-4">
                  {rfq.responses.map((response) => (
                    <div key={response.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{response.supplier?.name || 'Unknown Supplier'}</h4>
                          <p className="text-sm text-muted-foreground">
                            Responded on {rfqService.formatDate(response.response_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {rfqService.formatCurrency(response.total_amount, response.currency)}
                          </p>
                          <Badge className={
                            response.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            response.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Delivery Time:</span> {response.delivery_time} days
                        </div>
                        <div>
                          <span className="text-muted-foreground">Validity:</span> {response.validity_period} days
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {rfq.status === 'draft' && (
                  <Link href={`/procurement/rfq/${rfq.id}/edit`} className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      Edit RFQ
                    </Button>
                  </Link>
                )}

                <Button variant="outline" className="w-full justify-start">
                  Export PDF
                </Button>

                {rfq.status === 'closed' && (
                  <Link href={`/procurement/purchase-orders/new?rfq=${rfq.id}`} className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      Create Purchase Order
                    </Button>
                  </Link>
                )}

                <Separator className="my-3" />

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={rfq.status !== 'draft'}
                >
                  Delete RFQ
                </Button>
              </div>
            </Card>

            {/* Invited Suppliers */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Invited Suppliers</h3>
              {rfq.suppliers && rfq.suppliers.length > 0 ? (
                <div className="space-y-3">
                  {rfq.suppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{supplier.supplier?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{supplier.status}</p>
                      </div>
                      <Badge className={
                        supplier.status === 'responded' ? 'bg-green-100 text-green-800' :
                        supplier.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {supplier.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No suppliers invited yet.</p>
              )}
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Timeline</h3>
              <div className="space-y-4">
                {rfq.closed_at && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Closed</p>
                      <p className="text-xs text-muted-foreground">
                        {rfqService.formatDate(rfq.closed_at)}
                      </p>
                    </div>
                  </div>
                )}
                {rfq.published_at && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Published</p>
                      <p className="text-xs text-muted-foreground">
                        {rfqService.formatDate(rfq.published_at)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-gray-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {rfqService.formatDate(rfq.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
