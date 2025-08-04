"use client"

import * as React from "react"
import { ModalForm } from "@/components/ui/modal-form"
import { TextField, TextareaField, SelectField } from "@/components/ui/form-field"
import { useToast, toast } from "@/components/ui/toast"
import { Size } from "@/types/masterdata"
import { sizeService } from "@/services/masterdata"
import { validateForm, hasErrors, commonRules } from "@/lib/validation"

interface SizeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  size?: Size | null
  onSuccess: () => void
}

interface SizeFormData extends Record<string, unknown> {
  code: string
  name: string
  description: string
  size_category: 'shoe' | 'clothing' | 'accessory'
  sort_order: string
  status: 'active' | 'inactive'
}

const initialFormData: SizeFormData = {
  code: "",
  name: "",
  description: "",
  size_category: "shoe",
  sort_order: "",
  status: "active"
}

const validationRules = {
  code: commonRules.code,
  name: { required: true, minLength: 1, maxLength: 50 },
  description: { maxLength: 255 },
  size_category: { required: true },
  sort_order: {},
  status: { required: true }
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
]

const categoryOptions = [
  { value: "shoe", label: "Shoes" },
  { value: "clothing", label: "Clothing" },
  { value: "accessory", label: "Accessory" }
]

export function SizeForm({ open, onOpenChange, size, onSuccess }: SizeFormProps) {
  const [formData, setFormData] = React.useState<SizeFormData>(initialFormData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const { addToast } = useToast()
  const isEditing = Boolean(size)

  // Reset form when modal opens/closes or size changes
  React.useEffect(() => {
    if (open) {
      if (size) {
        setFormData({
          code: size.code || "",
          name: size.name || "",
          description: size.description || "",
          size_category: size.size_category || "shoe",
          sort_order: size.sort_order?.toString() || "",
          status: size.status || "active"
        })
      } else {
        setFormData(initialFormData)
      }
      setErrors({})
    }
  }, [open, size])

  const updateField = (field: keyof SizeFormData, value: string) => {
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
        description: formData.description || undefined,
        sort_order: formData.sort_order ? parseInt(formData.sort_order) : undefined
      }
      
      if (isEditing && size) {
        await sizeService.update(size.id, { data: submitData })
        addToast(toast.success("Size updated successfully", `${formData.name} has been updated.`))
      } else {
        await sizeService.create({ data: submitData })
        addToast(toast.success("Size created successfully", `${formData.name} has been added.`))
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving size:", error)
      addToast(toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} size`,
        "Please check your inputs and try again."
      ))
    } finally {
      setLoading(false)
    }
  }

  const title = isEditing ? `Edit Size - ${size?.name}` : "Add New Size"

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
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Size Code"
            name="code"
            value={formData.code}
            onChange={(value) => updateField("code", value)}
            placeholder="S001"
            required
            error={errors.code}
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

        <TextField
          label="Size Name"
          name="name"
          value={formData.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Enter size name"
          required
          error={errors.name}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Category"
            name="size_category"
            value={formData.size_category}
            onChange={(value) => updateField("size_category", value)}
            options={categoryOptions}
            required
            error={errors.size_category}
            disabled={loading}
          />

          <TextField
            label="Sort Order"
            name="sort_order"
            value={formData.sort_order}
            onChange={(value) => updateField("sort_order", value)}
            placeholder="Display order (optional)"
            type="number"
            error={errors.sort_order}
            disabled={loading}
          />
        </div>

        <TextareaField
          label="Description"
          name="description"
          value={formData.description}
          onChange={(value) => updateField("description", value)}
          placeholder="Enter size description (optional)"
          rows={3}
          error={errors.description}
          disabled={loading}
        />

        {/* Size Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Size Preview
          </label>
          <div className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
            <div className="w-12 h-12 rounded-md border border-gray-300 dark:border-gray-600 flex-shrink-0 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-300 font-bold text-sm">
                {formData.name || "SIZE"}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formData.name || "Size Name"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.code || "SIZE CODE"} • {categoryOptions.find(c => c.value === formData.size_category)?.label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalForm>
  )
}