"use client"

import * as React from "react"
import { ModalForm } from "@/components/ui/modal-form"
import { TextField, TextareaField, SelectField } from "@/components/ui/form-field"
import { useToast, toast } from "@/components/ui/toast"
import { Model } from "@/types/masterdata"
import { modelService } from "@/services/masterdata"
import { validateForm, hasErrors, commonRules } from "@/lib/validation"

interface ModelFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  model?: Model | null
  onSuccess: () => void
}

interface ModelFormData extends Record<string, unknown> {
  code: string
  name: string
  description: string
  article_id: string
  status: 'active' | 'inactive'
}

const initialFormData: ModelFormData = {
  code: "",
  name: "",
  description: "",
  article_id: "",
  status: "active"
}

const validationRules = {
  code: commonRules.code,
  name: { required: true, minLength: 2, maxLength: 50 },
  description: { maxLength: 255 },
  article_id: {},
  status: { required: true }
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
]

export function ModelForm({ open, onOpenChange, model, onSuccess }: ModelFormProps) {
  const [formData, setFormData] = React.useState<ModelFormData>(initialFormData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const { addToast } = useToast()
  const isEditing = Boolean(model)

  // Reset form when modal opens/closes or model changes
  React.useEffect(() => {
    if (open) {
      if (model) {
        setFormData({
          code: model.code || "",
          name: model.name || "",
          description: model.description || "",
          article_id: model.article_id || "",
          status: model.status || "active"
        })
      } else {
        setFormData(initialFormData)
      }
      setErrors({})
    }
  }, [open, model])

  const updateField = (field: keyof ModelFormData, value: string) => {
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
        article_id: formData.article_id || undefined
      }
      
      if (isEditing && model) {
        await modelService.update(model.id, { data: submitData })
        addToast(toast.success("Model updated successfully", `${formData.name} has been updated.`))
      } else {
        await modelService.create({ data: submitData })
        addToast(toast.success("Model created successfully", `${formData.name} has been added.`))
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving model:", error)
      addToast(toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} model`,
        "Please check your inputs and try again."
      ))
    } finally {
      setLoading(false)
    }
  }

  const title = isEditing ? `Edit Model - ${model?.name}` : "Add New Model"

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
            label="Model Code"
            name="code"
            value={formData.code}
            onChange={(value) => updateField("code", value)}
            placeholder="MOD001"
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
          label="Model Name"
          name="name"
          value={formData.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Enter model name"
          required
          error={errors.name}
          disabled={loading}
        />

        <TextField
          label="Article ID"
          name="article_id"
          value={formData.article_id}
          onChange={(value) => updateField("article_id", value)}
          placeholder="Enter article ID (optional)"
          error={errors.article_id}
          disabled={loading}
        />

        <TextareaField
          label="Description"
          name="description"
          value={formData.description}
          onChange={(value) => updateField("description", value)}
          placeholder="Enter model description (optional)"
          rows={3}
          error={errors.description}
          disabled={loading}
        />

        {/* Model Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Model Preview
          </label>
          <div className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
            <div className="w-12 h-12 rounded-md border border-gray-300 dark:border-gray-600 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 font-bold text-lg">
                {formData.name ? formData.name.charAt(0).toUpperCase() : "M"}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formData.name || "Model Name"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.code || "MODEL CODE"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalForm>
  )
}