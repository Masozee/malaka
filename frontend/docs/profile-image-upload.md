# Profile Image Upload Documentation

## Overview

The profile image upload functionality allows users to upload and manage profile photos for employees. Images are stored in MinIO object storage with a structured folder hierarchy for organization.

## Features

- **Secure File Upload**: Upload images to MinIO with validation
- **Multiple File Formats**: Supports JPEG, PNG, and WebP formats
- **File Size Validation**: Maximum 5MB file size limit
- **Progress Tracking**: Real-time upload progress indication
- **Folder Organization**: Structured folder hierarchy per employee
- **Image Preview**: Immediate preview of uploaded images
- **Error Handling**: Comprehensive error handling and user feedback

## Folder Structure

Images are organized in MinIO with the following structure:

```
malaka-employees/
├── {employee_code}/
│   ├── profile/          # Profile images
│   ├── attendance/       # Attendance-related documents
│   ├── documents/        # Official documents (contracts, IDs, etc.)
│   └── others/          # Miscellaneous files
```

Example:
```
malaka-employees/
├── EMP001/
│   ├── profile/
│   │   └── profile-image.jpg
│   ├── attendance/
│   ├── documents/
│   └── others/
└── EMP002/
    ├── profile/
    ├── attendance/
    ├── documents/
    └── others/
```

## Implementation

### Components

#### `ProfileImageUpload` Component

**Location**: `/src/components/hr/profile-image-upload.tsx`

**Props**:
- `employee`: Employee object with employee data
- `onImageUpload?`: Callback function when image is uploaded
- `size?`: Avatar size ('sm' | 'md' | 'lg' | 'xl')
- `editable?`: Whether the component is editable (default: true)
- `showUploadButton?`: Whether to show the upload button (default: true)

**Usage**:
```typescript
<ProfileImageUpload
  employee={employee}
  onImageUpload={handleImageUpload}
  size="lg"
  editable={true}
  showUploadButton={true}
/>
```

### Services

#### `MinIOService`

**Location**: `/src/services/minio.ts`

**Key Methods**:
- `uploadFile()`: Upload any file to MinIO with folder structure
- `uploadProfileImage()`: Specialized method for profile images with validation
- `deleteFile()`: Delete files from MinIO
- `getFileUrl()`: Get public URL for a file
- `listEmployeeFiles()`: List all files for an employee
- `createEmployeeFolders()`: Create all required folders for an employee

**Example**:
```typescript
// Upload profile image
const response = await MinIOService.uploadProfileImage(employeeCode, file)

// List all profile images
const files = await MinIOService.listEmployeeFiles(employeeCode, 'profile')

// Delete a file
await MinIOService.deleteFile(filePath)
```

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# MinIO Configuration
NEXT_PUBLIC_MINIO_URL=http://localhost:9000
NEXT_PUBLIC_MINIO_BUCKET=malaka-employees
NEXT_PUBLIC_MINIO_ACCESS_KEY=minioadmin
NEXT_PUBLIC_MINIO_SECRET_KEY=minioadmin
```

### Backend API Endpoints

The MinIO service expects these backend endpoints:

- `POST /api/v1/storage/upload` - Upload files
- `DELETE /api/v1/storage/delete` - Delete files  
- `GET /api/v1/storage/url` - Get file URLs
- `GET /api/v1/storage/list` - List files
- `POST /api/v1/storage/create-folders` - Create employee folders

## Usage Examples

### Employee Detail Page

The employee detail page shows the profile image with upload functionality:

```typescript
// Handle image upload callback
const handleImageUpload = (imageUrl: string) => {
  if (employee) {
    setEmployee({
      ...employee,
      profile_image_url: imageUrl
    })
  }
}

// Main profile display with hover upload
<ProfileImageUpload
  employee={employee}
  onImageUpload={handleImageUpload}
  size="xl"
  editable={true}
  showUploadButton={false}
/>

// Secondary upload button
<ProfileImageUpload
  employee={employee}
  onImageUpload={handleImageUpload}
  size="sm"
  editable={true}
  showUploadButton={true}
/>
```

### Employee Edit Page

The edit page includes profile image upload in the sidebar:

```typescript
// Handle image upload in form
const handleImageUpload = (imageUrl: string) => {
  setFormData(prev => ({
    ...prev,
    profile_image_url: imageUrl
  }))
  
  // Update employee state for preview
  if (employee) {
    setEmployee({
      ...employee,
      profile_image_url: imageUrl
    })
  }
}

// Profile image section in sidebar
<Card className="p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Image</h3>
  <div className="flex justify-center">
    <ProfileImageUpload
      employee={employee}
      onImageUpload={handleImageUpload}
      size="lg"
      editable={true}
      showUploadButton={true}
    />
  </div>
</Card>
```

## File Validation

### Image Files
- **Allowed Formats**: JPEG, JPG, PNG, WebP
- **Maximum Size**: 5MB
- **Recommended**: Square images (1:1 aspect ratio)

### Validation Rules
```typescript
const validation = MinIOService.validateFile(
  file, 
  5, // Max size in MB
  ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] // Allowed types
)

if (!validation.isValid) {
  console.error(validation.error)
}
```

## Error Handling

The component provides comprehensive error handling:

- **File Validation Errors**: Invalid file type or size
- **Upload Errors**: Network issues or server errors
- **Authentication Errors**: Invalid credentials or permissions
- **Storage Errors**: MinIO server issues

Error messages are displayed to users with appropriate icons and styling.

## Security Considerations

1. **File Type Validation**: Only allowed image formats are accepted
2. **File Size Limits**: Prevents large file uploads
3. **Folder Isolation**: Each employee has isolated folder structure
4. **Access Control**: Backend should implement proper access controls
5. **Sanitization**: File names are sanitized to prevent path traversal

## Backend Requirements

For the frontend to work properly, the backend must implement:

1. **MinIO Integration**: Go MinIO client for file operations
2. **API Endpoints**: REST endpoints for file operations
3. **Authentication**: JWT-based authentication for file access
4. **Validation**: Server-side file validation
5. **Error Handling**: Comprehensive error responses

## Testing

Test the functionality with:

1. **Valid Images**: Upload JPEG, PNG, WebP files under 5MB
2. **Invalid Files**: Test validation with oversized files and invalid formats
3. **Network Issues**: Test error handling with network interruptions
4. **Authentication**: Test with valid and invalid user sessions
5. **Edge Cases**: Test with special characters in filenames

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check MinIO server connection and credentials
2. **CORS Errors**: Ensure MinIO is configured for frontend domain
3. **File Not Showing**: Verify MinIO bucket public read access
4. **Progress Not Updating**: Check if progress events are supported

### Debug Tips

1. Check browser network tab for API requests
2. Verify MinIO server logs for errors
3. Ensure environment variables are set correctly
4. Test backend endpoints with curl or Postman

## Future Enhancements

Potential improvements:

1. **Image Resizing**: Automatic image resizing and optimization
2. **Multiple Images**: Support for multiple profile images
3. **Drag & Drop**: Enhanced upload interface with drag & drop
4. **Cropping**: Built-in image cropping functionality
5. **Batch Upload**: Upload multiple files at once
6. **Version History**: Keep history of profile image changes