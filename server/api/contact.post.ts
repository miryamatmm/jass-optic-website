import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const firstname = typeof body.firstname === 'string' ? body.firstname.trim() : ''
  const lastname = typeof body.lastname === 'string' ? body.lastname.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!firstname || !lastname || !email || !message) {
    return {
      success: false,
      error: 'Tous les champs sont obligatoires.'
    }
  }

  if (message.length > 1500) {
    return {
      success: false,
      error: 'Le message est trop long.'
    }
  }

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  const { error } = await supabase
    .from('contact_messages')
    .insert({
      firstname,
      lastname,
      email,
      phone,
      message,
      status: 'new'
    })

  if (error) {
    console.error('CONTACT MESSAGE INSERT ERROR:', error)

    return {
      success: false,
      error: 'Impossible d’envoyer le message pour le moment.'
    }
  }

  return {
    success: true
  }
})