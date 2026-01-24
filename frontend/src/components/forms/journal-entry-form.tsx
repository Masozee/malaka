"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  DeleteIcon,
  CalculatorIcon
} from "@hugeicons/core-free-icons"

import * as React from "react"

import { ModalForm } from "@/components/ui/modal-form"
import { TextField, TextareaField, SelectField } from "@/components/ui/form-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast, toast } from "@/components/ui/toast"
import { GeneralLedgerEntry, ChartOfAccount, CostCenter } from "@/types/accounting"
import { journalEntryService } from "@/services/accounting"
import { validateForm, hasErrors } from "@/lib/validation"

interface JournalEntryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: GeneralLedgerEntry | null
  accounts: ChartOfAccount[]
  costCenters: CostCenter[]
  onSuccess: () => void
}

interface JournalEntryLine {
  id?: string
  account_id: string
  description: string
  debit_amount: number
  credit_amount: number
  reference?: string
  cost_center_id?: string
}

interface JournalEntryFormData extends Record<string, unknown> {
  reference: string
  description: string
  entry_date: string
  source_document: string
  journal_entry_lines: JournalEntryLine[]
}

const initialFormData: JournalEntryFormData = {
  reference: "",
  description: "",
  entry_date: new Date().toISOString().split('T')[0],
  source_document: "",
  journal_entry_lines: [
    {
      account_id: "",
      description: "",
      debit_amount: 0,
      credit_amount: 0,
      reference: "",
      cost_center_id: ""
    },
    {
      account_id: "",
      description: "",
      debit_amount: 0,
      credit_amount: 0,
      reference: "",
      cost_center_id: ""
    }
  ]
}

const validationRules = {
  reference: { required: true, minLength: 1, maxLength: 50 },
  description: { required: true, minLength: 3, maxLength: 255 },
  entry_date: { required: true },
  source_document: { maxLength: 100 },
  journal_entry_lines: { required: true }
}

export function JournalEntryForm({ 
  open, 
  onOpenChange, 
  entry, 
  accounts, 
  costCenters, 
  onSuccess 
}: JournalEntryFormProps) {
  const [formData, setFormData] = React.useState<JournalEntryFormData>(initialFormData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [lineErrors, setLineErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const { addToast } = useToast()
  const isEditing = Boolean(entry)

  // Reset form when modal opens/closes or entry changes
  React.useEffect(() => {
    if (open) {
      if (entry) {
        // Load existing entry data - would need to fetch full journal entry
        setFormData({
          reference: entry.reference || "",
          description: entry.description || "",
          entry_date: entry.entry_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          source_document: entry.source_document || "",
          journal_entry_lines: [
            {
              account_id: entry.account_id,
              description: entry.description,
              debit_amount: entry.debit_amount,
              credit_amount: entry.credit_amount,
              reference: entry.reference || "",
              cost_center_id: entry.cost_center_id || ""
            }
          ]
        })
      } else {
        setFormData(initialFormData)
      }
      setErrors({})
      setLineErrors({})
    }
  }, [open, entry])

  const updateField = (field: keyof JournalEntryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const updateLine = (index: number, field: keyof JournalEntryLine, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      journal_entry_lines: prev.journal_entry_lines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }))
    
    // Clear line-specific errors
    const errorKey = `line_${index}_${field}`
    if (lineErrors[errorKey]) {
      setLineErrors(prev => ({ ...prev, [errorKey]: "" }))
    }
  }

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      journal_entry_lines: [
        ...prev.journal_entry_lines,
        {
          account_id: "",
          description: "",
          debit_amount: 0,
          credit_amount: 0,
          reference: "",
          cost_center_id: ""
        }
      ]
    }))
  }

  const removeLine = (index: number) => {
    if (formData.journal_entry_lines.length > 2) {
      setFormData(prev => ({
        ...prev,
        journal_entry_lines: prev.journal_entry_lines.filter((_, i) => i !== index)
      }))
    }
  }

  const calculateTotals = () => {
    const totalDebits = formData.journal_entry_lines.reduce((sum, line) => sum + line.debit_amount, 0)
    const totalCredits = formData.journal_entry_lines.reduce((sum, line) => sum + line.credit_amount, 0)
    return { totalDebits, totalCredits, difference: totalDebits - totalCredits }
  }

  const validateJournalEntry = () => {
    const newLineErrors: Record<string, string> = {}
    const { totalDebits, totalCredits } = calculateTotals()

    // Check if entry is balanced
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      newLineErrors.balance = "Debits and credits must be equal"
    }

    // Validate each line
    formData.journal_entry_lines.forEach((line, index) => {
      if (!line.account_id) {
        newLineErrors[`line_${index}_account_id`] = "Account is required"
      }
      if (!line.description) {
        newLineErrors[`line_${index}_description`] = "Description is required"
      }
      if (line.debit_amount === 0 && line.credit_amount === 0) {
        newLineErrors[`line_${index}_amount`] = "Either debit or credit amount must be greater than 0"
      }
      if (line.debit_amount > 0 && line.credit_amount > 0) {
        newLineErrors[`line_${index}_amount`] = "Cannot have both debit and credit amounts"
      }
    })

    setLineErrors(newLineErrors)
    return Object.keys(newLineErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate basic form data
    const validationErrors = validateForm(formData, validationRules)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    // Validate journal entry specific rules
    if (!validateJournalEntry()) {
      return
    }

    setLoading(true)
    try {
      const submitData = {
        reference: formData.reference,
        description: formData.description,
        entry_date: formData.entry_date,
        source_document: formData.source_document || undefined,
        journal_entry_lines: formData.journal_entry_lines.map(line => ({
          account_id: line.account_id,
          description: line.description,
          debit_amount: line.debit_amount,
          credit_amount: line.credit_amount,
          reference: line.reference || undefined,
          cost_center_id: line.cost_center_id || undefined
        }))
      }
      
      if (isEditing && entry) {
        // For editing, we would need the journal entry ID
        // await journalEntryService.update(entry.journal_entry_id, { data: submitData })
        addToast(toast.info("Edit functionality", "Journal entry editing will be implemented."))
      } else {
        await journalEntryService.create({ data: submitData })
        addToast(toast.success("Journal entry created", "The journal entry has been saved successfully."))
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving journal entry:", error)
      addToast(toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} journal entry`,
        "Please check your inputs and try again."
      ))
    } finally {
      setLoading(false)
    }
  }

  const title = isEditing ? "Edit Journal Entry" : "New Journal Entry"
  const { totalDebits, totalCredits, difference } = calculateTotals()
  const isBalanced = Math.abs(difference) < 0.01

  const accountOptions = accounts.map(account => ({
    value: account.id,
    label: `${account.account_code} - ${account.account_name}`
  }))

  const costCenterOptions = [
    { value: "", label: "No Cost Center" },
    ...costCenters.map(cc => ({
      value: cc.id,
      label: `${cc.code} - ${cc.name}`
    }))
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      loading={loading}
      onSubmit={handleSubmit}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Information */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Reference"
            name="reference"
            value={formData.reference}
            onChange={(value) => updateField("reference", value)}
            placeholder="Enter reference number"
            required
            error={errors.reference}
            disabled={loading}
          />

          <TextField
            label="Entry Date"
            name="entry_date"
            type="date"
            value={formData.entry_date}
            onChange={(value) => updateField("entry_date", value)}
            required
            error={errors.entry_date}
            disabled={loading}
          />
        </div>

        <TextareaField
          label="Description"
          name="description"
          value={formData.description}
          onChange={(value) => updateField("description", value)}
          placeholder="Enter journal entry description"
          required
          error={errors.description}
          disabled={loading}
          rows={2}
        />

        <TextField
          label="Source Document"
          name="source_document"
          value={formData.source_document}
          onChange={(value) => updateField("source_document", value)}
          placeholder="Enter source document reference (optional)"
          error={errors.source_document}
          disabled={loading}
        />

        {/* Journal Entry Lines */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Journal Entry Lines</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLine}
                disabled={loading}
              >
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.journal_entry_lines.map((line, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">Line {index + 1}</span>
                  {formData.journal_entry_lines.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(index)}
                      disabled={loading}
                    >
                      <HugeiconsIcon icon={DeleteIcon} className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Account"
                    name={`account_${index}`}
                    value={line.account_id}
                    onChange={(value) => updateLine(index, "account_id", value)}
                    options={accountOptions}
                    placeholder="Select account"
                    required
                    error={lineErrors[`line_${index}_account_id`]}
                    disabled={loading}
                  />

                  <SelectField
                    label="Cost Center"
                    name={`cost_center_${index}`}
                    value={line.cost_center_id || ""}
                    onChange={(value) => updateLine(index, "cost_center_id", value)}
                    options={costCenterOptions}
                    error={lineErrors[`line_${index}_cost_center_id`]}
                    disabled={loading}
                  />
                </div>

                <TextareaField
                  label="Description"
                  name={`description_${index}`}
                  value={line.description}
                  onChange={(value) => updateLine(index, "description", value)}
                  placeholder="Enter line description"
                  required
                  error={lineErrors[`line_${index}_description`]}
                  disabled={loading}
                  rows={2}
                />

                <div className="grid grid-cols-3 gap-4">
                  <TextField
                    label="Debit Amount"
                    name={`debit_${index}`}
                    type="number"
                    value={line.debit_amount.toString()}
                    onChange={(value) => updateLine(index, "debit_amount", parseFloat(value) || 0)}
                    placeholder="0.00"
                    error={lineErrors[`line_${index}_amount`]}
                    disabled={loading}
                  />

                  <TextField
                    label="Credit Amount"
                    name={`credit_${index}`}
                    type="number"
                    value={line.credit_amount.toString()}
                    onChange={(value) => updateLine(index, "credit_amount", parseFloat(value) || 0)}
                    placeholder="0.00"
                    error={lineErrors[`line_${index}_amount`]}
                    disabled={loading}
                  />

                  <TextField
                    label="Reference"
                    name={`reference_${index}`}
                    value={line.reference || ""}
                    onChange={(value) => updateLine(index, "reference", value)}
                    placeholder="Line reference (optional)"
                    disabled={loading}
                  />
                </div>
              </div>
            ))}

            {/* Totals Summary */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-500 dark:text-gray-400">Total Debits</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(totalDebits)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-500 dark:text-gray-400">Total Credits</div>
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(totalCredits)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-500 dark:text-gray-400">Difference</div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`text-lg font-bold ${
                      isBalanced ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(difference))}
                    </div>
                    {isBalanced ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Balanced
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        Out of Balance
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {lineErrors.balance && (
                <div className="text-sm text-red-500 mt-2 text-center">
                  {lineErrors.balance}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModalForm>
  )
}