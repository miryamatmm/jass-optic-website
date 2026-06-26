import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const status = body.status

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Identifiant du message manquant.'
    })
  }

  if (!['new', 'done'].includes(status)) {
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
    .from('contact_messages')
    .update({
      status
    })
    .eq('id', id)

  if (error) {
    console.error('ADMIN CONTACT MESSAGE UPDATE ERROR:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de mettre à jour le message.'
    })
  }

  return {
    success: true
  }
})