export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  return {
    resendApiKey: config.resendApiKey || null,
    adminEmail: config.adminEmail || null,
    supabaseUrl: config.supabaseUrl || null
  }
})
