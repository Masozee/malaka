'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { MinIOService } from '@/services/minio'
import type { Employee } from '@/types/hr'

interface ProfileImageUploadProps {
  employee: Employee
  onImageUpload?: (imageUrl: string) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  editable?: boolean
  showUploadButton?: boolean
}

export function ProfileImageUpload({ 
  employee, 
  onImageUpload, 
  size = 'md',
  editable = true,
  showUploadButton = true
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40'
  }

  const initials = (employee.employee_name || '')
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset states
    setError(null)
    setSuccess(null)
    setUploadProgress(0)

    // Validate file
    const validation = MinIOService.validateFile(file, 5, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      // Simulate upload progress (replace with actual progress if available)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await MinIOService.uploadProfileImage(employee.employee_code, file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.success) {
        setSuccess('Profile image uploaded successfully!')
        
        // Call callback if provided
        if (onImageUpload) {
          onImageUpload(response.data.fileUrl)
        }

        // Close dialog after success
        setTimeout(() => {
          setIsDialogOpen(false)
          setPreviewUrl(null)
          setUploadProgress(0)
          setSuccess(null)
        }, 2000)
      } else {
        throw new Error(response.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading profile image:', error)
      setError(error instanceof Error ? error.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleCancelUpload = () => {
    setPreviewUrl(null)
    setError(null)
    setSuccess(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const currentImageUrl = employee.profile_image_url || previewUrl

  return (
    <div className="flex items-center space-x-4">
      {/* Avatar Display */}
      <div className="relative group">
        <Avatar className={sizeClasses[size]}>
          {currentImageUrl && (
            <AvatarImage 
              src={currentImageUrl} 
              alt={employee.employee_name}
              className="object-cover"
            />
          )}
          <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Overlay for editable mode */}
        {editable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center cursor-pointer">
            <Camera className="h-6 w-6 text-white" onClick={() => setIsDialogOpen(true)} />
          </div>
        )}
      </div>

      {/* Upload Button */}
      {showUploadButton && editable && (
        <div className="space-y-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                {currentImageUrl ? 'Change Photo' : 'Add Photo'}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Profile Image</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Current/Preview Image */}
                <div className="flex justify-center">
                  <Avatar className="h-32 w-32">
                    {(currentImageUrl || previewUrl) && (
                      <AvatarImage 
                        src={previewUrl || currentImageUrl} 
                        alt={employee.employee_name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">{success}</span>
                  </div>
                )}

                {/* File Requirements */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Maximum file size: 5MB</p>
                  <p>• Supported formats: JPEG, PNG, WebP</p>
                  <p>• Recommended: Square images (1:1 ratio)</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {!uploading && (
                    <>
                      <Button 
                        onClick={triggerFileInput}
                        className="flex-1"
                        disabled={uploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Select Image
                      </Button>
                      
                      {previewUrl && (
                        <Button 
                          variant="outline"
                          onClick={handleCancelUpload}
                          disabled={uploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Upload Status Badge */}
          {currentImageUrl && (
            <Badge variant="secondary" className="text-xs">
              <Camera className="h-3 w-3 mr-1" />
              Photo uploaded
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export default ProfileImageUpload