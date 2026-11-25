import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function send(channel: string, ...args: unknown[]): void {
  mainWindow?.webContents.send(channel, ...args)
}

autoUpdater.on('checking-for-update', () => send('update:checking'))

autoUpdater.on('update-available', (info) => {
  send('update:available', info)

  dialog
    .showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update available',
      message: `A new version (${info.version}) is available. Download it now?`,
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1
    })
    .then(({ response }) => {
      if (response === 0) autoUpdater.downloadUpdate()
    })
})

autoUpdater.on('update-not-available', (info) => send('update:not-available', info))
autoUpdater.on('error', (err) => send('update:error', err?.message ?? String(err)))
autoUpdater.on('download-progress', (progress) => send('update:progress', progress))

autoUpdater.on('update-downloaded', (info) => {
  send('update:downloaded', info)

  dialog
    .showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update ready',
      message: `Version ${info.version} has been downloaded. Restart now to install it?`,
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    })
    .then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall()
    })
})

ipcMain.handle('update:check', () => autoUpdater.checkForUpdates())
ipcMain.handle('update:download', () => autoUpdater.downloadUpdate())
ipcMain.handle('update:install', () => autoUpdater.quitAndInstall())
ipcMain.handle('app:version', () => app.getVersion())

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  setTimeout(() => autoUpdater.checkForUpdates(), 3000)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
