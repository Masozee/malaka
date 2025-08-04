"use client"

import * as React from "react"
import { ModalForm } from "@/components/ui/modal-form"
import { TextField, TextareaField, SelectField } from "@/components/ui/form-field"
import { useToast, toast } from "@/components/ui/toast"
import { Article, Classification } from "@/types/masterdata"
import { articleService, classificationService } from "@/services/masterdata"
import { validateForm, hasErrors, commonRules } from "@/lib/validation"

interface ArticleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article?: Article | null
  onSuccess: () => void
}

interface ArticleFormData extends Record<string, unknown> {
  code: string
  name: string
  brand: string
  category: string
  classification_id: string
  gender: 'male' | 'female' | 'unisex' | ''
  description: string
  status: 'active' | 'inactive' | 'discontinued'
}

const initialFormData: ArticleFormData = {
  code: "",
  name: "",
  brand: "",
  category: "",
  classification_id: "",
  gender: "not_specified",
  description: "",
  status: "active"
}

const validationRules = {
  code: commonRules.code,
  name: { required: true, minLength: 2, maxLength: 100 },
  brand: { maxLength: 50 },
  category: { maxLength: 50 },
  classification_id: { required: true },
  gender: { maxLength: 20 },
  description: { maxLength: 500 },
  status: { required: true }
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "discontinued", label: "Discontinued" }
]

const genderOptions = [
  { value: "not_specified", label: "Not specified" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
  { value: "kids", label: "Kids" }
]

export function ArticleForm({ open, onOpenChange, article, onSuccess }: ArticleFormProps) {
  const [formData, setFormData] = React.useState<ArticleFormData>(initialFormData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [classifications, setClassifications] = React.useState<Classification[]>([])
  const { addToast } = useToast()
  const isEditing = Boolean(article)

  // Fetch classifications on mount
  React.useEffect(() => {
    const fetchClassifications = async () => {
      try {
        const response = await classificationService.getAll()
        setClassifications(response.data)
      } catch (error) {
        console.error("Error fetching classifications:", error)
      }
    }
    fetchClassifications()
  }, [])

  // Reset form when modal opens/closes or article changes
  React.useEffect(() => {
    if (open) {
      if (article) {
        setFormData({
          code: article.code || "",
          name: article.name || "",
          brand: article.brand || "",
          category: article.category || "",
          classification_id: article.classification_id || "",
          gender: article.gender || "not_specified",
          description: article.description || "",
          status: article.status || "active"
        })
      } else {
        setFormData(initialFormData)
      }
      setErrors({})
    }
  }, [open, article])

  const updateField = (field: keyof ArticleFormData, value: string) => {
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
        gender: formData.gender === "not_specified" ? undefined : formData.gender, // Convert not_specified to undefined
        brand: formData.brand || undefined,
        category: formData.category || undefined,
        description: formData.description || undefined
      }
      
      if (isEditing && article) {
        await articleService.update(article.id, { data: submitData })
        addToast(toast.success("Article updated successfully", `${formData.name} has been updated.`))
      } else {
        await articleService.create({ data: submitData })
        addToast(toast.success("Article created successfully", `${formData.name} has been added.`))
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving article:", error)
      addToast(toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} article`,
        "Please check your inputs and try again."
      ))
    } finally {
      setLoading(false)
    }
  }

  const title = isEditing ? `Edit Article - ${article?.name}` : "Add New Article"

  const classificationOptions = React.useMemo(() => 
    classifications.map(classification => ({
      value: classification.id,
      label: classification.name
    })), [classifications]
  )

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
            label="Article Code"
            name="code"
            value={formData.code}
            onChange={(value) => updateField("code", value)}
            placeholder="ART001"
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
          label="Article Name"
          name="name"
          value={formData.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Enter article name"
          required
          error={errors.name}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={(value) => updateField("brand", value)}
            placeholder="Enter brand name"
            error={errors.brand}
            disabled={loading}
          />

          <TextField
            label="Category"
            name="category"
            value={formData.category}
            onChange={(value) => updateField("category", value)}
            placeholder="Enter category"
            error={errors.category}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Classification"
            name="classification_id"
            value={formData.classification_id}
            onChange={(value) => updateField("classification_id", value)}
            options={classificationOptions}
            placeholder="Select classification"
            required
            error={errors.classification_id}
            disabled={loading}
          />

          <SelectField
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={(value) => updateField("gender", value)}
            options={genderOptions}
            error={errors.gender}
            disabled={loading}
          />
        </div>

        <TextareaField
          label="Description"
          name="description"
          value={formData.description}
          onChange={(value) => updateField("description", value)}
          placeholder="Enter article description"
          rows={3}
          error={errors.description}
          disabled={loading}
        />
      </div>
    </ModalForm>
  )
}