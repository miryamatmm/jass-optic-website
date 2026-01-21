export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  if (
    body.email !== config.adminEmail ||
    body.password !== config.adminPassword
  ) {
    return { error: "Identifiants incorrects" }
  }

  setCookie(event, "admin_session", config.adminKey, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/"
  })

  return { success: true }
})
