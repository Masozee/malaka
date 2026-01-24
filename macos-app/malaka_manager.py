#!/usr/bin/env python3
"""
Malaka ERP Service Manager - macOS Menu Bar App
Simple and responsive version
"""

import rumps
import subprocess
import threading
import requests
import json
import os
from datetime import datetime

# Configuration
PROJECT_ROOT = "/Users/pro/Dev/malaka"
BACKEND_PORT = 8080
FRONTEND_PORT = 3000
TRAEFIK_PORT = 80
PM2_PATH = "/Users/pro/.npm-global/bin/pm2"
API_BASE = "http://localhost:8080/api/v1"


class MalakaManager(rumps.App):
    def __init__(self):
        super(MalakaManager, self).__init__("M", quit_button="Quit")

        # Build menu items
        self.menu = [
            rumps.MenuItem("Malaka ERP Manager"),
            None,
            rumps.MenuItem("Start All", callback=self.start_all),
            rumps.MenuItem("Stop All", callback=self.stop_all),
            None,
            rumps.MenuItem("Start Traefik", callback=self.start_traefik),
            rumps.MenuItem("Stop Traefik", callback=self.stop_traefik),
            None,
            rumps.MenuItem("Start Backend", callback=self.start_backend),
            rumps.MenuItem("Stop Backend", callback=self.stop_backend),
            None,
            rumps.MenuItem("Start Frontend", callback=self.start_frontend),
            rumps.MenuItem("Stop Frontend", callback=self.stop_frontend),
            None,
            rumps.MenuItem("DB Health", callback=self.show_db_health),
            rumps.MenuItem("Slow Queries", callback=self.show_slow_queries),
            rumps.MenuItem("Table Stats", callback=self.show_table_stats),
            None,
            rumps.MenuItem("Open App", callback=self.open_app),
            rumps.MenuItem("Open Project", callback=self.open_project),
            rumps.MenuItem("Open Terminal", callback=self.open_terminal),
            None,
            rumps.MenuItem("Refresh Status", callback=self.refresh_status),
        ]

        # Start status checker in background
        self.timer = rumps.Timer(self.check_status, 10)
        self.timer.start()

        # Initial check
        self.check_status(None)

    def check_port(self, port):
        """Check if port is in use"""
        try:
            result = subprocess.run(
                ["lsof", "-i", f":{port}"],
                capture_output=True, text=True, timeout=2
            )
            return result.returncode == 0 and len(result.stdout.strip()) > 0
        except:
            return False

    def check_status(self, _):
        """Check all services and update title"""
        traefik = self.check_port(TRAEFIK_PORT)
        backend = self.check_port(BACKEND_PORT)
        frontend = self.check_port(FRONTEND_PORT)

        running = sum([traefik, backend, frontend])

        if running == 3:
            self.title = "M ✓"
        elif running == 0:
            self.title = "M ✗"
        else:
            self.title = f"M {running}/3"

    def run_cmd(self, cmd, sudo=False):
        """Run shell command"""
        try:
            if sudo:
                script = f'do shell script "{cmd}" with administrator privileges'
                subprocess.Popen(["osascript", "-e", script])
            else:
                subprocess.Popen(cmd, shell=True)
            return True
        except Exception as e:
            rumps.alert("Error", str(e))
            return False

    def start_traefik(self, _):
        rumps.notification("Malaka", "Traefik", "Starting...")
        cmd = f"cd {PROJECT_ROOT}/traefik && ./traefik --configFile=traefik.yml"
        self.run_cmd(cmd, sudo=True)

    def stop_traefik(self, _):
        self.run_cmd("pkill -f traefik", sudo=True)
        rumps.notification("Malaka", "Traefik", "Stopped")

    def start_backend(self, _):
        rumps.notification("Malaka", "Backend", "Starting...")
        cmd = f"cd {PROJECT_ROOT}/backend && ./main > /tmp/malaka-backend.log 2>&1 &"
        self.run_cmd(cmd)

    def stop_backend(self, _):
        self.run_cmd(f"pkill -f '{PROJECT_ROOT}/backend/main'")
        rumps.notification("Malaka", "Backend", "Stopped")

    def start_frontend(self, _):
        rumps.notification("Malaka", "Frontend", "Starting with PM2...")
        cmd = f"cd {PROJECT_ROOT}/frontend && {PM2_PATH} start ecosystem.config.js"
        self.run_cmd(cmd)

    def stop_frontend(self, _):
        self.run_cmd(f"{PM2_PATH} stop all")
        rumps.notification("Malaka", "Frontend", "Stopped")

    def start_all(self, _):
        rumps.notification("Malaka", "Starting All", "Please wait...")

        def do_start():
            self.start_traefik(None)
            import time
            time.sleep(2)
            self.start_backend(None)
            time.sleep(2)
            self.start_frontend(None)
            time.sleep(2)
            self.check_status(None)

        threading.Thread(target=do_start, daemon=True).start()

    def stop_all(self, _):
        rumps.notification("Malaka", "Stopping All", "Please wait...")
        self.stop_frontend(None)
        self.stop_backend(None)
        self.stop_traefik(None)
        self.check_status(None)

    def fetch_api(self, endpoint):
        """Fetch from monitoring API"""
        try:
            r = requests.get(f"{API_BASE}/monitoring/{endpoint}", timeout=3)
            return r.json() if r.status_code == 200 else {"error": f"HTTP {r.status_code}"}
        except requests.exceptions.ConnectionError:
            return {"error": "Backend not running"}
        except Exception as e:
            return {"error": str(e)}

    def show_db_health(self, _):
        data = self.fetch_api("health")
        if "error" in data:
            rumps.alert("DB Health", data["error"])
            return

        msg = f"""Connections: {data.get('active_connections', 'N/A')} active
Cache Hit: {data.get('cache_hit_ratio', 0):.1f}%
Index Hit: {data.get('index_hit_ratio', 0):.1f}%
Dead Tuples: {data.get('dead_tuples', 'N/A')}
DB Size: {data.get('database_size', 'N/A')}"""
        rumps.alert("Database Health", msg)

    def show_slow_queries(self, _):
        data = self.fetch_api("slow-queries")
        if "error" in data:
            rumps.alert("Slow Queries", data["error"])
            return

        queries = data.get("queries", [])
        if not queries:
            rumps.alert("Slow Queries", "No slow queries recorded")
            return

        msg = f"Found {len(queries)} slow queries:\n\n"
        for i, q in enumerate(queries[:5], 1):
            query = q.get("query", "")[:50]
            msg += f"{i}. {q.get('duration_ms', 0):.0f}ms - {query}...\n"
        rumps.alert("Slow Queries", msg)

    def show_table_stats(self, _):
        data = self.fetch_api("tables")
        if "error" in data:
            rumps.alert("Table Stats", data["error"])
            return

        tables = data.get("tables", [])
        if not tables:
            rumps.alert("Table Stats", "No statistics available")
            return

        msg = ""
        for t in tables[:8]:
            name = t.get("table_name", "")[-25:]
            rows = t.get("live_rows", 0)
            msg += f"{name}: {rows:,} rows\n"
        rumps.alert("Table Statistics", msg)

    def open_app(self, _):
        subprocess.Popen(["open", "http://malaka.test"])

    def open_project(self, _):
        subprocess.Popen(["open", PROJECT_ROOT])

    def open_terminal(self, _):
        script = f'tell application "Terminal" to do script "cd {PROJECT_ROOT}"'
        subprocess.Popen(["osascript", "-e", script])

    def refresh_status(self, _):
        self.check_status(None)

        traefik = "Running" if self.check_port(TRAEFIK_PORT) else "Stopped"
        backend = "Running" if self.check_port(BACKEND_PORT) else "Stopped"
        frontend = "Running" if self.check_port(FRONTEND_PORT) else "Stopped"

        msg = f"""Traefik (80): {traefik}
Backend (8080): {backend}
Frontend (3000): {frontend}"""
        rumps.alert("Service Status", msg)


if __name__ == "__main__":
    MalakaManager().run()
