import { createClient } from "@supabase/supabase-js"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)

  const id = event.context.params.id

  const { error } = await supabase
    .from("slots")
    .delete()
    .eq("id", id)

  if (error) return { error }

  return { success: true }
})
