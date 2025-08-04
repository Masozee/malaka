"use client"

import * as React from "react"
import { ModalForm } from "@/components/ui/modal-form"
import { TextField, SelectField } from "@/components/ui/form-field"
import { useToast, toast } from "@/components/ui/toast"
import { Depstore } from "@/types/masterdata"
import { depstoreService } from "@/services/masterdata"
import { validateForm, hasErrors, commonRules } from "@/lib/validation"

interface DepstoreFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  depstore?: Depstore | null
  onSuccess: () => void
}

interface DepstoreFormData extends Record<string, unknown> {
  code: string
  name: string
  address: string
  city: string
  phone: string
  contact_person: string
  commission_rate: number
  payment_terms: string
  status: 'active' | 'inactive'
}

const initialFormData: DepstoreFormData = {
  code: "",
  name: "",
  address: "",
  city: "",
  phone: "",
  contact_person: "",
  commission_rate: 0,
  payment_terms: "",
  status: "active"
}

const validationRules = {
  code: { required: true, minLength: 2, maxLength: 50 },
  name: { required: true, minLength: 2, maxLength: 100 },
  address: { required: true, minLength: 5, maxLength: 255 },
  city: { required: true, minLength: 2, maxLength: 100 },
  phone: commonRules.phone,
  contact_person: { minLength: 2, maxLength: 100 },
  commission_rate: { 
    custom: (value: string) => {
      const num = Number(value)
      if (isNaN(num)) return 'Must be a valid number'
      if (num < 0) return 'Must be 0 or greater'
      if (num > 100) return 'Must be 100 or less'
      return undefined
    }
  },
  payment_terms: { maxLength: 100 },
  status: { required: true },
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
]

export function DepstoreForm({ open, onOpenChange, depstore, onSuccess }: DepstoreFormProps) {
  const [formData, setFormData] = React.useState<DepstoreFormData>(initialFormData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const { addToast } = useToast()
  const isEditing = Boolean(depstore)

  // Reset form when modal opens/closes or depstore changes
  React.useEffect(() => {
    if (open) {
      if (depstore) {
        setFormData({
          code: depstore.code || "",
          name: depstore.name || "",
          address: depstore.address || "",
          city: depstore.city || "",
          phone: depstore.phone || "",
          contact_person: depstore.contact_person || "",
          commission_rate: depstore.commission_rate || 0,
          payment_terms: depstore.payment_terms || "",
          status: depstore.status || "active"
        })
      } else {
        setFormData(initialFormData)
      }
      setErrors({})
    }
  }, [open, depstore])

  const updateField = (field: keyof DepstoreFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm(formData, validationRules)
    
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        commission_rate: Number(formData.commission_rate),
      }
      
      if (isEditing && depstore) {
        await depstoreService.update(depstore.id, { data: submitData })
        addToast(toast.success("Department store updated successfully", `${formData.name} has been updated.`))
      } else {
        await depstoreService.create({ data: submitData })
        addToast(toast.success("Department store created successfully", `${formData.name} has been added.`))
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving department store:", error)
      addToast(toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} department store`,
        "Please check your inputs and try again."
      ))
    } finally {
      setLoading(false)
    }
  }

  const title = isEditing ? `Edit Department Store - ${depstore?.name}` : "Add New Department Store"

  return (
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      loading={loading}
      onSubmit={handleSubmit}
      size="lg"
    >
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Code"
            name="code"
            value={formData.code}
            onChange={(value) => updateField("code", value)}
            placeholder="Enter code"
            required
            error={errors.code}
            disabled={loading}
          />

          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Enter name"
            required
            error={errors.name}
            disabled={loading}
          />
        </div>

        <TextField
          label="Address"
          name="address"
          value={formData.address}
          onChange={(value) => updateField("address", value)}
          placeholder="Enter address"
          required
          error={errors.address}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="City"
            name="city"
            value={formData.city}
            onChange={(value) => updateField("city", value)}
            placeholder="Enter city"
            required
            error={errors.city}
            disabled={loading}
          />

          <TextField
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(value) => updateField("phone", value)}
            placeholder="Enter phone number"
            error={errors.phone}
            disabled={loading}
          />
        </div>

        <TextField
          label="Contact Person"
          name="contact_person"
          value={formData.contact_person}
          onChange={(value) => updateField("contact_person", value)}
          placeholder="Enter contact person name"
          error={errors.contact_person}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Commission Rate (%)"
            name="commission_rate"
            type="number"
            value={String(formData.commission_rate)}
            onChange={(value) => updateField("commission_rate", Number(value))}
            placeholder="Enter commission rate"
            error={errors.commission_rate}
            disabled={loading}
          />

          <TextField
            label="Payment Terms"
            name="payment_terms"
            value={formData.payment_terms}
            onChange={(value) => updateField("payment_terms", value)}
            placeholder="e.g., Net 30"
            error={errors.payment_terms}
            disabled={loading}
          />
        </div>

        <SelectField
          label="Status"
          name="status"
          value={formData.status}
          onChange={(value) => updateField("status", value as 'active' | 'inactive')}
          options={statusOptions}
          required
          error={errors.status}
          disabled={loading}
        />
      </div>
    </ModalForm>
  )
}