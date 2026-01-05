import { createClient } from "@supabase/supabase-js"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)

  const id = event.context.params.id

  // 1) récupérer la réservation
  const { data, error: err1 } = await supabase
    .from("reservations")
    .select("slot_id")
    .eq("id", id)
    .single()

  if (err1) return { error: err1.message }

  // 2) libérer le créneau
  await supabase
    .from("slots")
    .update({ reserved: false })
    .eq("id", data.slot_id)

  // 3) supprimer la réservation
  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", id)

  if (error) return { error }

  return { success: true }
})
