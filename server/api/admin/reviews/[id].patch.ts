import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const status = body.status

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Identifiant de l’avis manquant.'
    })
  }

  if (!['approved', 'rejected'].includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Statut invalide.'
    })
  }

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  const { error } = await supabase
    .from('reviews')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('status', 'pending')

  if (error) {
    console.error(error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de mettre à jour l’avis.'
    })
  }

  return {
    success: true
  }
})