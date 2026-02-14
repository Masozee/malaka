'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useReactToPrint } from 'react-to-print'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  PencilEdit01Icon,
  CheckmarkCircle01Icon,
  Calendar01Icon,
  Tag01Icon,
  Archive01Icon,
  Dollar01Icon,
  FileIcon,
  UserIcon,
  DeleteIcon,
  PrinterIcon,
} from '@hugeicons/core-free-icons'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

import type { JournalEntry, JournalEntryLine } from '@/types/accounting'
import { EntityShareButton } from '@/components/messaging/EntityShareButton'
import { journalEntryService } from '@/services/accounting'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  PENDING: 'bg-yellow-500',
  POSTED: 'bg-green-500',
  REVERSED: 'bg-orange-500',
  CANCELLED: 'bg-red-500'
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  POSTED: 'Posted',
  REVERSED: 'Reversed',
  CANCELLED: 'Cancelled'
}

// ─── Print Voucher Component ────────────────────────────────────────
function JournalVoucherPrint({
  entry,
  lines,
  formatCurrency,
  formatDate,
  getAccountDisplay,
}: {
  entry: JournalEntry
  lines: JournalEntryLine[]
  formatCurrency: (n: number) => string
  formatDate: (d: string) => string
  getAccountDisplay: (line: { account_code?: string; account_name?: string; account_id: string }) => string
}) {
  return (
    <div className="journal-print-voucher" style={{ fontFamily: '"Times New Roman", "Noto Sans", serif', padding: '16mm 14mm' }}>
      {/* ── Company Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 8, borderBottom: '3px double #333', paddingBottom: 12 }}>
        <h1 style={{ fontSize: '16pt', fontWeight: 700, margin: 0, letterSpacing: 1 }}>
          PT MALAKA NUSANTARA
        </h1>
        <p style={{ fontSize: '9pt', color: '#555', margin: '2px 0 0' }}>
          Jl. Industri Sepatu No. 1, Jakarta Pusat 10270
        </p>
      </div>

      {/* ── Document Title ── */}
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <h2 style={{ fontSize: '14pt', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: 2 }}>
          Journal Voucher
        </h2>
      </div>

      {/* ── Entry Info Grid ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: '10pt' }}>
        <div>
          <table style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '2px 12px 2px 0', fontWeight: 600, border: 'none' }}>Entry No.</td>
                <td style={{ padding: '2px 0', border: 'none' }}>: {entry.entry_number}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 12px 2px 0', fontWeight: 600, border: 'none' }}>Date</td>
                <td style={{ padding: '2px 0', border: 'none' }}>: {formatDate(entry.entry_date)}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 12px 2px 0', fontWeight: 600, border: 'none' }}>Reference</td>
                <td style={{ padding: '2px 0', border: 'none' }}>: {entry.reference || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: 'right' }}>
          <table style={{ borderCollapse: 'collapse', marginLeft: 'auto' }}>
            <tbody>
              <tr>
                <td style={{ padding: '2px 12px 2px 0', fontWeight: 600, border: 'none' }}>Status</td>
                <td style={{ padding: '2px 0', border: 'none' }}>: {statusLabels[entry.status] || entry.status}</td>
              </tr>
              {entry.source_document && (
                <tr>
                  <td style={{ padding: '2px 12px 2px 0', fontWeight: 600, border: 'none' }}>Source</td>
                  <td style={{ padding: '2px 0', border: 'none' }}>: {entry.source_document}</td>
                </tr>
              )}
              {entry.period && (
                <tr>
                  <td style={{ padding: '2px 12px 2px 0', fontWeight: 600, border: 'none' }}>Period</td>
                  <td style={{ padding: '2px 0', border: 'none' }}>: {entry.period}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Description ── */}
      <div style={{ marginBottom: 16, fontSize: '10pt', padding: '8px 0', borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>
        <span style={{ fontWeight: 600 }}>Description: </span>
        {entry.description}
      </div>

      {/* ── Lines Table ── */}
      <table>
        <thead>
          <tr>
            <th style={{ width: '6%', textAlign: 'center' }}>No.</th>
            <th style={{ width: '34%', textAlign: 'left' }}>Account</th>
            <th style={{ width: '24%', textAlign: 'left' }}>Description</th>
            <th style={{ width: '18%', textAlign: 'right' }}>Debit (Rp)</th>
            <th style={{ width: '18%', textAlign: 'right' }}>Credit (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, idx) => (
            <tr key={line.id}>
              <td style={{ textAlign: 'center' }}>{idx + 1}</td>
              <td>{getAccountDisplay(line)}</td>
              <td>{line.description}</td>
              <td style={{ textAlign: 'right', fontFamily: '"Courier New", monospace' }}>
                {line.debit_amount > 0 ? formatCurrency(line.debit_amount) : '-'}
              </td>
              <td style={{ textAlign: 'right', fontFamily: '"Courier New", monospace' }}>
                {line.credit_amount > 0 ? formatCurrency(line.credit_amount) : '-'}
              </td>
            </tr>
          ))}
          {/* empty rows if less than 4 lines so the table doesn't look too small */}
          {lines.length < 4 && Array.from({ length: 4 - lines.length }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td>&nbsp;</td><td></td><td></td><td></td><td></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="print-total-row">
            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>TOTAL</td>
            <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: '"Courier New", monospace' }}>
              {formatCurrency(entry.total_debit)}
            </td>
            <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: '"Courier New", monospace' }}>
              {formatCurrency(entry.total_credit)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ── Balance Check ── */}
      <div style={{ marginTop: 8, fontSize: '9pt', textAlign: 'right' }}>
        {entry.total_debit === entry.total_credit ? (
          <span style={{ color: '#166534', fontWeight: 600 }}>&#10003; Balanced</span>
        ) : (
          <span style={{ color: '#991b1b', fontWeight: 600 }}>&#10007; Unbalanced &mdash; Difference: {formatCurrency(Math.abs(entry.total_debit - entry.total_credit))}</span>
        )}
      </div>

      {/* ── Signatures ── */}
      <div className="print-signatures" style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', fontSize: '10pt' }}>
        <div style={{ textAlign: 'center', width: '28%' }}>
          <p style={{ fontWeight: 600, margin: '0 0 60px' }}>Prepared by</p>
          <div style={{ borderBottom: '1px solid #333', marginBottom: 4 }}></div>
          <p style={{ margin: 0, fontSize: '9pt', color: '#666' }}>{entry.created_by_name || '( __________________ )'}</p>
        </div>
        <div style={{ textAlign: 'center', width: '28%' }}>
          <p style={{ fontWeight: 600, margin: '0 0 60px' }}>Reviewed by</p>
          <div style={{ borderBottom: '1px solid #333', marginBottom: 4 }}></div>
          <p style={{ margin: 0, fontSize: '9pt', color: '#666' }}>( __________________ )</p>
        </div>
        <div style={{ textAlign: 'center', width: '28%' }}>
          <p style={{ fontWeight: 600, margin: '0 0 60px' }}>Approved by</p>
          <div style={{ borderBottom: '1px solid #333', marginBottom: 4 }}></div>
          <p style={{ margin: 0, fontSize: '9pt', color: '#666' }}>( __________________ )</p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: 32, borderTop: '1px solid #ccc', paddingTop: 8, fontSize: '8pt', color: '#999', display: 'flex', justifyContent: 'space-between' }}>
        <span>Printed: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        <span>Malaka ERP &mdash; Journal Voucher</span>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function JournalEntryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    confirmLabel: string
    variant: 'default' | 'destructive'
    onConfirm: () => Promise<void>
  }>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    variant: 'default',
    onConfirm: async () => {},
  })

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: journalEntry ? `Journal Voucher - ${journalEntry.entry_number}` : 'Journal Voucher',
  })

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
      setJournalEntry(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEntry = () => {
    if (!journalEntry) return
    setConfirmDialog({
      open: true,
      title: 'Delete Journal Entry',
      description: `Are you sure you want to delete entry "${journalEntry.entry_number}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        await journalEntryService.delete(journalEntry.id)
        setConfirmDialog(prev => ({ ...prev, open: false }))
        router.push('/accounting/journal')
      },
    })
  }

  const handlePostEntry = () => {
    if (!journalEntry) return
    setConfirmDialog({
      open: true,
      title: 'Post Journal Entry',
      description: `Are you sure you want to post entry "${journalEntry.entry_number}"? Posted entries cannot be modified.`,
      confirmLabel: 'Post Entry',
      variant: 'default',
      onConfirm: async () => {
        await journalEntryService.post(journalEntry.id)
        setConfirmDialog(prev => ({ ...prev, open: false }))
        await fetchJournalEntry()
      },
    })
  }

  const getAccountDisplay = (line: { account_code?: string; account_name?: string; account_id: string }) => {
    if (line.account_code && line.account_name) {
      return `${line.account_code} - ${line.account_name}`
    }
    if (line.account_name) return line.account_name
    if (line.account_code) return line.account_code
    return line.account_id
  }

  const formatCurrency = (amount: number) => {
    if (!mounted) return `Rp ${amount.toLocaleString()}`
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    if (!mounted) return dateStr
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatShortDate = (dateStr: string) => {
    if (!mounted) return dateStr
    return new Date(dateStr).toLocaleDateString('id-ID')
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Journal entry not found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The journal entry you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/accounting/journal">
              <Button variant="outline">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
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

  const lines = journalEntry.journal_entry_lines || (journalEntry as unknown as { lines?: JournalEntry['journal_entry_lines'] }).lines || []

  return (
    <TwoLevelLayout>
      <Header
        title={`Journal Entry: ${journalEntry.entry_number}`}
        description={journalEntry.description}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-2">
            <EntityShareButton
              entityType="journal_entry"
              entityId={journalEntry.id}
              title={journalEntry.entry_number}
              subtitle={journalEntry.description}
              status={journalEntry.status}
              statusColor={journalEntry.status === 'POSTED' ? 'green' : 'gray'}
              url={`/accounting/journal/${journalEntry.id}`}
            />
            <Link href="/accounting/journal">
              <Button variant="outline" size="sm">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                Back to Journal Entries
              </Button>
            </Link>
            {journalEntry.status === 'DRAFT' && (
              <>
                <Link href={`/accounting/journal/${journalEntry.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePostEntry}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Badge className={`${statusColors[journalEntry.status] || 'bg-gray-500'} text-white`}>
                    {statusLabels[journalEntry.status] || journalEntry.status}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Reference: {journalEntry.reference || '-'}
                  </span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Entry Date</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(journalEntry.entry_date)}
                      </p>
                    </div>
                  </div>

                  {journalEntry.period && (
                    <div className="flex items-center space-x-3">
                      <HugeiconsIcon icon={Tag01Icon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Period</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{journalEntry.period}</p>
                      </div>
                    </div>
                  )}

                  {journalEntry.fiscal_year && (
                    <div className="flex items-center space-x-3">
                      <HugeiconsIcon icon={Archive01Icon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Fiscal Year</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{journalEntry.fiscal_year}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Amount</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(journalEntry.total_debit)}
                      </p>
                    </div>
                  </div>

                  {journalEntry.source_document && (
                    <div className="flex items-center space-x-3">
                      <HugeiconsIcon icon={FileIcon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Source Document</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{journalEntry.source_document}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <HugeiconsIcon icon={UserIcon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Created By</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{journalEntry.created_by_name || journalEntry.created_by || '-'}</p>
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
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Debit
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {lines.map((line) => (
                      <tr key={line.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {getAccountDisplay(line)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{line.description}</div>
                          {line.reference && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">Ref: {line.reference}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                          {line.debit_amount > 0 ? formatCurrency(line.debit_amount) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                          {line.credit_amount > 0 ? formatCurrency(line.credit_amount) : '-'}
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
                        {formatCurrency(journalEntry.total_debit)}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(journalEntry.total_credit)}
                      </td>
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
                        <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                        Edit Entry
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                      onClick={handlePostEntry}
                    >
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 mr-2" />
                      Post Entry
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handlePrint()}
                >
                  <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4 mr-2" />
                  Print Entry
                </Button>

                <Separator />

                {(journalEntry.status === 'DRAFT' || journalEntry.status === 'CANCELLED') && (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleDeleteEntry}
                  >
                    <HugeiconsIcon icon={DeleteIcon} className="h-4 w-4 mr-2" />
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatShortDate(journalEntry.posted_at)} by {journalEntry.posted_by_name || journalEntry.posted_by}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Entry Updated</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatShortDate(journalEntry.updated_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Entry Created</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatShortDate(journalEntry.created_at)} by {journalEntry.created_by_name || journalEntry.created_by}
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
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{lines.length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Entry Status</span>
                  <Badge className={`${statusColors[journalEntry.status] || 'bg-gray-500'} text-white text-sm`}>
                    {statusLabels[journalEntry.status] || journalEntry.status}
                  </Badge>
                </div>

                {journalEntry.fiscal_year && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fiscal Year</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{journalEntry.fiscal_year}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Hidden Print Voucher ── */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={printRef}>
          <JournalVoucherPrint
            entry={journalEntry}
            lines={lines}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getAccountDisplay={getAccountDisplay}
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />
    </TwoLevelLayout>
  )
}
