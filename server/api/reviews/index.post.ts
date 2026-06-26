import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const rating = Number(body.rating)
  const isAnonymous = Boolean(body.isAnonymous)

  if (!isAnonymous && !name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le prénom est obligatoire.'
    })
  }

  if (!message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le message est obligatoire.'
    })
  }

  if (message.length > 1000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le message est trop long.'
    })
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La note doit être comprise entre 1 et 5.'
    })
  }

  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  const { error } = await supabase
    .from('reviews')
    .insert({
      name: isAnonymous ? null : name,
      is_anonymous: isAnonymous,
      rating,
      message,
      status: 'pending'
    })

  if (error) {
    console.error(error)

    throw createError({
      statusCode: 500,
      statusMessage: "Impossible d'envoyer l'avis."
    })
  }

  return {
    success: true
  }
})