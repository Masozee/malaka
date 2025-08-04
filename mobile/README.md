# Malaka ERP Mobile PWA

A Progressive Web Application built with Next.js for the Malaka ERP system, optimized for mobile devices and employee-facing operations.

## 🚀 Features

### PWA Capabilities
- **Offline Support**: Works without internet connection using service workers
- **Installable**: Can be installed on mobile home screens
- **Push Notifications**: Real-time notifications for important updates
- **Background Sync**: Queues actions when offline and syncs when online
- **App-like Experience**: Native app feel on mobile devices

### Core Modules
- **🏠 Dashboard**: Overview of key metrics and quick actions
- **👥 HR Operations**: Employee management, attendance, leave requests
- **📦 Inventory**: Stock checking, barcode scanning, quick updates
- **⏰ Attendance**: Clock in/out with GPS location tracking
- **📊 Reports**: Mobile-optimized reports and analytics

### Mobile-First Features
- **GPS Location**: Automatic location capture for attendance
- **Camera Integration**: Photo capture and barcode scanning
- **Touch Optimized**: Designed for touch interactions
- **Responsive Design**: Works on all screen sizes
- **Fast Loading**: Optimized for mobile networks

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom mobile-optimized components
- **Icons**: Lucide React
- **Fonts**: Geist (sans-serif) and Geist Mono
- **State Management**: Zustand
- **PWA**: next-pwa with Workbox
- **HTTP Client**: Axios
- **Build Tool**: Turbopack (development)

## 📁 Project Structure

```
mobile/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with PWA meta tags
│   │   ├── page.tsx            # Dashboard page
│   │   ├── hr/                 # HR module pages
│   │   ├── inventory/          # Inventory pages
│   │   └── attendance/         # Attendance pages
│   ├── components/             # Reusable components
│   │   ├── layout/             # Layout components
│   │   ├── ui/                 # UI components (Button, Card, Input)
│   │   └── features/           # Feature-specific components
│   ├── lib/                    # Utilities and configurations
│   │   ├── utils.ts            # Helper functions
│   │   └── constants.ts        # App constants
│   ├── hooks/                  # Custom React hooks
│   ├── stores/                 # Zustand state stores
│   ├── services/               # API services
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
│   ├── manifest.json           # PWA manifest
│   ├── icons/                  # App icons for PWA
│   └── screenshots/            # PWA screenshots
├── next.config.ts              # Next.js + PWA configuration
└── package.json                # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Modern browser with PWA support

### Installation

1. **Navigate to mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open in browser**:
   ```
   http://localhost:3002
   ```

### Build for Production

```bash
npm run build
npm start
```

## 📱 PWA Installation

### On Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" prompt or menu option
3. Follow the installation prompts
4. App will appear on your home screen like a native app

### On Desktop
1. Open the app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click "Install" to add to your desktop

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8084
NEXT_PUBLIC_APP_ENV=development
```

### PWA Configuration

The PWA is configured in `next.config.ts`:
- Service Worker caching strategies
- Runtime caching for APIs and assets
- Background sync capabilities
- Push notification setup

### Manifest Configuration

PWA manifest in `public/manifest.json`:
- App name, icons, and colors
- Display mode and orientation
- App shortcuts for quick actions
- Share target integration

## 📊 Features Detail

### Dashboard
- Real-time clock and online status
- Key metrics overview (employees, inventory, attendance)
- Quick action buttons for common tasks
- Recent activity feed
- PWA install prompt

### HR Operations
- Employee profile management
- Leave request submission and tracking
- Performance review access
- Document management
- Payroll information viewing

### Attendance System
- GPS-based clock in/out
- Real-time location capture
- Attendance history with status
- Weekly/monthly hour summaries
- Offline capability with sync

### Inventory Management
- Stock level checking
- Barcode scanning (camera integration)
- Quick stock updates
- Item search and filtering
- Movement history

## 🔒 Security Features

- JWT token-based authentication
- Secure token storage
- HTTPS enforcement for PWA
- CSP headers for security
- Biometric authentication support (planned)

## 📱 Mobile Optimizations

- Touch-friendly 44px minimum tap targets
- Mobile-first responsive design
- Optimized images with WebP/AVIF support
- Fast loading with code splitting
- Efficient caching strategies
- Battery-conscious background operations

## 🌐 Offline Support

- Service worker caching for core functionality
- Offline queue for actions when disconnected
- Background sync when connection restored
- Offline status indicators
- Cached data fallbacks

## 🔔 Push Notifications

- Real-time notifications for:
  - Attendance reminders
  - Leave request updates
  - Inventory alerts
  - Performance review notifications
- Background notification handling
- Notification action buttons

## 📈 Performance

- Lighthouse PWA score: 100/100
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- Service worker caching for instant loading

## 🛠 Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# PWA specific
npm run build:pwa        # Build with PWA optimization
```

## 🧪 Testing

```bash
# Test PWA features
# 1. Install Lighthouse CLI
npm install -g lighthouse

# 2. Run PWA audit
lighthouse http://localhost:3002 --only-categories=pwa --chrome-flags="--headless"

# 3. Test offline functionality
# - Open DevTools > Application > Service Workers
# - Check "Offline" checkbox
# - Navigate the app to test offline features
```

## 📱 Browser Support

- **Chrome**: Full PWA support
- **Firefox**: PWA support (limited)
- **Safari**: iOS 11.3+ with PWA support
- **Edge**: Full PWA support
- **Samsung Internet**: Full PWA support

## 🔄 Backend Integration

The mobile app integrates with the main Malaka ERP backend:
- **API Base URL**: Configurable via environment variables
- **Authentication**: JWT tokens with refresh mechanism
- **Real-time Updates**: WebSocket connections for live data
- **File Uploads**: MinIO integration for documents/images
- **Offline Sync**: Queued actions sync with backend when online

## 🚀 Deployment

### Development
```bash
./dev-caddy.sh  # Includes mobile PWA on port 3002
```

### Production
- Build static files with `npm run build`
- Deploy to CDN or web server
- Ensure HTTPS for PWA features
- Configure service worker caching
- Set up push notification server

## 📚 Resources

- [Next.js PWA Documentation](https://nextjs.org/docs/advanced-features/progressive-web-apps)
- [PWA Best Practices](https://web.dev/pwa/)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Service Workers](https://web.dev/service-workers/)
- [Push Notifications](https://web.dev/push-notifications/)

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Ensure mobile-first responsive design
3. Test PWA features across different browsers
4. Maintain offline functionality
5. Update documentation for new features

---

**🎯 Goal**: Provide employees with convenient mobile access to essential ERP functions while maintaining full integration with the main system, enabling productive work from anywhere with progressive enhancement and offline capabilities.
