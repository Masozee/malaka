'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { barcodeService, BarcodePrintJob } from '@/services/inventory'

export default function EditBarcodePrintJobPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const [fetchLoading, setFetchLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<BarcodePrintJob | null>(null)

  const [jobName, setJobName] = useState('')
  const [barcodeType, setBarcodeType] = useState('ean13')
  const [template, setTemplate] = useState('')
  const [priority, setPriority] = useState('normal')
  const [status, setStatus] = useState('queued')
  const [totalLabels, setTotalLabels] = useState(1)
  const [printedLabels, setPrintedLabels] = useState(0)
  const [failedLabels, setFailedLabels] = useState(0)
  const [printerName, setPrinterName] = useState('')
  const [requestedBy, setRequestedBy] = useState('')
  const [paperSize, setPaperSize] = useState('')
  const [labelDimensions, setLabelDimensions] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (params.id) fetchDetail()
  }, [params.id])

  const fetchDetail = async () => {
    try {
      setFetchLoading(true)
      const result = await barcodeService.getById(params.id as string)
      setData(result)
      setJobName(result.jobName || '')
      setBarcodeType(result.barcodeType || 'ean13')
      setTemplate(result.template || '')
      setPriority(result.priority || 'normal')
      setStatus(result.status || 'queued')
      setTotalLabels(result.totalLabels || 1)
      setPrintedLabels(result.printedLabels || 0)
      setFailedLabels(result.failedLabels || 0)
      setPrinterName(result.printerName || '')
      setRequestedBy(result.requestedBy || '')
      setPaperSize(result.paperSize || '')
      setLabelDimensions(result.labelDimensions || '')
      setNotes(result.notes || '')
    } catch (error) {
      console.error('Failed to fetch print job:', error)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!jobName.trim()) {
      addToast({ type: 'error', title: 'Please enter a job name' })
      return
    }
    if (totalLabels < 1) {
      addToast({ type: 'error', title: 'Total labels must be at least 1' })
      return
    }

    try {
      setSaving(true)
      await barcodeService.update(params.id as string, {
        job_name: jobName,
        barcode_type: barcodeType,
        template,
        priority,
        status,
        total_labels: totalLabels,
        printed_labels: printedLabels,
        failed_labels: failedLabels,
        printer_name: printerName,
        requested_by: requestedBy,
        paper_size: paperSize,
        label_dimensions: labelDimensions,
        notes,
      } as any)
      addToast({ type: 'success', title: 'Print job updated successfully' })
      router.push(`/inventory/barcode-print/${params.id}`)
    } catch (err) {
      console.error('Error updating print job:', err)
      addToast({ type: 'error', title: 'Failed to update print job' })
    } finally {
      setSaving(false)
    }
  }

  if (fetchLoading) {
    return (
      <TwoLevelLayout>
        <Header title="Edit Print Job" breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Barcode Print', href: '/inventory/barcode-print' },
          { label: 'Edit' },
        ]} />
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (!data) {
    return (
      <TwoLevelLayout>
        <Header title="Job Not Found" breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Barcode Print', href: '/inventory/barcode-print' },
        ]} />
        <div className="flex flex-col justify-center items-center h-64 p-6">
          <p className="text-muted-foreground">Print job not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/inventory/barcode-print')}>
            Back to List
          </Button>
        </div>
      </TwoLevelLayout>
    )
  }

  return (
    <TwoLevelLayout>
      <Header
        title={`Edit ${data.jobNumber}`}
        description={data.jobName}
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Barcode Print', href: '/inventory/barcode-print' },
          { label: data.jobNumber, href: `/inventory/barcode-print/${data.id}` },
          { label: 'Edit' },
        ]}
        compact
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <button
          onClick={() => router.push(`/inventory/barcode-print/${data.id}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          Back to Job Detail
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Job Details</CardTitle>
                <CardDescription>Update the barcode print job configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="jobName">Job Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="jobName"
                    placeholder="e.g. Print EAN13 labels for new stock"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="barcodeType">Barcode Type <span className="text-red-500">*</span></Label>
                    <Select value={barcodeType} onValueChange={setBarcodeType}>
                      <SelectTrigger id="barcodeType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ean13">EAN-13</SelectItem>
                        <SelectItem value="code128">Code 128</SelectItem>
                        <SelectItem value="qr">QR Code</SelectItem>
                        <SelectItem value="datamatrix">Data Matrix</SelectItem>
                        <SelectItem value="code39">Code 39</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="queued">Queued</SelectItem>
                        <SelectItem value="printing">Printing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="totalLabels">Total Labels <span className="text-red-500">*</span></Label>
                    <Input
                      id="totalLabels"
                      type="number"
                      min={1}
                      value={totalLabels}
                      onChange={(e) => setTotalLabels(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="printedLabels">Printed Labels</Label>
                    <Input
                      id="printedLabels"
                      type="number"
                      min={0}
                      value={printedLabels}
                      onChange={(e) => setPrintedLabels(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="failedLabels">Failed Labels</Label>
                    <Input
                      id="failedLabels"
                      type="number"
                      min={0}
                      value={failedLabels}
                      onChange={(e) => setFailedLabels(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="template">Template</Label>
                    <Input
                      id="template"
                      placeholder="e.g. standard-label, price-tag"
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="printerName">Printer Name</Label>
                    <Input
                      id="printerName"
                      placeholder="e.g. Zebra ZD420, Brother QL-820NWB"
                      value={printerName}
                      onChange={(e) => setPrinterName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="requestedBy">Requested By</Label>
                    <Input
                      id="requestedBy"
                      placeholder="e.g. Warehouse Team"
                      value={requestedBy}
                      onChange={(e) => setRequestedBy(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paperSize">Paper Size</Label>
                    <Input
                      id="paperSize"
                      placeholder="e.g. 100x50mm, A4, Roll"
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labelDimensions">Label Dimensions</Label>
                  <Input
                    id="labelDimensions"
                    placeholder="e.g. 50x25mm"
                    value={labelDimensions}
                    onChange={(e) => setLabelDimensions(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional instructions or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                  <CardDescription>Save or discard changes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => router.push(`/inventory/barcode-print/${data.id}`)}>
                    Cancel
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                  <CardDescription>Current job configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Labels</span>
                    <span className="text-xl font-bold">{totalLabels}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Progress</span>
                    <span className="text-xl font-bold">
                      {totalLabels > 0 ? Math.round((printedLabels / totalLabels) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Type</span>
                    <span className="text-sm font-bold uppercase">{barcodeType}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Priority</span>
                    <span className="text-sm font-bold capitalize">{priority}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <span className="text-sm font-bold capitalize">{status}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </TwoLevelLayout>
  )
}
