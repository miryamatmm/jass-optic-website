import { createClient } from "@supabase/supabase-js"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  // type par défaut 'pro' si non fourni (rétrocompat)
  const slotType = body.type === "particulier" ? "particulier" : "pro"

  const { error } = await supabase
    .from("slots")
    .insert({
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      reserved: false,
      type: slotType
    })

  if (error) return { error }

  return { success: true }
})
