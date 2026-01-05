export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  ssr: true,
  pages: true, // FORCE LE ROUTER PAGES

  app: {
    rootTag: 'div', // petit hack pour désactiver app.vue s'il est en cache
    head: {
    link: [
      { rel: "icon", href: "/favicon.ico" }
      ]
    }
  },

  devtools: { enabled: false },  // devtools OFF pour éviter les bugs

  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    adminEmail: process.env.ADMIN_EMAIL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    adminKey: process.env.ADMIN_KEY,
    adminPassword: process.env.ADMIN_PASSWORD,
    sessionSecret: process.env.SESSION_SECRET,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    
    public: {
      resendApiKey: process.env.RESEND_API_KEY,
      adminEmail: process.env.ADMIN_EMAIL,
      supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
      adminKey: process.env.ADMIN_KEY,
      adminPassword: process.env.ADMIN_PASSWORD,
      sessionSecret: process.env.SESSION_SECRET,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  },

  css: [
  "@/assets/css/main.css"
  ],

  nitro: {
    preset: "netlify"
  }
})
