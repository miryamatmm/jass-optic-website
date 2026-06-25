import { Resend } from 'resend'

/**
 * Envoie le lien générique de réservation "particulier" à un client ciblé.
 * Le lien pointe vers `${PUBLIC_BASE_URL}/reserver/particulier`.
 *
 * Body attendu : { email, firstname?, lastname?, phone? }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  if (!body?.email) {
    return { error: "Email destinataire requis" }
  }

  const resend = new Resend(config.resendApiKey)

  const baseUrl = config.publicBaseUrl || "https://jassoptic.fr"
  const link = `${baseUrl}/reserver/particulier`

  const greetingName = body.firstname ? `Bonjour ${body.firstname},` : "Bonjour,"

  try {
    const sent = await resend.emails.send({
      from: "Jass Optic <reservation@jassoptic.fr>",
      to: body.email,
      subject: "Votre lien de rendez-vous personnalisé – Jass Optic",
      html: `
      <div style="background:#fafafa;padding:40px 20px;font-family:Inter,sans-serif;color:#111;">
        <div style="max-width:560px;margin:auto;background:#fff;padding:40px;border-radius:8px;">
          <h1 style="text-align:center;font-weight:500;">Votre rendez-vous chez Jass Optic</h1>

          <p style="text-align:center;">
            ${greetingName}<br>
            Comme convenu, voici votre lien personnel pour réserver votre créneau
            chez <strong>Jass Optic</strong>.
          </p>

          <div style="text-align:center;margin:36px 0;">
            <a href="${link}"
               style="background:#1c1c1c;color:#fff;padding:14px 32px;border-radius:999px;text-decoration:none;display:inline-block;font-weight:500;">
              Choisir mon créneau
            </a>
          </div>

          <p style="font-size:13px;color:#888;text-align:center;">
            Ou copiez ce lien dans votre navigateur :<br>
            <a href="${link}" style="color:#b79b6c;">${link}</a>
          </p>

          <p style="font-size:13px;color:#888;text-align:center;margin-top:40px;">
            Jass Optic – Email automatique
          </p>
        </div>
      </div>
      `
    })

    if (sent.error) {
      console.error("PARTICULAR LINK EMAIL ERROR:", sent.error)
      return { success: false, error: sent.error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("PARTICULAR LINK SEND ERROR:", err)
    return { success: false, error: "Send failed" }
  }
})
