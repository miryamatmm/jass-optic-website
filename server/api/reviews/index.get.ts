import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  const { data, error } = await supabase
    .from('reviews')
    .select('id, name, is_anonymous, rating, message, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de récupérer les avis.'
    })
  }

  return data.map((review) => ({
    id: review.id,
    name: review.is_anonymous ? 'Anonyme' : review.name,
    label: 'Client Jass Optic',
    rating: review.rating,
    text: review.message,
    image: ''
  }))
})