import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: [
    ['@nuxtjs/i18n', {
      langDir: 'locales',
      defaultLocale: 'th',
      strategy: 'prefix_except_default',
      locales: [
        { code: 'th', iso: 'th-TH', files: ['th.json'], name: 'ไทย' },
        { code: 'en', iso: 'en-US', files: ['en.json'], name: 'English' }
      ],
      detectBrowserLanguage: {
        useCookie: true,
        cookieKey: 'i18n_redirected',
        redirectOn: 'root' // recommended
      },
      vueI18n: './i18n.config.ts'
    }]
  ],

  ssr: false,
  vite: {
    plugins: [tailwindcss()],
  },
  typescript: {
    shim: false,
  },
  css: ["~/assets/app.css"],
  app: {
    head: {
      title:
        "บริษัท ซี.เอส. อินโนเวชั่น เทคโนโลยี จำกัด",
      meta: [
        { name: 'description', content: ' บริษัท ซี.เอส อินโนเวชั่น เทคโนโลยี จำกัด ประกอบธุรกิจประเภท การขายส่งและการขายปลีกการซ่อมยานยนต์และ จักรยานยนต์ โดยให้บริการด้าน ร้านขายปลีกอุปกรณ์การสื่อสารโทรคมนาคม' },
        { property: 'og:title', content: 'บริษัท ซี.เอส อินโนเวชั่น เทคโนโลยี จำกัด ' },
        { property: 'og:description', content: 'คำอธิบายสั้น ๆ' },
        { property: 'og:image', content: '/images/logos/logo-dark.png' },   // ✅ รูป preview เวลาแชร์
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/logos/logo-dark.png' }, // ✅ favicon
        { rel: 'apple-touch-icon', href: '/images/logos/logo-dark.png' } // ✅ iOS
      ]
    },
    baseURL: '/'
  },

  build: {
    transpile: ["vuetify"],
  },
  runtimeConfig: {
    // private (server only)
    dbHost: process.env.DB_HOST || '127.0.0.1',
    dbPort: process.env.DB_PORT || '3306',
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD || '',
    dbName: process.env.DB_NAME || 'myapp',
    // public (client can read) -> อย่าใส่ credential ที่ลับ
    public: {
      apiBase: process.env.API_URL || 'http://localhost:3000',
    },
  },

  nitro: {
    serveStatic: true,
  },

  sourcemap: { server: false, client: false },
  devServerHandlers: [],
  compatibilityDate: "2025-09-09",

});

