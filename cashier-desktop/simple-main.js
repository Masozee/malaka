// Simple test - see what require('electron') returns
const e = require('electron');
console.log('electron module:', typeof e);
console.log('electron value:', e);

// If e is a string (path), there's a module resolution issue
if (typeof e === 'string') {
  console.log('ERROR: Got path instead of API. This is a module resolution issue.');
  process.exit(1);
}

// Try to use the API
if (e && e.app) {
  console.log('Success! electron.app is available');
  e.app.whenReady().then(() => {
    console.log('App ready!');
    const win = new e.BrowserWindow({ width: 800, height: 600 });
    win.loadURL('about:blank');
    win.webContents.executeJavaScript('document.body.innerHTML = "<h1>Electron Works!</h1>"');
  });
} else {
  console.log('ERROR: electron.app is not available');
  console.log('Keys:', Object.keys(e));
}
