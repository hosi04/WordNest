import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

// Generates the PWA icons from public/favicon.svg: `npx pwa-assets-generator`
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...preset,
    maskable: { ...preset.maskable, resizeOptions: { background: '#E4683A' } },
    apple: { ...preset.apple, resizeOptions: { background: '#E4683A' } },
  },
  images: ['public/favicon.svg'],
})
