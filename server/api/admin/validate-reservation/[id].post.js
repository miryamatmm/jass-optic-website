import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  )

  // Récupérer l'id dans l'URL
  const id = event.context.params.id

  // Mise à jour : validated = true
  const { error } = await supabase
    .from("reservations")
    .update({ validated: true })
    .eq("id", id)

  if (error) {
    console.error(error)
    return { error: "Validation failed" }
  }

  return { success: true }
})
