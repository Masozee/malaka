import { contextBridge } from 'electron'

// Custom APIs for renderer
const api = {
  getAppVersion: (): string => process.env.npm_package_version || '1.0.0',
  getPlatform: (): string => process.platform
}

// Use `contextBridge` APIs to expose Electron APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
