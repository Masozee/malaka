'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Calculator } from 'lucide-react'
import type { CreateJournalEntryRequest, UpdateJournalEntryRequest, JournalEntry } from '@/types/accounting'
import { mockChartOfAccounts, mockCostCenters } from '@/services/accounting'

interface JournalEntryLine {
  id?: string
  account_id: string
  description: string
  debit_amount: number
  credit_amount: number
  reference?: string
  cost_center_id?: string
}

interface JournalEntryFormData {
  reference: string
  description: string
  entry_date: string
  source_document?: string
  journal_entry_lines: JournalEntryLine[]
}

interface JournalEntryFormProps {
  journalEntry?: JournalEntry
  onSubmit: (request: CreateJournalEntryRequest | UpdateJournalEntryRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function JournalEntryForm({ journalEntry, onSubmit, onCancel, loading = false }: JournalEntryFormProps) {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<JournalEntryFormData>({
    reference: '',
    description: '',
    entry_date: new Date().toISOString().split('T')[0],
    source_document: '',
    journal_entry_lines: [
      {
        account_id: '',
        description: '',
        debit_amount: 0,
        credit_amount: 0,
        reference: '',
        cost_center_id: ''
      }
    ]
  })

  useEffect(() => {
    setMounted(true)
    
    // Populate form if editing existing entry
    if (journalEntry) {
      setFormData({
        reference: journalEntry.reference,
        description: journalEntry.description,
        entry_date: journalEntry.entry_date,
        source_document: journalEntry.source_document || '',
        journal_entry_lines: journalEntry.journal_entry_lines.map(line => ({
          id: line.id,
          account_id: line.account_id,
          description: line.description,
          debit_amount: line.debit_amount,
          credit_amount: line.credit_amount,
          reference: line.reference || '',
          cost_center_id: line.cost_center_id || ''
        }))
      })
    }
  }, [journalEntry])

  const handleInputChange = (field: keyof JournalEntryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLineChange = (index: number, field: keyof JournalEntryLine, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      journal_entry_lines: prev.journal_entry_lines.map((line, i) =>
        i === index ? { ...line, [field]: value } : line
      )
    }))
  }

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      journal_entry_lines: [
        ...prev.journal_entry_lines,
        {
          account_id: '',
          description: '',
          debit_amount: 0,
          credit_amount: 0,
          reference: '',
          cost_center_id: ''
        }
      ]
    }))
  }

  const removeLine = (index: number) => {
    if (formData.journal_entry_lines.length > 1) {
      setFormData(prev => ({
        ...prev,
        journal_entry_lines: prev.journal_entry_lines.filter((_, i) => i !== index)
      }))
    }
  }

  const calculateTotals = () => {
    const totalDebit = formData.journal_entry_lines.reduce((sum, line) => sum + line.debit_amount, 0)
    const totalCredit = formData.journal_entry_lines.reduce((sum, line) => sum + line.credit_amount, 0)
    return { totalDebit, totalCredit, difference: Math.abs(totalDebit - totalCredit) }
  }

  const { totalDebit, totalCredit, difference } = calculateTotals()
  const isBalanced = difference === 0 && totalDebit > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isBalanced) {
      alert('Journal entry must be balanced (total debits must equal total credits)')
      return
    }

    try {
      await onSubmit({
        data: {
          reference: formData.reference,
          description: formData.description,
          entry_date: formData.entry_date,
          source_document: formData.source_document,
          journal_entry_lines: formData.journal_entry_lines.filter(line => 
            line.account_id && (line.debit_amount > 0 || line.credit_amount > 0)
          )
        }
      })
    } catch (error) {
      console.error('Error submitting journal entry:', error)
    }
  }

  const getAccountName = (accountId: string) => {
    const account = mockChartOfAccounts.find(acc => acc.id === accountId)
    return account ? `${account.account_code} - ${account.account_name}` : ''
  }

  const getCostCenterName = (costCenterId: string) => {
    const costCenter = mockCostCenters.find(cc => cc.id === costCenterId)
    return costCenter ? `${costCenter.code} - ${costCenter.name}` : ''
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Journal Entry Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reference">Reference *</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              placeholder="e.g., PJ-001, GL-001"
              required
            />
          </div>

          <div>
            <Label htmlFor="entry_date">Entry Date *</Label>
            <Input
              id="entry_date"
              type="date"
              value={formData.entry_date}
              onChange={(e) => handleInputChange('entry_date', e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the journal entry transaction"
              required
            />
          </div>

          <div>
            <Label htmlFor="source_document">Source Document</Label>
            <Input
              id="source_document"
              value={formData.source_document}
              onChange={(e) => handleInputChange('source_document', e.target.value)}
              placeholder="e.g., Invoice INV-001, PO-001"
            />
          </div>
        </div>
      </Card>

      {/* Journal Entry Lines */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Journal Entry Lines</h3>
          <Button type="button" onClick={addLine} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Line
          </Button>
        </div>

        <div className="space-y-4">
          {formData.journal_entry_lines.map((line, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
              <div className="col-span-3">
                <Label htmlFor={`account_${index}`}>Account *</Label>
                <Select
                  value={line.account_id}
                  onValueChange={(value) => handleLineChange(index, 'account_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {mounted && mockChartOfAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_code} - {account.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Label htmlFor={`description_${index}`}>Description *</Label>
                <Input
                  id={`description_${index}`}
                  value={line.description}
                  onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                  placeholder="Line description"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor={`debit_${index}`}>Debit (IDR)</Label>
                <Input
                  id={`debit_${index}`}
                  type="number"
                  value={line.debit_amount || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    handleLineChange(index, 'debit_amount', value)
                    // Clear credit when debit is entered
                    if (value > 0) {
                      handleLineChange(index, 'credit_amount', 0)
                    }
                  }}
                  placeholder="0"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor={`credit_${index}`}>Credit (IDR)</Label>
                <Input
                  id={`credit_${index}`}
                  type="number"
                  value={line.credit_amount || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    handleLineChange(index, 'credit_amount', value)
                    // Clear debit when credit is entered
                    if (value > 0) {
                      handleLineChange(index, 'debit_amount', 0)
                    }
                  }}
                  placeholder="0"
                />
              </div>

              <div className="col-span-1">
                <Label htmlFor={`cost_center_${index}`}>Cost Center</Label>
                <Select
                  value={line.cost_center_id || ''}
                  onValueChange={(value) => handleLineChange(index, 'cost_center_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="CC" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {mounted && mockCostCenters.map((cc) => (
                      <SelectItem key={cc.id} value={cc.id}>
                        {cc.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1 flex items-end">
                <Button
                  type="button"
                  onClick={() => removeLine(index)}
                  variant="outline"
                  size="sm"
                  disabled={formData.journal_entry_lines.length === 1}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <Calculator className="h-4 w-4 text-gray-500" />
              <span>Total Debit: {mounted ? totalDebit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : 'Rp 0'}</span>
              <span>Total Credit: {mounted ? totalCredit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : 'Rp 0'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                Difference: {mounted ? difference.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : 'Rp 0'}
              </span>
              <Badge className={isBalanced ? 'bg-green-500' : 'bg-red-500'}>
                {isBalanced ? 'Balanced' : 'Unbalanced'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !isBalanced}
          className="min-w-[120px]"
        >
          {loading ? 'Saving...' : journalEntry ? 'Update Entry' : 'Create Entry'}
        </Button>
      </div>
    </form>
  )
}