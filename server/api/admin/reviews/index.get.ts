import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  const { data, error } = await supabase
    .from('reviews')
    .select('id, name, is_anonymous, rating, message, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de récupérer les avis.'
    })
  }

  const reviews = data.map((review) => ({
    id: review.id,
    name: review.is_anonymous ? 'Anonyme' : review.name,
    isAnonymous: review.is_anonymous,
    rating: review.rating,
    message: review.message,
    status: review.status,
    createdAt: review.created_at
  }))

  return {
    reviews,
    pendingCount: reviews.filter((review) => review.status === 'pending').length,
    approvedCount: reviews.filter((review) => review.status === 'approved').length,
    rejectedCount: reviews.filter((review) => review.status === 'rejected').length
  }
})