import type { Config } from '@react-router/dev/config'

export default {
  ssr: true,
  future: {
    // Middleware + context: el usuario se resuelve UNA vez por request y los guards viven en los layouts
    v8_middleware: true,
  },
} satisfies Config
