"use client"

import * as React from "react"
import { ModalForm } from "@/components/ui/modal-form"
import { TextField, SelectField } from "@/components/ui/form-field"
import { useToast, toast } from "@/components/ui/toast"
import { Division } from "@/types/masterdata"
import { divisionService } from "@/services/masterdata"
import { validateForm, hasErrors, commonRules } from "@/lib/validation"

interface DivisionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  division?: Division | null
  onSuccess: () => void
}

interface DivisionFormData extends Record<string, unknown> {
  code: string
  name: string
  description: string
  parent_id: string
  level: number
  sort_order: number
  status: 'active' | 'inactive'
}

const initialFormData: DivisionFormData = {
  code: "",
  name: "",
  description: "",
  parent_id: "",
  level: 0,
  sort_order: 0,
  status: "active"
}

const validationRules = {
  code: { required: true, minLength: 2, maxLength: 50 },
  name: { required: true, minLength: 2, maxLength: 100 },
  description: { maxLength: 255 },
  parent_id: {},
  level: { required: true, min: 0 },
  sort_order: { required: true, min: 0 },
  status: { required: true },
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
]

export function DivisionForm({ open, onOpenChange, division, onSuccess }: DivisionFormProps) {
  const [formData, setFormData] = React.useState<DivisionFormData>(initialFormData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const { addToast } = useToast()
  const isEditing = Boolean(division)

  // Fetch all divisions to populate parent_id select field
  const [allDivisions, setAllDivisions] = React.useState<Division[]>([])
  React.useEffect(() => {
    const fetchAllDivisions = async () => {
      try {
        const response = await divisionService.getAll({ limit: 9999 }) // Fetch all for parent selection
        setAllDivisions(response.data)
      } catch (error) {
        console.error('Error fetching all divisions:', error)
      }
    }
    if (open) {
      fetchAllDivisions()
    }
  }, [open])

  // Reset form when modal opens/closes or division changes
  React.useEffect(() => {
    if (open) {
      if (division) {
        setFormData({
          code: division.code || "",
          name: division.name || "",
          description: division.description || "",
          parent_id: division.parent_id || "",
          level: division.level || 0,
          sort_order: division.sort_order || 0,
          status: division.status || "active"
        })
      } else {
        setFormData(initialFormData)
      }
      setErrors({})
    }
  }, [open, division])

  const updateField = (field: keyof DivisionFormData, value: string | number) => {
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
        parent_id: formData.parent_id || undefined, // Allow null/empty for root divisions
        level: Number(formData.level),
        sort_order: Number(formData.sort_order),
      }
      
      if (isEditing && division) {
        await divisionService.update(division.id, { data: submitData })
        addToast(toast.success("Division updated successfully", `${formData.name} has been updated.`))
      } else {
        await divisionService.create({ data: submitData })
        addToast(toast.success("Division created successfully", `${formData.name} has been added.`))
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving division:", error)
      addToast(toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} division`,
        "Please check your inputs and try again."
      ))
    } finally {
      setLoading(false)
    }
  }

  const title = isEditing ? `Edit Division - ${division?.name}` : "Add New Division"

  const parentDivisionOptions = allDivisions
    .filter(d => !isEditing || d.id !== division?.id) // Prevent selecting self as parent
    .map(d => ({
      value: d.id,
      label: `${d.name} (${d.code})`
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
            label="Code"
            name="code"
            value={formData.code}
            onChange={(value) => updateField("code", value)}
            placeholder="Enter division code"
            required
            error={errors.code}
            disabled={loading}
          />

          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Enter division name"
            required
            error={errors.name}
            disabled={loading}
          />
        </div>

        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={(value) => updateField("description", value)}
          placeholder="Enter description (optional)"
          error={errors.description}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Parent Division"
            name="parent_id"
            value={formData.parent_id}
            onChange={(value) => updateField("parent_id", value)}
            options={[{ value: "", label: "None (Root Division)" }, ...parentDivisionOptions]}
            placeholder="Select parent division"
            error={errors.parent_id}
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

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Level"
            name="level"
            type="number"
            value={String(formData.level)}
            onChange={(value) => updateField("level", Number(value))}
            placeholder="Enter level"
            required
            error={errors.level}
            disabled={loading}
          />

          <TextField
            label="Sort Order"
            name="sort_order"
            type="number"
            value={String(formData.sort_order)}
            onChange={(value) => updateField("sort_order", Number(value))}
            placeholder="Enter sort order"
            required
            error={errors.sort_order}
            disabled={loading}
          />
        </div>
      </div>
    </ModalForm>
  )
}