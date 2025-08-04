"use client"

import * as React from "react"
import { ModalForm } from "@/components/ui/modal-form"
import { TextField, SelectField } from "@/components/ui/form-field"
import { useToast, toast } from "@/components/ui/toast"
import { User, Company } from "@/types/masterdata"
import { userService } from "@/services/masterdata"
import { validateForm, hasErrors, commonRules } from "@/lib/validation"

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  companies: Company[]
  onSuccess: () => void
}

interface UserFormData extends Record<string, unknown> {
  username: string
  email: string
  full_name: string
  phone: string
  role: 'admin' | 'manager' | 'user'
  company_id: string
  status: 'active' | 'inactive'
  password?: string
}

const initialFormData: UserFormData = {
  username: "",
  email: "",
  full_name: "",
  phone: "",
  role: "user",
  company_id: "",
  status: "active"
}

const validationRules = {
  username: { 
    required: true, 
    minLength: 3, 
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
    custom: (value: string) => {
      if (value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
        return 'Username can only contain letters, numbers, hyphens, and underscores'
      }
      return undefined
    }
  },
  email: commonRules.email,
  full_name: { required: true, minLength: 2, maxLength: 100 },
  phone: commonRules.phone,
  role: { required: true },
  company_id: { required: true },
  status: { required: true },
  password: { 
    minLength: 6, 
    maxLength: 100
  }
}

const roleOptions = [
  { value: "user", label: "User" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" }
]

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
]

export function UserForm({ open, onOpenChange, user, companies, onSuccess }: UserFormProps) {
  const [formData, setFormData] = React.useState<UserFormData>(initialFormData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const { addToast } = useToast()
  const isEditing = Boolean(user)

  // Reset form when modal opens/closes or user changes
  React.useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          username: user.username || "",
          email: user.email || "",
          full_name: user.full_name || "",
          phone: user.phone || "",
          role: user.role || "user",
          company_id: user.company_id || "",
          status: user.status || "active"
        })
      } else {
        setFormData({...initialFormData, password: ""})
      }
      setErrors({})
    }
  }, [open, user])

  const updateField = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create validation rules based on editing state
    const currentValidationRules = { ...validationRules }
    if (isEditing) {
      // Password is optional when editing - remove required validation
      currentValidationRules.password = { 
        minLength: 6, 
        maxLength: 100
      }
    }
    
    // Validate form
    const validationErrors = validateForm(formData, currentValidationRules)
    
    // Custom validation for password when creating new user
    if (!isEditing && !formData.password) {
      validationErrors.password = 'Password is required for new users'
    }
    
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

      // Only include password if it's provided
      if (!formData.password) {
        delete submitData.password
      }
      
      if (isEditing && user) {
        await userService.update(user.id, { data: submitData })
        addToast(toast.success("User updated successfully", `${formData.full_name} has been updated.`))
      } else {
        await userService.create({ data: submitData })
        addToast(toast.success("User created successfully", `${formData.full_name} has been added.`))
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving user:", error)
      addToast(toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} user`,
        "Please check your inputs and try again."
      ))
    } finally {
      setLoading(false)
    }
  }

  const title = isEditing ? `Edit User - ${user?.full_name}` : "Add New User"

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
            label="Username"
            name="username"
            value={formData.username}
            onChange={(value) => updateField("username", value)}
            placeholder="Enter username"
            required
            error={errors.username}
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
          label="Full Name"
          name="full_name"
          value={formData.full_name}
          onChange={(value) => updateField("full_name", value)}
          placeholder="Enter full name"
          required
          error={errors.full_name}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(value) => updateField("email", value)}
            placeholder="user@example.com"
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

        <div className="grid grid-cols-2 gap-4">
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

          <SelectField
            label="Role"
            name="role"
            value={formData.role}
            onChange={(value) => updateField("role", value as 'admin' | 'manager' | 'user')}
            options={roleOptions}
            required
            error={errors.role}
            disabled={loading}
          />
        </div>

        <TextField
          label={isEditing ? "New Password (leave blank to keep current)" : "Password"}
          name="password"
          type="password"
          value={formData.password || ""}
          onChange={(value) => updateField("password", value)}
          placeholder={isEditing ? "Enter new password" : "Enter password"}
          required={!isEditing}
          error={errors.password}
          disabled={loading}
        />
      </div>
    </ModalForm>
  )
}