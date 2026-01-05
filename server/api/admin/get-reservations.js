// server/api/admin/get-reservations.js
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const reservations = await $fetch(
    `${config.supabaseUrl}/rest/v1/reservations?select=*,slot:slot_id(*)`,
    {
      headers: {
        apikey: config.supabaseServiceKey,
        Authorization: `Bearer ${config.supabaseServiceKey}`,
      }
    }
  )

  // tri date + heure
  reservations.sort((a, b) => {
    const da = new Date(a.slot.date + "T" + a.slot.start_time)
    const db = new Date(b.slot.date + "T" + b.slot.start_time)
    return da - db
  })

  // nb réservations non validées
  const newCount = reservations.filter(r => !r.validated).length

  return {
    reservations,
    newCount
  }
})
