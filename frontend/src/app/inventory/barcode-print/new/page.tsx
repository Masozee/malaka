'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { barcodeService } from '@/services/inventory'

export default function NewBarcodePrintJobPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  const [jobName, setJobName] = useState('')
  const [barcodeType, setBarcodeType] = useState('ean13')
  const [template, setTemplate] = useState('')
  const [priority, setPriority] = useState('normal')
  const [totalLabels, setTotalLabels] = useState(1)
  const [printerName, setPrinterName] = useState('')
  const [requestedBy, setRequestedBy] = useState('')
  const [paperSize, setPaperSize] = useState('')
  const [labelDimensions, setLabelDimensions] = useState('')
  const [notes, setNotes] = useState('')

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
      setLoading(true)
      await barcodeService.create({
        job_name: jobName,
        barcode_type: barcodeType,
        template: template || undefined,
        priority,
        total_labels: totalLabels,
        printer_name: printerName || undefined,
        requested_by: requestedBy || undefined,
        paper_size: paperSize || undefined,
        label_dimensions: labelDimensions || undefined,
        notes: notes || undefined,
      } as any)
      addToast({ type: 'success', title: 'Print job created successfully' })
      router.push('/inventory/barcode-print')
    } catch (err) {
      console.error('Error creating print job:', err)
      addToast({ type: 'error', title: 'Failed to create print job' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <TwoLevelLayout>
      <Header
        title="New Print Job"
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Barcode Print', href: '/inventory/barcode-print' },
          { label: 'New Job' },
        ]}
        compact
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <button
          onClick={() => router.push('/inventory/barcode-print')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          Back to Barcode Print
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Job Details</CardTitle>
                <CardDescription>Configure the barcode print job</CardDescription>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Label htmlFor="template">Template</Label>
                    <Input
                      id="template"
                      placeholder="e.g. standard-label, price-tag"
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="printerName">Printer Name</Label>
                    <Input
                      id="printerName"
                      placeholder="e.g. Zebra ZD420, Brother QL-820NWB"
                      value={printerName}
                      onChange={(e) => setPrinterName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requestedBy">Requested By</Label>
                    <Input
                      id="requestedBy"
                      placeholder="e.g. Warehouse Team"
                      value={requestedBy}
                      onChange={(e) => setRequestedBy(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="paperSize">Paper Size</Label>
                    <Input
                      id="paperSize"
                      placeholder="e.g. 100x50mm, A4, Roll"
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value)}
                    />
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
                  <CardDescription>Submit or cancel this print job</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Print Job'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/inventory/barcode-print')}>
                    Cancel
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                  <CardDescription>Overview of job configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Labels</span>
                    <span className="text-xl font-bold">{totalLabels}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Type</span>
                    <span className="text-sm font-bold uppercase">{barcodeType}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Priority</span>
                    <span className="text-sm font-bold capitalize">{priority}</span>
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
