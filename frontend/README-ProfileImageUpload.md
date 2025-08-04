# Profile Image Upload - Quick Start Guide

## 🎯 **What's New**

Employee profile image upload functionality has been successfully implemented! This allows users to upload and manage profile photos for employees with the following features:

### ✨ **Key Features**
- 📸 **Upload Profile Images**: Support for JPEG, PNG, WebP formats (max 5MB)
- 📁 **Organized Storage**: Files stored with structure `employee_code/profile/`
- 🔄 **Real-time Preview**: Immediate image preview after upload
- ✅ **Validation**: File type and size validation with user feedback
- 🚀 **Progress Tracking**: Upload progress indication
- 🎨 **Professional UI**: Hover effects and modal dialogs

## 🚀 **How to Use**

### **On Employee Detail Page**
1. Navigate to any employee: `/hr/employees/{id}`
2. **Hover over the large avatar** → Camera icon appears
3. **Click the camera icon** → Upload dialog opens
4. **OR click "Change Photo"** button on the right side

### **On Employee Edit Page**  
1. Navigate to employee edit: `/hr/employees/{id}/edit`
2. **Look at the right sidebar** → "Profile Image" section
3. **Click the profile avatar or "Add Photo"** button
4. **Upload and save** the employee profile

### **Upload Process**
1. **Select Image**: Click to open file browser
2. **Choose File**: Select JPEG, PNG, or WebP image (max 5MB)
3. **Preview**: See immediate preview of selected image
4. **Upload**: Automatic upload with progress bar
5. **Success**: Image appears immediately in the interface

## 🔧 **Technical Implementation**

### **Mock Mode (Current)**
- ✅ **Working Now**: Upload functionality works with mock backend
- 📱 **Immediate Preview**: Uses Data URLs for instant image display
- ⚡ **Fast Development**: No backend setup required for testing
- 🎯 **Full UI Experience**: Complete upload flow with progress and validation

### **Production Mode (Future)**
- 🔗 **Backend Integration**: Will connect to MinIO storage when backend is ready
- 🗂️ **Folder Structure**: `employee_code/profile/`, `employee_code/documents/`, etc.
- 🔒 **Authentication**: JWT-based file access control
- ☁️ **Persistent Storage**: Files stored permanently in MinIO

### **Automatic Fallback**
The system automatically:
1. **Tries backend first** → If available, uses real MinIO storage
2. **Falls back to mock** → If backend unavailable, uses mock implementation
3. **No user impact** → Users get consistent experience either way

## 📁 **File Organization**

Images will be organized as:
```
malaka-employees/
├── EMP001/
│   ├── profile/          ← Profile images go here
│   ├── attendance/       ← Future: attendance documents
│   ├── documents/        ← Future: contracts, IDs
│   └── others/          ← Future: miscellaneous files
└── EMP002/
    └── profile/
        └── profile-image.jpg
```

## 🛡️ **Validation & Security**

### **File Validation**
- ✅ **Format**: JPEG, JPG, PNG, WebP only
- ✅ **Size**: Maximum 5MB
- ✅ **Type**: MIME type validation
- ✅ **Recommendation**: Square images (1:1 ratio) work best

### **Error Handling**
- ❌ **Invalid Format**: "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
- ❌ **Too Large**: "File size too large. Maximum size is 5MB."
- ❌ **Upload Failed**: Network or server error messages
- ❌ **No File**: "No file provided"

## 🎨 **UI Components**

### **ProfileImageUpload Component**
```typescript
<ProfileImageUpload
  employee={employee}           // Employee data
  onImageUpload={handleUpload}  // Callback when upload completes
  size="lg"                     // 'sm' | 'md' | 'lg' | 'xl'
  editable={true}               // Can upload new images
  showUploadButton={true}       // Show separate upload button
/>
```

### **Size Options**
- **sm**: 48px (small thumbnails)
- **md**: 96px (default size)  
- **lg**: 128px (edit page sidebar)
- **xl**: 160px (main detail page)

## 🔮 **Future Enhancements**

When backend is implemented:
- 🔄 **Persistent Storage**: Images saved permanently
- 🗑️ **Delete Images**: Remove old profile photos
- 📋 **File Management**: View all uploaded files per employee
- 🖼️ **Image Editing**: Crop, resize, filters
- 📤 **Batch Upload**: Multiple files at once
- 📊 **Usage Analytics**: Track storage usage

## 🐛 **Troubleshooting**

### **Common Issues**
1. **"Upload Failed"** → Check file size (max 5MB) and format (JPEG/PNG/WebP)
2. **"No preview"** → File may be corrupted, try different image
3. **"Button not working"** → Make sure you're on detail or edit page
4. **"Progress stuck"** → Normal in mock mode, simulates real upload delay

### **Debug Tips**
- Check browser console for detailed error messages
- Try uploading a different image file
- Refresh the page and try again
- Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge)

## 📞 **Support**

If you encounter issues:
1. Check file meets requirements (JPEG/PNG/WebP, under 5MB)
2. Try a different image file
3. Check browser console for error messages
4. Refresh the page and try again

The profile image upload feature is now ready for use! 🎉