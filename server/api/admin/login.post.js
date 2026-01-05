import jwt from "jsonwebtoken"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  if (
    body.email !== config.adminEmail ||
    body.password !== config.adminPassword
  ) {
    return { error: "Identifiants incorrects" }
  }

  const token = jwt.sign({ role: "admin" }, config.sessionSecret, {
    expiresIn: "7d",
  })

setCookie(event, "admin_session", token, {
  httpOnly: true,
  secure: false,    // local uniquement
  sameSite: "none", // Chrome + Safari OK
  path: "/"
})


  return { success: true }
})
