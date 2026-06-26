import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
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

  // type demandé par le client (default 'pro' pour rétrocompat avec /reserver public)
  const requestedType = body.type === "particulier" ? "particulier" : "pro"

  // Vérifier si le créneau existe
  const { data: slot, error: slotErr } = await supabase
    .from("slots")
    .select("*")
    .eq("id", slot_id)
    .single()

  if (slotErr || !slot) return { error: "Slot not found" }
  if (slot.reserved) return { error: "Slot already reserved" }

  // Sécurité : le type du slot doit correspondre au type demandé
  // (empêche de réserver un créneau particulier via /reserver, et inversement)
  const slotType = slot.type === "particulier" ? "particulier" : "pro"
  if (slotType !== requestedType) {
    return { error: "Slot not available for this booking flow" }
  }

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
      mutuelle_url,
      type: requestedType
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
