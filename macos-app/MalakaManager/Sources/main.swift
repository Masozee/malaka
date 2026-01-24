import AppKit
import Foundation

// Configuration
let PROJECT_ROOT = "/Users/pro/Dev/malaka"
let PM2_PATH = "/Users/pro/.npm-global/bin/pm2"
let API_BASE = "http://localhost:8080/api/v1"

class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem!
    var timer: Timer?

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Create status bar item
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)

        if let button = statusItem.button {
            button.title = "M"
        }

        // Build menu
        setupMenu()

        // Start status checker
        timer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { [weak self] _ in
            self?.updateStatus()
        }
        updateStatus()
    }

    func setupMenu() {
        let menu = NSMenu()

        menu.addItem(NSMenuItem(title: "Malaka ERP Manager", action: nil, keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())

        // Quick actions
        menu.addItem(NSMenuItem(title: "Start All Services", action: #selector(startAll), keyEquivalent: "s"))
        menu.addItem(NSMenuItem(title: "Stop All Services", action: #selector(stopAll), keyEquivalent: "x"))
        menu.addItem(NSMenuItem.separator())

        // Traefik
        menu.addItem(NSMenuItem(title: "Start Traefik", action: #selector(startTraefik), keyEquivalent: ""))
        menu.addItem(NSMenuItem(title: "Stop Traefik", action: #selector(stopTraefik), keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())

        // Backend
        menu.addItem(NSMenuItem(title: "Start Backend", action: #selector(startBackend), keyEquivalent: ""))
        menu.addItem(NSMenuItem(title: "Stop Backend", action: #selector(stopBackend), keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())

        // Frontend
        menu.addItem(NSMenuItem(title: "Start Frontend", action: #selector(startFrontend), keyEquivalent: ""))
        menu.addItem(NSMenuItem(title: "Stop Frontend", action: #selector(stopFrontend), keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())

        // Monitoring
        menu.addItem(NSMenuItem(title: "DB Health", action: #selector(showDBHealth), keyEquivalent: ""))
        menu.addItem(NSMenuItem(title: "Table Stats", action: #selector(showTableStats), keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())

        // Open
        menu.addItem(NSMenuItem(title: "Open App (malaka.test)", action: #selector(openApp), keyEquivalent: "o"))
        menu.addItem(NSMenuItem(title: "Open Project Folder", action: #selector(openProject), keyEquivalent: ""))
        menu.addItem(NSMenuItem(title: "Open Terminal", action: #selector(openTerminal), keyEquivalent: "t"))
        menu.addItem(NSMenuItem.separator())

        menu.addItem(NSMenuItem(title: "Refresh Status", action: #selector(refreshStatus), keyEquivalent: "r"))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Quit", action: #selector(quit), keyEquivalent: "q"))

        statusItem.menu = menu
    }

    // MARK: - Status

    func checkPort(_ port: Int) -> Bool {
        let task = Process()
        task.launchPath = "/usr/sbin/lsof"
        task.arguments = ["-i", ":\(port)"]

        let pipe = Pipe()
        task.standardOutput = pipe
        task.standardError = pipe

        do {
            try task.run()
            task.waitUntilExit()

            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let output = String(data: data, encoding: .utf8) ?? ""
            return !output.isEmpty && task.terminationStatus == 0
        } catch {
            return false
        }
    }

    func updateStatus() {
        let traefik = checkPort(80)
        let backend = checkPort(8080)
        let frontend = checkPort(3000)

        let running = [traefik, backend, frontend].filter { $0 }.count

        DispatchQueue.main.async { [weak self] in
            if running == 3 {
                self?.statusItem.button?.title = "M ✓"
            } else if running == 0 {
                self?.statusItem.button?.title = "M ✗"
            } else {
                self?.statusItem.button?.title = "M \(running)/3"
            }
        }
    }

    // MARK: - Commands

    func runCommand(_ command: String, sudo: Bool = false) {
        DispatchQueue.global(qos: .userInitiated).async {
            if sudo {
                let script = "do shell script \"\(command)\" with administrator privileges"
                let task = Process()
                task.launchPath = "/usr/bin/osascript"
                task.arguments = ["-e", script]
                try? task.run()
            } else {
                let task = Process()
                task.launchPath = "/bin/bash"
                task.arguments = ["-c", command]
                try? task.run()
            }

            DispatchQueue.main.asyncAfter(deadline: .now() + 2) { [weak self] in
                self?.updateStatus()
            }
        }
    }

    func notify(_ title: String, _ message: String) {
        let notification = NSUserNotification()
        notification.title = title
        notification.informativeText = message
        NSUserNotificationCenter.default.deliver(notification)
    }

    // MARK: - Service Actions

    @objc func startTraefik() {
        notify("Malaka", "Starting Traefik...")
        runCommand("cd \(PROJECT_ROOT)/traefik && /opt/homebrew/bin/traefik --configFile=traefik.yml &", sudo: true)
    }

    @objc func stopTraefik() {
        runCommand("pkill -f traefik", sudo: true)
        notify("Malaka", "Traefik stopped")
    }

    @objc func startBackend() {
        notify("Malaka", "Starting Backend...")
        runCommand("cd \(PROJECT_ROOT)/backend && ./main > /tmp/malaka-backend.log 2>&1 &")
    }

    @objc func stopBackend() {
        runCommand("pkill -f '\(PROJECT_ROOT)/backend/main'")
        notify("Malaka", "Backend stopped")
    }

    @objc func startFrontend() {
        notify("Malaka", "Starting Frontend...")
        runCommand("cd \(PROJECT_ROOT)/frontend && \(PM2_PATH) start ecosystem.config.js")
    }

    @objc func stopFrontend() {
        runCommand("\(PM2_PATH) stop all")
        notify("Malaka", "Frontend stopped")
    }

    @objc func startAll() {
        notify("Malaka", "Starting all services...")
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.startTraefik()
            Thread.sleep(forTimeInterval: 2)
            self?.startBackend()
            Thread.sleep(forTimeInterval: 2)
            self?.startFrontend()
        }
    }

    @objc func stopAll() {
        notify("Malaka", "Stopping all services...")
        stopFrontend()
        stopBackend()
        stopTraefik()
    }

    // MARK: - Monitoring

    @objc func showDBHealth() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let url = URL(string: "\(API_BASE)/monitoring/health") else { return }

            do {
                let data = try Data(contentsOf: url)
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    let active = json["active_connections"] ?? "N/A"
                    let cache = json["cache_hit_ratio"] as? Double ?? 0
                    let index = json["index_hit_ratio"] as? Double ?? 0
                    let size = json["database_size"] ?? "N/A"

                    let msg = """
                    Connections: \(active) active
                    Cache Hit: \(String(format: "%.1f", cache))%
                    Index Hit: \(String(format: "%.1f", index))%
                    DB Size: \(size)
                    """

                    DispatchQueue.main.async {
                        self?.showAlert("Database Health", msg)
                    }
                }
            } catch {
                DispatchQueue.main.async {
                    self?.showAlert("Error", "Backend not running or error: \(error.localizedDescription)")
                }
            }
        }
    }

    @objc func showTableStats() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let url = URL(string: "\(API_BASE)/monitoring/tables") else { return }

            do {
                let data = try Data(contentsOf: url)
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let tables = json["tables"] as? [[String: Any]] {

                    var msg = ""
                    for table in tables.prefix(10) {
                        let name = (table["table_name"] as? String ?? "").suffix(30)
                        let rows = table["live_rows"] as? Int ?? 0
                        msg += "\(name): \(rows) rows\n"
                    }

                    DispatchQueue.main.async {
                        self?.showAlert("Table Statistics", msg)
                    }
                }
            } catch {
                DispatchQueue.main.async {
                    self?.showAlert("Error", "Backend not running")
                }
            }
        }
    }

    func showAlert(_ title: String, _ message: String) {
        let alert = NSAlert()
        alert.messageText = title
        alert.informativeText = message
        alert.alertStyle = .informational
        alert.addButton(withTitle: "OK")
        alert.runModal()
    }

    // MARK: - Open Actions

    @objc func openApp() {
        NSWorkspace.shared.open(URL(string: "http://malaka.test")!)
    }

    @objc func openProject() {
        NSWorkspace.shared.open(URL(fileURLWithPath: PROJECT_ROOT))
    }

    @objc func openTerminal() {
        let script = """
        tell application "Terminal"
            activate
            do script "cd \(PROJECT_ROOT)"
        end tell
        """

        var error: NSDictionary?
        if let scriptObject = NSAppleScript(source: script) {
            scriptObject.executeAndReturnError(&error)
        }
    }

    @objc func refreshStatus() {
        updateStatus()

        let traefik = checkPort(80) ? "Running" : "Stopped"
        let backend = checkPort(8080) ? "Running" : "Stopped"
        let frontend = checkPort(3000) ? "Running" : "Stopped"

        showAlert("Service Status", """
        Traefik (80): \(traefik)
        Backend (8080): \(backend)
        Frontend (3000): \(frontend)
        """)
    }

    @objc func quit() {
        NSApp.terminate(nil)
    }
}

// Main
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
