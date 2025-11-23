/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YANDEX_API_KEY: string
  readonly VITE_YANDEX_MODEL_URI: string
  readonly VITE_YANDEX_FOLDER_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv & {
    readonly DEV: boolean
    readonly MODE: string
  }
}

