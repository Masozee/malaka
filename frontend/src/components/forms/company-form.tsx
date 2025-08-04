"use client"

import * as React from "react"
import { ModalForm } from "@/components/ui/modal-form"
import { TextField, TextareaField, SelectField } from "@/components/ui/form-field"
import { useToast, toast } from "@/components/ui/toast"
import { Company } from "@/types/masterdata"
import { companyService } from "@/services/masterdata"
import { validateForm, hasErrors, commonRules } from "@/lib/validation"

interface CompanyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company | null
  onSuccess: () => void
}

interface CompanyFormData extends Record<string, unknown> {
  name: string
  email: string
  phone: string
  address: string
  status: 'active' | 'inactive'
}

const initialFormData: CompanyFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  status: "active"
}

const validationRules = {
  name: { required: true, minLength: 2, maxLength: 100 },
  email: commonRules.email,
  phone: commonRules.phone,
  address: { maxLength: 255 },
  status: { required: true }
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
]

export function CompanyForm({ open, onOpenChange, company, onSuccess }: CompanyFormProps) {
  const [formData, setFormData] = React.useState<CompanyFormData>(initialFormData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const { addToast } = useToast()
  const isEditing = Boolean(company)

  // Reset form when modal opens/closes or company changes
  React.useEffect(() => {
    if (open) {
      if (company) {
        setFormData({
          name: company.name || "",
          email: company.email || "",
          phone: company.phone || "",
          address: company.address || "",
          status: company.status || "active"
        })
      } else {
        setFormData(initialFormData)
      }
      setErrors({})
    }
  }, [open, company])

  const updateField = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = validateForm(formData, validationRules)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      // Transform form data to match API types
      const submitData = {
        ...formData,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined
      }
      
      if (isEditing && company) {
        await companyService.update(company.id, { data: submitData })
        addToast(toast.success("Company updated successfully", `${formData.name} has been updated.`))
      } else {
        await companyService.create({ data: submitData })
        addToast(toast.success("Company created successfully", `${formData.name} has been added.`))
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving company:", error)
      addToast(toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} company`,
        "Please check your inputs and try again."
      ))
    } finally {
      setLoading(false)
    }
  }

  const title = isEditing ? `Edit Company - ${company?.name}` : "Add New Company"

  return (
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      loading={loading}
      onSubmit={handleSubmit}
      size="md"
    >
      <div className="grid grid-cols-1 gap-4">
        <TextField
          label="Company Name"
          name="name"
          value={formData.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Enter company name"
          required
          error={errors.name}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(value) => updateField("email", value)}
            placeholder="company@example.com"
            required
            error={errors.email}
            disabled={loading}
          />

          <TextField
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(value) => updateField("phone", value)}
            placeholder="(555) 123-4567"
            required
            error={errors.phone}
            disabled={loading}
          />
        </div>

        <TextareaField
          label="Address"
          name="address"
          value={formData.address}
          onChange={(value) => updateField("address", value)}
          placeholder="Enter company address"
          rows={3}
          error={errors.address}
          disabled={loading}
        />

        <SelectField
          label="Status"
          name="status"
          value={formData.status}
          onChange={(value) => updateField("status", value)}
          options={statusOptions}
          required
          error={errors.status}
          disabled={loading}
        />
      </div>
    </ModalForm>
  )
}