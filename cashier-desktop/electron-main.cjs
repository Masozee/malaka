// Simple wrapper to properly load electron in main process
const { spawn } = require('child_process');
const path = require('path');

// Get the electron binary path
const electronPath = require('electron');

// Spawn electron with our main process
const proc = spawn(electronPath, [path.join(__dirname, 'out/main/index.js')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    ELECTRON_RENDERER_URL: process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173'
  }
});

proc.on('close', (code) => {
  process.exit(code);
});
