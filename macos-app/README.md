# Malaka ERP Manager

A macOS menu bar application for managing Malaka ERP services.

## Features

- **Service Control**: Start/stop Traefik, Backend, and Frontend
- **Quick Actions**: Start All, Stop All, Restart All
- **Monitoring**: Database health, slow queries, table stats, index stats
- **Quick Access**: Open app, API docs, project folder, terminal

## Installation

### Option 1: Run directly
```bash
cd /Users/pro/Dev/malaka/macos-app
./start.sh
```

### Option 2: Double-click the app
Open Finder and navigate to `/Users/pro/Dev/malaka/macos-app/`
Double-click "Malaka Manager.app"

### Option 3: Copy to Applications
```bash
cp -r "Malaka Manager.app" /Applications/
```

## Usage

Once running, you'll see an "M" icon in the menu bar.

### Menu Bar Icon Status
- `M ✓` - All services running
- `M ✗` - All services stopped
- `M 2/3` - Partial (2 of 3 services running)

### Services Menu
- **Traefik**: Reverse proxy on port 80 (requires admin password)
- **Backend**: Go API server on port 8080
- **Frontend**: Next.js app on port 3000 (via PM2)

### Monitoring Menu
- **Database Health**: Connection stats, cache hit ratios, dead tuples
- **Slow Queries**: Recent slow queries from the application
- **Table Statistics**: Row counts and index usage
- **Index Statistics**: Most used indexes
- **Full Report**: Complete performance report (opens in TextEdit)

### Quick Links
- **Open App**: Opens http://malaka.test in browser
- **Open API Docs**: Opens Swagger documentation
- **Open Project Folder**: Opens project in Finder
- **Open Terminal**: Opens Terminal in project directory

## Requirements

- macOS 10.15+
- Python 3.8+
- rumps library (`pip3 install rumps`)
- requests library (`pip3 install requests`)

## Configuration

Edit `malaka_manager.py` to change:
- `PROJECT_ROOT`: Path to Malaka project
- `BACKEND_PORT`: Backend API port (default: 8080)
- `FRONTEND_PORT`: Frontend port (default: 3000)
- `TRAEFIK_PORT`: Traefik port (default: 80)
- `PM2_PATH`: Path to PM2 executable

## Troubleshooting

### App doesn't appear in menu bar
Check if another instance is running:
```bash
pkill -f malaka_manager.py
```

### Services won't start
Make sure the paths are correct in `malaka_manager.py`:
- Backend binary: `/Users/pro/Dev/malaka/backend/main`
- Frontend: `/Users/pro/Dev/malaka/frontend/`
- Traefik: `/Users/pro/Dev/malaka/traefik/`

### Monitoring not working
Backend must be running for monitoring endpoints to work.
