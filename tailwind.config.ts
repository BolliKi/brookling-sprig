import type { Config } from 'tailwindcss'

import { coreTheme } from './src/@core/tailwind/theme'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: coreTheme
  },
  plugins: []
}

export default config
