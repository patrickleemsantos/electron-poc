/// <reference types="vite/client" />

import type { UpdaterApi } from '../../preload/index'

declare global {
  interface Window {
    updater: UpdaterApi
  }
}
