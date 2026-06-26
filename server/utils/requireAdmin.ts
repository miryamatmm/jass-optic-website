export const requireAdmin = (event: any) => {
  const config = useRuntimeConfig()
  const session = getCookie(event, 'admin_session')

  if (!session || session !== config.adminKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non autorisé'
    })
  }
}