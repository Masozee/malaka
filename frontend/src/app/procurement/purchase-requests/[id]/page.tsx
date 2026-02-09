'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { purchaseRequestService } from '@/services/procurement'
import type { PurchaseRequest } from '@/types/procurement'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { EntityShareButton } from '@/components/messaging/EntityShareButton'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

export default function PurchaseRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canApprove } = useAuth()
  const [request, setRequest] = useState<PurchaseRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadRequest()
  }, [params.id])

  const loadRequest = async () => {
    try {
      setLoading(true)
      const data = await purchaseRequestService.getById(params.id as string)
      setRequest(data)
    } catch (error) {
      console.error('Error loading purchase request:', error)
      setRequest(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!request) return
    if (window.confirm('Are you sure you want to delete this purchase request? This action cannot be undone.')) {
      try {
        await purchaseRequestService.delete(request.id)
        router.push('/procurement/purchase-requests')
      } catch (error) {
        console.error('Error deleting purchase request:', error)
        alert('Failed to delete purchase request. Please try again.')
      }
    }
  }

  const handleApprove = async () => {
    if (!request) return
    try {
      await purchaseRequestService.approve(request.id)
      loadRequest()
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Failed to approve request. Please try again.')
    }
  }

  const handleReject = async () => {
    if (!request) return
    const reason = window.prompt('Please enter rejection reason:')
    if (reason) {
      try {
        await purchaseRequestService.reject(request.id, reason)
        loadRequest()
      } catch (error) {
        console.error('Error rejecting request:', error)
        alert('Failed to reject request. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Loading..."
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Purchase Requests', href: '/procurement/purchase-requests' },
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

  if (!request) {
    return (
      <TwoLevelLayout>
        <Header
          title="Request Not Found"
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Purchase Requests', href: '/procurement/purchase-requests' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Purchase request not found</h3>
            <p className="text-muted-foreground mb-4">
              The purchase request you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/procurement/purchase-requests">
              <Button variant="outline">Back to Purchase Requests</Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Purchase Requests', href: '/procurement/purchase-requests' },
    { label: request.request_number },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title={request.title}
        description={request.request_number}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <EntityShareButton
              entityType="purchase_request"
              entityId={request.id}
              title={request.request_number}
              subtitle={request.title}
              status={request.status}
              statusColor={request.status === 'approved' ? 'green' : request.status === 'rejected' ? 'red' : request.status === 'pending' ? 'yellow' : 'gray'}
              url={`/procurement/purchase-requests/${request.id}`}
            />
            {/* Approve/Reject buttons only shown to users with approver role */}
            {request.status === 'pending' && canApprove() && (
              <>
                <Button variant="outline" onClick={handleReject}>
                  Reject
                </Button>
                <Button onClick={handleApprove}>Approve</Button>
              </>
            )}
            {request.status === 'draft' && (
              <Link href={`/procurement/purchase-requests/${request.id}/edit`}>
                <Button>Edit Request</Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge className={statusColors[request.status]}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Priority</p>
            <Badge className={priorityColors[request.priority]}>
              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
            </Badge>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
            <p className="text-lg font-semibold">
              {mounted ? `Rp ${request.total_amount.toLocaleString('id-ID')}` : ''}
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Required Date</p>
            <p className="text-lg font-semibold">
              {mounted && request.required_date
                ? new Date(request.required_date).toLocaleDateString('id-ID')
                : 'N/A'}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Request Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Request Number</p>
                  <p className="font-medium">{request.request_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{request.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requester</p>
                  <p className="font-medium">{request.requester_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">
                    {mounted ? new Date(request.requested_date).toLocaleDateString('id-ID') : ''}
                  </p>
                </div>
                {request.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{request.description}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Items */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Requested Items</h3>
              <div className="space-y-4">
                {request.items?.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{item.item_name}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {mounted ? `Rp ${(item.quantity * item.estimated_price).toLocaleString('id-ID')}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quantity:</span> {item.quantity} {item.unit}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Unit Price:</span>{' '}
                        {mounted ? `Rp ${item.estimated_price.toLocaleString('id-ID')}` : ''}
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

              <div className="mt-4 pt-4 border-t flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">
                    {mounted ? `Rp ${request.total_amount.toLocaleString('id-ID')}` : ''}
                  </p>
                </div>
              </div>
            </Card>

            {/* Notes */}
            {request.notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                <p className="text-muted-foreground">{request.notes}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {request.status === 'draft' && (
                  <Link href={`/procurement/purchase-requests/${request.id}/edit`} className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      Edit Request
                    </Button>
                  </Link>
                )}

                {request.status === 'approved' && (
                  <Link href={`/procurement/purchase-orders/new?pr=${request.id}`} className="w-full">
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
                  disabled={request.status !== 'draft'}
                >
                  Delete Request
                </Button>
              </div>
            </Card>

            {/* Approval History */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Approval History</h3>
              <div className="space-y-4">
                {request.approved_by && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Approved</p>
                      <p className="text-xs text-muted-foreground">
                        by {request.approved_by} on{' '}
                        {mounted && request.approved_date
                          ? new Date(request.approved_date).toLocaleDateString('id-ID')
                          : ''}
                      </p>
                    </div>
                  </div>
                )}
                {request.rejection_reason && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-red-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Rejected</p>
                      <p className="text-xs text-muted-foreground">Reason: {request.rejection_reason}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {mounted ? new Date(request.created_at).toLocaleDateString('id-ID') : ''}
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
