import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  if (!id) {
    return {
      success: false,
      error: 'Identifiant de réservation manquant.'
    }
  }

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  const { error } = await supabase
    .from('reservations')
    .update({ validated: true })
    .eq('id', id)

  if (error) {
    console.error('VALIDATE RESERVATION ERROR:', error)

    return {
      success: false,
      error: 'Validation failed'
    }
  }

  return {
    success: true
  }
})