const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    backgroundColor: '#18181b',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  // Register shortcut when window is focused
  win.on('focus', () => {
    globalShortcut.register('Escape', () => {
      app.quit();
    });
  });

  // Unregister when window loses focus so Escape works normally elsewhere
  win.on('blur', () => {
    globalShortcut.unregister('Escape');
  });
}

ipcMain.handle('launch-playwright', async (event, payload) => {
  return new Promise((resolve) => {
    const projectRoot = path.resolve(__dirname, '..');
    const pythonPath = path.join(projectRoot, '.venv', 'bin', 'python');
    const scriptPath = path.join(projectRoot, 'automation', 'seller_outreach.py');

    const proc = spawn(pythonPath, [scriptPath, JSON.stringify(payload)]);

    proc.stdout.on('data', (data) => console.log(`[Python]: ${data}`));
    proc.stderr.on('data', (data) => console.error(`[Python Error]: ${data}`));

    proc.on('close', (code) => {
      resolve({ status: code === 0 ? 'success' : 'failed', exitCode: code });
    });

    proc.on('error', (err) => {
      resolve({ status: 'error', error: err.message });
    });
  });
});

app.whenReady().then(createWindow);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  app.quit();
});
