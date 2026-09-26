import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

// Generates the PWA icons from public/favicon.svg: `npx pwa-assets-generator`.
// Note: public/maskable-icon-512x512.png is rendered separately from a full-bleed copy of
// favicon.svg (no rounded corners), so re-render it after running this.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...preset,
    maskable: { ...preset.maskable, resizeOptions: { background: '#1E2A3A' } },
    apple: { ...preset.apple, resizeOptions: { background: '#1E2A3A' } },
  },
  images: ['public/favicon.svg'],
})
