import { contextBridge, ipcRenderer } from 'electron'

const updaterApi = {
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
  checkForUpdates: (): Promise<unknown> => ipcRenderer.invoke('update:check'),
  downloadUpdate: (): Promise<unknown> => ipcRenderer.invoke('update:download'),
  installUpdate: (): Promise<void> => ipcRenderer.invoke('update:install'),
  onChecking: (cb: () => void) => ipcRenderer.on('update:checking', () => cb()),
  onAvailable: (cb: (info: unknown) => void) =>
    ipcRenderer.on('update:available', (_e, info) => cb(info)),
  onNotAvailable: (cb: (info: unknown) => void) =>
    ipcRenderer.on('update:not-available', (_e, info) => cb(info)),
  onError: (cb: (message: string) => void) =>
    ipcRenderer.on('update:error', (_e, message) => cb(message)),
  onProgress: (cb: (progress: unknown) => void) =>
    ipcRenderer.on('update:progress', (_e, progress) => cb(progress)),
  onDownloaded: (cb: (info: unknown) => void) =>
    ipcRenderer.on('update:downloaded', (_e, info) => cb(info))
}

contextBridge.exposeInMainWorld('updater', updaterApi)

export type UpdaterApi = typeof updaterApi
