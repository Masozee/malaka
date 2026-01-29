"use client"

import * as React from "react"
import { ModalForm } from "@/components/ui/modal-form"
import { TextField, TextareaField, SelectField } from "@/components/ui/form-field"
import { useToast, toast } from "@/components/ui/toast"
import { Article, Classification } from "@/types/masterdata"
import { articleService, classificationService } from "@/services/masterdata"
import { validateForm, hasErrors, commonRules } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload02Icon, Delete01Icon, Image01Icon } from "@hugeicons/core-free-icons"

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
  gender: 'male' | 'female' | 'unisex' | 'not_specified' | ''
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

// ... existing code ...

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
        gender: (article.gender as ArticleFormData['gender']) || "not_specified",
        description: article.description || "",
        status: article.status || "active"
      })
      // Load existing images
      setExistingImages(article.image_urls || [])
    } else {
      setFormData(initialFormData)
      setExistingImages([])
    }
    // Reset pending images and errors
    setPendingImages([])
    setImagesToDelete([])
    setErrors({})
  }
}, [open, article])

// Cleanup preview URLs when component unmounts or pending images change
React.useEffect(() => {
  return () => {
    pendingImages.forEach(img => URL.revokeObjectURL(img.preview))
  }
}, [pendingImages])

// Handle file selection - creates preview without uploading
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files
  if (!files || files.length === 0) return

  const validFiles: File[] = []
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB

  Array.from(files).forEach(file => {
    if (file.size > MAX_SIZE) {
      addToast(toast.error(
        "File too large",
        `${file.name} exceeds the 10MB limit.`
      ))
    } else {
      validFiles.push(file)
    }
  })

  const newPendingImages: PendingImage[] = validFiles.map(file => ({
    file,
    preview: URL.createObjectURL(file)
  }))

  setPendingImages(prev => [...prev, ...newPendingImages])

  // Reset file input
  if (fileInputRef.current) {
    fileInputRef.current.value = ""
  }
}

// Remove pending image (not yet uploaded)
const handleRemovePendingImage = (index: number) => {
  setPendingImages(prev => {
    const updated = [...prev]
    URL.revokeObjectURL(updated[index].preview)
    updated.splice(index, 1)
    return updated
  })
}

// Mark existing image for deletion
const handleMarkImageForDeletion = (imageUrl: string) => {
  setImagesToDelete(prev => [...prev, imageUrl])
  setExistingImages(prev => prev.filter(img => img !== imageUrl))
}

const updateField = (field: keyof ArticleFormData, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }))
  // Clear error for this field when user starts typing
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: "" }))
  }
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Validate form - use different rules for create vs edit
  const rules = isEditing ? editValidationRules : createValidationRules
  const validationErrors = validateForm(formData, rules)
  if (hasErrors(validationErrors)) {
    setErrors(validationErrors)
    return
  }

  setLoading(true)
  try {
    // Transform form data to match API types
    const submitData = {
      ...formData,
      gender: formData.gender === "not_specified" ? undefined : formData.gender,
      brand: formData.brand || undefined,
      category: formData.category || undefined,
      description: formData.description || undefined
    }

    let articleId: string

    if (isEditing && article) {
      await articleService.update(article.id, { data: submitData })
      articleId = article.id
    } else {
      const created = await articleService.create({ data: submitData })
      articleId = created.id
    }

    // Handle image deletions (for existing articles)
    if (imagesToDelete.length > 0) {
      for (const imageUrl of imagesToDelete) {
        try {
          await articleService.deleteImage(articleId, imageUrl)
        } catch (error) {
          console.error("Error deleting image:", error)
        }
      }
    }

    // Handle pending image uploads
    if (pendingImages.length > 0) {
      const dataTransfer = new DataTransfer()
      pendingImages.forEach(img => dataTransfer.items.add(img.file))

      try {
        const response = await articleService.uploadImages(articleId, dataTransfer.files)
        if (response.success) {
          addToast(toast.success(
            "Images uploaded",
            `${response.data.success_count} image(s) uploaded successfully`
          ))
        }
      } catch (error) {
        console.error("Error uploading images:", error)
        addToast(toast.error("Image upload failed", "Article saved but some images failed to upload."))
      }
    }

    addToast(toast.success(
      isEditing ? "Article updated successfully" : "Article created successfully",
      `${formData.name} has been ${isEditing ? 'updated' : 'added'}.`
    ))

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
          required={!isEditing}
          error={errors.code}
          disabled={loading || isEditing}
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

      {/* Image Upload Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Product Images
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <HugeiconsIcon icon={Upload02Icon} className="h-4 w-4 mr-2" />
            Add Images
          </Button>
        </div>

        {/* Image Gallery - Existing + Pending */}
        {(existingImages.length > 0 || pendingImages.length > 0) ? (
          <div className="grid grid-cols-4 gap-3">
            {/* Existing images (already uploaded) */}
            {existingImages.map((imageUrl, index) => (
              <div
                key={`existing-${index}`}
                className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-100 dark:bg-gray-800"
              >
                <img
                  src={articleService.getImageUrl(imageUrl)}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-image.png"
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleMarkImageForDeletion(imageUrl)}
                    disabled={loading}
                  >
                    <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Pending images (not yet uploaded - preview only) */}
            {pendingImages.map((pending, index) => (
              <div
                key={`pending-${index}`}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              >
                <img
                  src={pending.preview}
                  alt={`New image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* "New" badge */}
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                  New
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemovePendingImage(index)}
                    disabled={loading}
                  >
                    <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg text-gray-400">
            <HugeiconsIcon icon={Image01Icon} className="h-10 w-10 mb-2" />
            <p className="text-sm">No images</p>
            <p className="text-xs">Click "Add Images" to add product photos</p>
          </div>
        )}

        {/* Pending changes info */}
        {(pendingImages.length > 0 || imagesToDelete.length > 0) && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {pendingImages.length > 0 && `${pendingImages.length} image(s) will be uploaded. `}
            {imagesToDelete.length > 0 && `${imagesToDelete.length} image(s) will be deleted. `}
            Changes will be applied when you save.
          </p>
        )}
      </div>
    </div>
  </ModalForm>
)
}