'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supplierService } from '@/services/masterdata'
import type { Supplier } from '@/types/masterdata'
import Link from 'next/link'

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
}

export default function SupplierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadSupplier()
  }, [params.id])

  const loadSupplier = async () => {
    try {
      setLoading(true)
      const data = await supplierService.getById(params.id as string)
      setSupplier(data)
    } catch (error) {
      console.error('Error loading supplier:', error)
      setSupplier(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!supplier) return
    if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      try {
        await supplierService.delete(supplier.id)
        router.push('/procurement/suppliers')
      } catch (error) {
        console.error('Error deleting supplier:', error)
        alert('Failed to delete supplier. Please try again.')
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
            { label: 'Suppliers', href: '/procurement/suppliers' },
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

  if (!supplier) {
    return (
      <TwoLevelLayout>
        <Header
          title="Supplier Not Found"
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Suppliers', href: '/procurement/suppliers' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Supplier not found</h3>
            <p className="text-muted-foreground mb-4">
              The supplier you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/procurement/suppliers">
              <Button variant="outline">Back to Suppliers</Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Suppliers', href: '/procurement/suppliers' },
    { label: supplier.name },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title={supplier.name}
        description={`${supplier.code} - ${supplier.contact_person || 'No contact person'}`}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/procurement/suppliers/${supplier.id}/edit`}>
              <Button>Edit Supplier</Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge className={statusColors[supplier.status]}>
              {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
            </Badge>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Payment Terms</p>
            <p className="text-lg font-semibold">{supplier.payment_terms || 'N/A'}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Credit Limit</p>
            <p className="text-lg font-semibold">
              {mounted && supplier.credit_limit
                ? `Rp ${supplier.credit_limit.toLocaleString('id-ID')}`
                : 'N/A'}
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Member Since</p>
            <p className="text-lg font-semibold">
              {mounted ? new Date(supplier.created_at).toLocaleDateString('id-ID') : ''}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Supplier Code</p>
                  <p className="font-medium">{supplier.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier Name</p>
                  <p className="font-medium">{supplier.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{supplier.contact_person || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tax ID (NPWP)</p>
                  <p className="font-medium">{supplier.tax_id || 'N/A'}</p>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{supplier.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{supplier.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <p className="font-medium">
                      {supplier.website ? (
                        <a
                          href={supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {supplier.website}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{supplier.address || 'N/A'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href={`/procurement/suppliers/${supplier.id}/edit`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Edit Supplier
                  </Button>
                </Link>

                <Link href={`/procurement/purchase-orders/new?supplier=${supplier.id}`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Create Purchase Order
                  </Button>
                </Link>

                <Link href={`/procurement/vendor-evaluation/new?supplier=${supplier.id}`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    New Evaluation
                  </Button>
                </Link>

                <Separator className="my-3" />

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  Delete Supplier
                </Button>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {mounted ? new Date(supplier.updated_at).toLocaleDateString('id-ID') : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {mounted ? new Date(supplier.created_at).toLocaleDateString('id-ID') : ''}
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
