# Malaka ERP - Development Setup with Hot Reload

This guide explains how to set up the development environment with hot reload enabled for the frontend.

## 🚀 Quick Start

### Option 1: Using the Development Script (Recommended)

```bash
# Make the script executable (first time only)
chmod +x dev.sh

# Start development environment
./dev.sh
```

### Option 2: Using Docker Compose Directly

```bash
# Start with development configuration
docker-compose -f docker-compose.dev.yml up --build

# Or use the override file with main compose
docker-compose up --build
```

## 📁 Development Files

### New Files Created for Development:

- **`frontend/Dockerfile.dev`** - Development Dockerfile with hot reload
- **`docker-compose.dev.yml`** - Complete development environment
- **`docker-compose.override.yml`** - Override for main compose file
- **`.env.dev`** - Development environment variables
- **`dev.sh`** - Convenient startup script
- **`frontend/.dockerignore`** - Optimized Docker build context

## 🔥 Hot Reload Features

### Frontend Hot Reload:
- **File Watching**: Real-time detection of code changes
- **Volume Mounting**: Source code mounted directly into container
- **Environment Variables**: 
  - `WATCHPACK_POLLING=true` - Enables polling for file changes
  - `CHOKIDAR_USEPOLLING=true` - Alternative polling method
  - `NODE_ENV=development` - Development mode
  - `NEXT_TELEMETRY_DISABLED=1` - Disables Next.js telemetry

### Backend Hot Reload:
- **Volume Mounting**: Go source code mounted for development
- **Debug Mode**: `GIN_MODE=debug` for detailed logging

## 🌐 Service URLs

When development environment is running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Next.js app with hot reload |
| **Backend API** | http://localhost:8084 | Go API server |
| **Database Admin** | http://localhost:8085 | Adminer (admin/password) |
| **Redis Commander** | http://localhost:8086 | Redis management (admin/admin123) |

## 🛠️ Development Workflow

1. **Start Environment**:
   ```bash
   ./dev.sh
   ```

2. **Make Code Changes**:
   - Edit files in `frontend/src/` - changes will be reflected immediately
   - Edit files in `backend/` - server will restart automatically

3. **View Changes**:
   - Frontend: http://localhost:3000
   - Changes appear within 1-2 seconds

4. **Stop Environment**:
   - Press `Ctrl+C` in the terminal running the dev script
   - Or run: `docker-compose -f docker-compose.dev.yml down`

## 🔧 Troubleshooting

### Hot Reload Not Working?

1. **Check Volume Mounts**:
   ```bash
   docker-compose -f docker-compose.dev.yml exec malaka-frontend ls -la /app
   ```

2. **Check Environment Variables**:
   ```bash
   docker-compose -f docker-compose.dev.yml exec malaka-frontend env | grep WATCH
   ```

3. **Restart Frontend Container**:
   ```bash
   docker-compose -f docker-compose.dev.yml restart malaka-frontend
   ```

### Port Conflicts?

If ports are already in use, modify the port mappings in `docker-compose.dev.yml`:

```yaml
services:
  malaka-frontend:
    ports:
      - "3001:3000"  # Change to available port
```

### File Permission Issues?

On Linux/macOS, ensure proper file permissions:

```bash
sudo chown -R $USER:$USER ./frontend
chmod -R 755 ./frontend
```

## 📝 Development Notes

### Volume Exclusions:
- `node_modules` and `.next` are excluded from volume mounts to prevent conflicts
- Dependencies are installed inside the container during build

### Environment Separation:
- **Development**: Uses `Dockerfile.dev` and development settings
- **Production**: Uses main `Dockerfile` with optimized build

### Database:
- PostgreSQL data persists in Docker volume `postgres_data_dev`
- Migrations run automatically on first startup

## 🚀 Performance Tips

1. **Use .dockerignore**: Reduces build context size
2. **Volume Exclusions**: Prevents node_modules conflicts
3. **Polling**: Enabled for cross-platform compatibility
4. **Layer Caching**: Dependencies cached in Docker layers

## 🔒 Security Notes

- Development environment uses default passwords (see `.env.dev`)
- **DO NOT** use these settings in production
- The development environment exposes additional ports for debugging

## 🆚 Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| **Hot Reload** | ✅ Enabled | ❌ Disabled |
| **File Watching** | ✅ Polling | ❌ None |
| **Source Maps** | ✅ Enabled | ❌ Disabled |
| **Volume Mounts** | ✅ Source code | ❌ Built files only |
| **Build Optimization** | ❌ Faster builds | ✅ Optimized builds |
| **Debug Mode** | ✅ Enabled | ❌ Production mode |

---

**Happy Coding! 🎉**

Your changes will now be reflected immediately in the browser without manual rebuilds!