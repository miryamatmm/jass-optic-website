import { createClient } from "@supabase/supabase-js"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  )

  const { error } = await supabase
    .from("slots")
    .insert({
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      reserved: false
    })

  if (error) return { error }

  return { success: true }
})
