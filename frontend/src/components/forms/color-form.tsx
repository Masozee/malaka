"use client"

import * as React from "react"
import { ModalForm } from "@/components/ui/modal-form"
import { TextField, TextareaField, SelectField, ColorField } from "@/components/ui/form-field"
import { useToast, toast } from "@/components/ui/toast"
import { Color } from "@/types/masterdata"
import { colorService } from "@/services/masterdata"
import { validateForm, hasErrors, commonRules } from "@/lib/validation"

interface ColorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  color?: Color | null
  onSuccess: () => void
}

interface ColorFormData extends Record<string, unknown> {
  code: string
  name: string
  hex_code: string
  description: string
  status: 'active' | 'inactive'
}

const initialFormData: ColorFormData = {
  code: "",
  name: "",
  hex_code: "#000000",
  description: "",
  status: "active"
}

const validationRules = {
  code: commonRules.code,
  name: { required: true, minLength: 2, maxLength: 50 },
  hex_code: commonRules.hexColor,
  description: { maxLength: 255 },
  status: { required: true }
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
]

export function ColorForm({ open, onOpenChange, color, onSuccess }: ColorFormProps) {
  const [formData, setFormData] = React.useState<ColorFormData>(initialFormData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const { addToast } = useToast()
  const isEditing = Boolean(color)

  // Reset form when modal opens/closes or color changes
  React.useEffect(() => {
    if (open) {
      if (color) {
        setFormData({
          code: color.code || "",
          name: color.name || "",
          hex_code: color.hex_code || "#000000",
          description: color.description || "",
          status: color.status || "active"
        })
      } else {
        setFormData(initialFormData)
      }
      setErrors({})
    }
  }, [open, color])

  const updateField = (field: keyof ColorFormData, value: string) => {
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
        hex_code: formData.hex_code || undefined,
        description: formData.description || undefined
      }
      
      if (isEditing && color) {
        await colorService.update(color.id, { data: submitData })
        addToast(toast.success("Color updated successfully", `${formData.name} has been updated.`))
      } else {
        await colorService.create({ data: submitData })
        addToast(toast.success("Color created successfully", `${formData.name} has been added.`))
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving color:", error)
      addToast(toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} color`,
        "Please check your inputs and try again."
      ))
    } finally {
      setLoading(false)
    }
  }

  const title = isEditing ? `Edit Color - ${color?.name}` : "Add New Color"

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
            label="Color Code"
            name="code"
            value={formData.code}
            onChange={(value) => updateField("code", value)}
            placeholder="RED001"
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
          label="Color Name"
          name="name"
          value={formData.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Enter color name"
          required
          error={errors.name}
          disabled={loading}
        />

        <ColorField
          label="Hex Color Code"
          name="hex_code"
          value={formData.hex_code}
          onChange={(value) => updateField("hex_code", value)}
          required
          error={errors.hex_code}
          disabled={loading}
        />

        <TextareaField
          label="Description"
          name="description"
          value={formData.description}
          onChange={(value) => updateField("description", value)}
          placeholder="Enter color description (optional)"
          rows={3}
          error={errors.description}
          disabled={loading}
        />

        {/* Color Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Color Preview
          </label>
          <div className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
            <div 
              className="w-12 h-12 rounded-md border border-gray-300 dark:border-gray-600 flex-shrink-0"
              style={{ backgroundColor: formData.hex_code }}
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formData.name || "Color Name"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.hex_code}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalForm>
  )
}