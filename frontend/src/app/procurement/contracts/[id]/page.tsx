'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { contractService } from '@/services/procurement'
import type { Contract } from '@/types/procurement'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PencilEdit01Icon,
  Download01Icon,
  Building03Icon,
  RefreshIcon,
  CancelIcon,
  Delete01Icon,
  FileIcon,
  Pdf01Icon,
  Image01Icon,
  FileAttachmentIcon,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  terminated: 'bg-orange-100 text-orange-800',
  renewed: 'bg-blue-100 text-blue-800',
}

const typeColors: Record<string, string> = {
  supply: 'bg-blue-100 text-blue-800',
  service: 'bg-green-100 text-green-800',
  framework: 'bg-purple-100 text-purple-800',
  'one-time': 'bg-orange-100 text-orange-800',
}

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadContract()
  }, [params.id])

  const loadContract = async () => {
    try {
      setLoading(true)
      const data = await contractService.getById(params.id as string)
      setContract(data)
    } catch (error) {
      console.error('Error loading contract:', error)
      setContract(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!contract) return
    if (window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      try {
        await contractService.delete(contract.id)
        router.push('/procurement/contracts')
      } catch (error) {
        console.error('Error deleting contract:', error)
        alert('Failed to delete contract. Please try again.')
      }
    }
  }

  const handleTerminate = async () => {
    if (!contract) return
    const reason = window.prompt('Enter the reason for terminating this contract:')
    if (reason) {
      try {
        await contractService.terminate(contract.id, reason)
        loadContract()
      } catch (error) {
        console.error('Error terminating contract:', error)
        alert('Failed to terminate contract. Please try again.')
      }
    }
  }

  const handleRenew = async () => {
    if (!contract) return
    const newEndDate = window.prompt('Enter the new end date (YYYY-MM-DD):',
      new Date(new Date(contract.end_date).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    if (newEndDate) {
      try {
        await contractService.renew(contract.id, newEndDate)
        loadContract()
      } catch (error) {
        console.error('Error renewing contract:', error)
        alert('Failed to renew contract. Please try again.')
      }
    }
  }

  const formatCurrency = (value: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value)
  }

  const calculateDaysRemaining = () => {
    if (!contract) return 0
    const endDate = new Date(contract.end_date)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Loading..."
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Contracts', href: '/procurement/contracts' },
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

  if (!contract) {
    return (
      <TwoLevelLayout>
        <Header
          title="Contract Not Found"
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Contracts', href: '/procurement/contracts' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Contract not found</h3>
            <p className="text-muted-foreground mb-4">
              The contract you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/procurement/contracts">
              <Button variant="outline">Back to Contracts</Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Contracts', href: '/procurement/contracts' },
    { label: contract.contract_number },
  ]

  const daysRemaining = calculateDaysRemaining()

  return (
    <TwoLevelLayout>
      <Header
        title={contract.title}
        description={contract.contract_number}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            {contract.status === 'draft' && (
              <Link href={`/procurement/contracts/${contract.id}/edit`}>
                <Button>Edit Contract</Button>
              </Link>
            )}
            {contract.status === 'active' && (
              <>
                <Button variant="outline" onClick={handleTerminate}>
                  Terminate
                </Button>
                <Button onClick={handleRenew}>
                  Renew Contract
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge className={statusColors[contract.status]}>
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </Badge>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Type</p>
            <Badge className={typeColors[contract.contract_type]}>
              {contract.contract_type.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Badge>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Contract Value</p>
            <p className="text-lg font-semibold">{formatCurrency(contract.value, contract.currency)}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Days Remaining</p>
            <p className={`text-lg font-semibold ${daysRemaining < 30 ? 'text-red-600' : daysRemaining < 90 ? 'text-yellow-600' : 'text-green-600'}`}>
              {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contract Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contract Number</p>
                  <p className="font-medium">{contract.contract_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{contract.supplier_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {mounted ? new Date(contract.start_date).toLocaleDateString('id-ID') : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {mounted ? new Date(contract.end_date).toLocaleDateString('id-ID') : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Terms</p>
                  <p className="font-medium">{contract.payment_terms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Auto Renewal</p>
                  <p className="font-medium">{contract.auto_renewal ? `Yes (${contract.renewal_period} months)` : 'No'}</p>
                </div>
                {contract.notice_period && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notice Period</p>
                    <p className="font-medium">{contract.notice_period} days</p>
                  </div>
                )}
                {contract.signed_by && (
                  <div>
                    <p className="text-sm text-muted-foreground">Signed By</p>
                    <p className="font-medium">{contract.signed_by}</p>
                  </div>
                )}
                {contract.signed_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Signed Date</p>
                    <p className="font-medium">
                      {mounted ? new Date(contract.signed_date).toLocaleDateString('id-ID') : ''}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            {contract.description && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{contract.description}</p>
              </Card>
            )}

            {/* Terms and Conditions */}
            {contract.terms_conditions && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Terms and Conditions</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">{contract.terms_conditions}</p>
                </div>
              </Card>
            )}

            {/* Documents */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Documents</h3>
              {contract.attachments && contract.attachments.length > 0 ? (
                <div className="space-y-2">
                  {contract.attachments.map((attachment, index) => {
                    const fileName = attachment.split('/').pop() || attachment
                    const fileExt = fileName.split('.').pop()?.toLowerCase()
                    const isPdf = fileExt === 'pdf'
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                            <HugeiconsIcon
                              icon={isPdf ? Pdf01Icon : isImage ? Image01Icon : FileAttachmentIcon}
                              className="h-5 w-5 text-foreground"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{fileName}</p>
                            <p className="text-xs text-muted-foreground uppercase">{fileExt} file</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HugeiconsIcon icon={FileIcon} className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No documents attached</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <HugeiconsIcon icon={FileAttachmentIcon} className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {contract.status === 'draft' && (
                  <Link href={`/procurement/contracts/${contract.id}/edit`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                      Edit Contract
                    </Button>
                  </Link>
                )}

                <Button variant="outline" className="w-full justify-start">
                  <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>

                {contract.supplier_id && (
                  <Link href={`/procurement/suppliers/${contract.supplier_id}`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <HugeiconsIcon icon={Building03Icon} className="h-4 w-4 mr-2" />
                      View Supplier
                    </Button>
                  </Link>
                )}

                {contract.status === 'active' && (
                  <>
                    <Separator className="my-2" />
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleRenew}
                    >
                      <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4 mr-2" />
                      Renew Contract
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-orange-600 hover:text-orange-700"
                      onClick={handleTerminate}
                    >
                      <HugeiconsIcon icon={CancelIcon} className="h-4 w-4 mr-2" />
                      Terminate
                    </Button>
                  </>
                )}

                {contract.status !== 'active' && (
                  <>
                    <Separator className="my-2" />
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleDelete}
                    >
                      <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                      Delete Contract
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Contract Value */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contract Value</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(contract.value, contract.currency)}
                </div>
                <p className="text-muted-foreground">{contract.currency}</p>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Timeline</h3>
              <div className="space-y-4">
                {contract.status === 'expired' && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-red-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Expired</p>
                      <p className="text-xs text-muted-foreground">
                        {mounted ? new Date(contract.end_date).toLocaleDateString('id-ID') : ''}
                      </p>
                    </div>
                  </div>
                )}
                {contract.status === 'terminated' && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-orange-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Terminated</p>
                      <p className="text-xs text-muted-foreground">
                        {mounted ? new Date(contract.updated_at).toLocaleDateString('id-ID') : ''}
                      </p>
                    </div>
                  </div>
                )}
                {contract.signed_date && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Signed</p>
                      <p className="text-xs text-muted-foreground">
                        {mounted ? new Date(contract.signed_date).toLocaleDateString('id-ID') : ''}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Contract Period</p>
                    <p className="text-xs text-muted-foreground">
                      {mounted ? new Date(contract.start_date).toLocaleDateString('id-ID') : ''} - {mounted ? new Date(contract.end_date).toLocaleDateString('id-ID') : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-gray-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {mounted ? new Date(contract.created_at).toLocaleDateString('id-ID') : ''}
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
