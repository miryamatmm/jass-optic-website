import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  )

  const body = await readBody(event)

  const {
    slot_id,
    firstname,
    lastname,
    email,
    phone,
    ordonnance_url,
    mutuelle_url
  } = body

  // Vérifier si le créneau existe
  const { data: slot, error: slotErr } = await supabase
    .from("slots")
    .select("*")
    .eq("id", slot_id)
    .single()

  if (slotErr || !slot) return { error: "Slot not found" }
  if (slot.reserved) return { error: "Slot already reserved" }

  // Créer la réservation
  const { error: insertErr } = await supabase
    .from("reservations")
    .insert({
      slot_id,
      firstname,
      lastname,
      email,
      phone,
      ordonnance_url,
      mutuelle_url
    })

  if (insertErr) {
    console.error(insertErr)
    return { error: "Insert failed" }
  }

  // Verrouiller le créneau
  await supabase
    .from("slots")
    .update({ reserved: true })
    .eq("id", slot_id)

  return { success: true }
})
