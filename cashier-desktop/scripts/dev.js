const { spawn } = require('child_process');
const { createServer } = require('vite');
const path = require('path');

async function startDev() {
  // Start Vite dev server for renderer
  const vite = await createServer({
    configFile: path.join(__dirname, '../electron.vite.config.ts'),
    root: path.join(__dirname, '../src/renderer'),
    server: { port: 5173 }
  });
  await vite.listen();
  console.log('Vite dev server running at http://localhost:5173');

  // Build main and preload
  const { execSync } = require('child_process');
  execSync('npx electron-vite build --outDir out --watch', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  // Start Electron - temporarily rename electron module
  const electronModulePath = path.join(__dirname, '../node_modules/electron');
  const electronModuleBackup = path.join(__dirname, '../node_modules/.electron-backup');
  const fs = require('fs');

  // Backup the electron module
  if (fs.existsSync(electronModulePath)) {
    fs.renameSync(electronModulePath, electronModuleBackup);
  }

  const electronPath = path.join(electronModuleBackup, 'dist/Electron.app/Contents/MacOS/Electron');

  const electronProcess = spawn(electronPath, ['.'], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      ELECTRON_RENDERER_URL: 'http://localhost:5173'
    },
    stdio: 'inherit'
  });

  electronProcess.on('close', () => {
    // Restore electron module
    if (fs.existsSync(electronModuleBackup)) {
      fs.renameSync(electronModuleBackup, electronModulePath);
    }
    vite.close();
    process.exit();
  });

  // Handle process termination
  process.on('SIGINT', () => {
    if (fs.existsSync(electronModuleBackup)) {
      fs.renameSync(electronModuleBackup, electronModulePath);
    }
    electronProcess.kill();
    vite.close();
    process.exit();
  });
}

startDev().catch(console.error);
