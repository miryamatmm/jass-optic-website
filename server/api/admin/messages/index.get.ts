import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, firstname, lastname, email, phone, message, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('ADMIN CONTACT MESSAGES GET ERROR:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de récupérer les messages.'
    })
  }

  const messages = data.map((message) => ({
    id: message.id,
    firstname: message.firstname,
    lastname: message.lastname,
    email: message.email,
    phone: message.phone,
    message: message.message,
    status: message.status,
    createdAt: message.created_at
  }))

  return {
    messages,
    newCount: messages.filter((message) => message.status === 'new').length,
    doneCount: messages.filter((message) => message.status === 'done').length
  }
})