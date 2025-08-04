"use client"

import * as React from "react"
import { ModalForm } from "@/components/ui/modal-form"
import { TextField, SelectField } from "@/components/ui/form-field"
import { useToast, toast } from "@/components/ui/toast"
import { Customer, Company } from "@/types/masterdata" // Changed from User
import { customerService } from "@/services/masterdata" // Changed from userService
import { validateForm, hasErrors, commonRules } from "@/lib/validation"

interface CustomerFormProps { // Changed from UserFormProps
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null // Changed from user
  companies: Company[]
  onSuccess: () => void
}

interface CustomerFormData extends Record<string, unknown> { // Changed from UserFormData
  name: string // Changed from username
  contact_person: string // Changed from full_name
  email: string
  phone: string
  company_id: string
  status: 'active' | 'inactive'
}

const initialFormData: CustomerFormData = { // Changed from UserFormData
  name: "", // Changed from username
  contact_person: "", // Changed from full_name
  email: "",
  phone: "",
  company_id: "",
  status: "active"
}

const validationRules = {
  name: { 
    required: true, 
    minLength: 3, 
    maxLength: 100,
  },
  contact_person: { required: true, minLength: 2, maxLength: 100 }, // Changed from full_name
  email: commonRules.email,
  phone: commonRules.phone,
  company_id: { required: true },
  status: { required: true },
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
]

export function CustomerForm({ open, onOpenChange, customer, companies, onSuccess }: CustomerFormProps) { // Changed from UserForm, user
  const [formData, setFormData] = React.useState<CustomerFormData>(initialFormData) // Changed from UserFormData
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const { addToast } = useToast()
  const isEditing = Boolean(customer) // Changed from user

  // Reset form when modal opens/closes or customer changes
  React.useEffect(() => {
    if (open) {
      if (customer) { // Changed from user
        setFormData({
          name: customer.name || "", // Changed from username
          contact_person: customer.contact_person || "", // Changed from full_name
          email: customer.email || "",
          phone: customer.phone || "",
          company_id: customer.company_id || "",
          status: customer.status || "active"
        })
      } else {
        setFormData({...initialFormData})
      }
      setErrors({})
    }
  }, [open, customer]) // Changed from user

  const updateField = (field: keyof CustomerFormData, value: string) => { // Changed from UserFormData
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
        phone: formData.phone || undefined
      }
      
      if (isEditing && customer) { // Changed from user
        await customerService.update(customer.id, { data: submitData }) // Changed from userService.update
        addToast(toast.success("Customer updated successfully", `${formData.name} has been updated.`)) // Changed from User, full_name
      } else {
        await customerService.create({ data: submitData }) // Changed from userService.create
        addToast(toast.success("Customer created successfully", `${formData.name} has been added.`)) // Changed from User, full_name
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving customer:", error) // Changed from user
      addToast(toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} customer`,
        "Please check your inputs and try again."
      ))
    } finally {
      setLoading(false)
    }
  }

  const title = isEditing ? `Edit Customer - ${customer?.name}` : "Add New Customer" // Changed from User, full_name

  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name
  }))

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
            label="Customer Name" // Changed from Username
            name="name" // Changed from username
            value={formData.name} // Changed from username
            onChange={(value) => updateField("name", value)} // Changed from username
            placeholder="Enter customer name" // Changed from username
            required
            error={errors.name} // Changed from username
            disabled={loading}
          />

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

        <TextField
          label="Contact Person" // Changed from Full Name
          name="contact_person" // Changed from full_name
          value={formData.contact_person} // Changed from full_name
          onChange={(value) => updateField("contact_person", value)} // Changed from full_name
          placeholder="Enter contact person name" // Changed from full name
          required
          error={errors.contact_person} // Changed from full_name
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(value) => updateField("email", value)}
            placeholder="customer@example.com" // Changed from user@example.com
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

        <div className="grid grid-cols-1 gap-4"> {/* Changed from grid-cols-2 */}
          <SelectField
            label="Company"
            name="company_id"
            value={formData.company_id}
            onChange={(value) => updateField("company_id", value)}
            options={companyOptions}
            placeholder="Select company"
            required
            error={errors.company_id}
            disabled={loading}
          />
        </div>
      </div>
    </ModalForm>
  )
}