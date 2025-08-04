'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Edit, 
  Trash2, 
  CheckCircle,
  FileText,
  Calendar,
  DollarSign,
  User,
  Hash,
  Archive
} from 'lucide-react'
import type { JournalEntry } from '@/types/accounting'
import { journalEntryService } from '@/services/accounting'
import Link from 'next/link'

const statusColors = {
  DRAFT: 'bg-gray-500',
  PENDING: 'bg-yellow-500',
  POSTED: 'bg-green-500',
  CANCELLED: 'bg-red-500'
}

const statusLabels = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  POSTED: 'Posted',
  CANCELLED: 'Cancelled'
}

export default function JournalEntryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchJournalEntry()
  }, [params.id])

  const fetchJournalEntry = async () => {
    try {
      setLoading(true)
      const entry = await journalEntryService.getById(params.id as string)
      setJournalEntry(entry)
    } catch (error) {
      console.error('Error fetching journal entry:', error)
      // Set null on error - no fallback to mock data
      setJournalEntry(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEntry = async () => {
    if (!journalEntry) return
    
    if (!window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      return
    }

    try {
      await journalEntryService.delete(journalEntry.id)
      router.push('/accounting/journal')
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      alert('Failed to delete journal entry. Please try again.')
    }
  }

  const handlePostEntry = async () => {
    if (!journalEntry) return

    if (!window.confirm('Are you sure you want to post this journal entry? Posted entries cannot be modified.')) {
      return
    }

    try {
      await journalEntryService.post(journalEntry.id)
      await fetchJournalEntry()
    } catch (error) {
      console.error('Error posting journal entry:', error)
      alert('Failed to post journal entry. Please try again.')
    }
  }

  const getAccountName = (accountId: string) => {
    // Use the same account mapping as in the service
    const accountMap: Record<string, {code: string, name: string}> = {
      '11111111-1111-1111-1111-111111111111': { code: '1101', name: 'Kas' },
      '22222222-2222-2222-2222-222222222222': { code: '1102', name: 'Bank BCA' },
      '44444444-4444-4444-4444-444444444444': { code: '1301', name: 'Persediaan Barang Dagangan' },
      '55555555-5555-5555-5555-555555555555': { code: '2101', name: 'Utang Dagang' },
      '77777777-7777-7777-7777-777777777777': { code: '2301', name: 'Utang Gaji' },
      '99999999-9999-9999-9999-999999999999': { code: '4101', name: 'Pendapatan Penjualan' }
    }
    
    const account = accountMap[accountId]
    return account ? `${account.code} - ${account.name}` : 'Unknown Account'
  }

  const getCostCenterName = (costCenterId?: string) => {
    if (!costCenterId) return null
    // Simple cost center mapping for now
    const costCenterMap: Record<string, string> = {
      '1': 'CC001 - Penjualan',
      '2': 'CC002 - Produksi', 
      '3': 'CC003 - Administrasi'
    }
    return costCenterMap[costCenterId] || 'Unknown Cost Center'
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Loading Journal Entry..."
          breadcrumbs={[
            { label: 'Accounting', href: '/accounting' },
            { label: 'Journal Entries', href: '/accounting/journal' },
            { label: 'Loading...', href: '#' }
          ]}
        />
        
        <div className="flex-1 p-6 space-y-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (!journalEntry) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Journal Entry Not Found"
          breadcrumbs={[
            { label: 'Accounting', href: '/accounting' },
            { label: 'Journal Entries', href: '/accounting/journal' },
            { label: 'Not Found', href: '#' }
          ]}
        />
        
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Journal entry not found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">The journal entry you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/accounting/journal">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Journal Entries
              </Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Journal Entries', href: '/accounting/journal' },
    { label: journalEntry.entry_number, href: `/accounting/journal/${journalEntry.id}` }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title={`Journal Entry: ${journalEntry.entry_number}`}
        description={journalEntry.description}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-2">
            <Link href="/accounting/journal">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Journal Entries
              </Button>
            </Link>
            {journalEntry.status === 'DRAFT' && (
              <>
                <Link href={`/accounting/journal/${journalEntry.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePostEntry}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </>
            )}
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Badge className={`${statusColors[journalEntry.status]} text-white`}>
                    {statusLabels[journalEntry.status]}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Reference: {journalEntry.reference}
                  </span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Entry Date</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {mounted ? new Date(journalEntry.entry_date).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : journalEntry.entry_date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Hash className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Period</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{journalEntry.period}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Archive className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Fiscal Year</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{journalEntry.fiscal_year}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Amount</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {mounted ? new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(journalEntry.total_debit) : `Rp ${journalEntry.total_debit.toLocaleString()}`}
                      </p>
                    </div>
                  </div>

                  {journalEntry.source_document && (
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Source Document</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{journalEntry.source_document}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Created By</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{journalEntry.created_by}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Journal Entry Lines */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Journal Entry Lines</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Debit
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Credit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cost Center
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {(journalEntry.lines || journalEntry.journal_entry_lines || []).map((line) => (
                      <tr key={line.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {getAccountName(line.account_id)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{line.description}</div>
                          {line.reference && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">Ref: {line.reference}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                          {line.debit_amount > 0 ? (
                            mounted ? 
                              new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                              }).format(line.debit_amount) : 
                              `Rp ${line.debit_amount.toLocaleString()}`
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                          {line.credit_amount > 0 ? (
                            mounted ?
                              new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                              }).format(line.credit_amount) :
                              `Rp ${line.credit_amount.toLocaleString()}`
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {getCostCenterName(line.cost_center_id) || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <td colSpan={2} className="px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                        Total:
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-100">
                        {mounted ? new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(journalEntry.total_debit) : `Rp ${journalEntry.total_debit.toLocaleString()}`}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-100">
                        {mounted ? new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(journalEntry.total_credit) : `Rp ${journalEntry.total_credit.toLocaleString()}`}
                      </td>
                      <td className="px-6 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {journalEntry.status === 'DRAFT' && (
                  <>
                    <Link href={`/accounting/journal/${journalEntry.id}/edit`} className="w-full">
                      <Button variant="outline" className="w-full justify-start">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Entry
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                      onClick={handlePostEntry}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Post Entry
                    </Button>
                  </>
                )}
                
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Print Entry
                </Button>
                
                <Separator />
                
                {(journalEntry.status === 'DRAFT' || journalEntry.status === 'CANCELLED') && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleDeleteEntry}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Entry
                  </Button>
                )}
              </div>
            </Card>

            {/* Entry Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Timeline</h3>
              <div className="space-y-4">
                {journalEntry.posted_at && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Entry Posted</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {mounted ? new Date(journalEntry.posted_at).toLocaleDateString('id-ID') : new Date(journalEntry.posted_at).toDateString()} by {journalEntry.posted_by}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Entry Updated</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {mounted ? new Date(journalEntry.updated_at).toLocaleDateString('id-ID') : new Date(journalEntry.updated_at).toDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Entry Created</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {mounted ? new Date(journalEntry.created_at).toLocaleDateString('id-ID') : new Date(journalEntry.created_at).toDateString()} by {journalEntry.created_by}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Entry Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Entry Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Lines</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{(journalEntry.lines || journalEntry.journal_entry_lines || []).length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Entry Status</span>
                  <Badge className={`${statusColors[journalEntry.status]} text-white text-xs`}>
                    {statusLabels[journalEntry.status]}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fiscal Year</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{journalEntry.fiscal_year}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}