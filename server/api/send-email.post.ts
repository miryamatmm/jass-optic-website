import { Resend } from 'resend'

/**
 * Formate une date ISO (YYYY-MM-DD) en français :
 * ex: "2026-02-02" -> "lundi 2 février 2026"
 */
function formatDateFr(dateStr: string) {
  const date = new Date(dateStr)

  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)

  // Majuscule sur le jour
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const resend = new Resend(config.resendApiKey)

  // Date formatée pour l’email
  const formattedDate = formatDateFr(body.slotDate)

  try {
    const { error } = await resend.emails.send({
      from: "Jass Optic <reservation@jassoptic.fr>",
      to: body.email,
      subject: "Votre rendez-vous chez Jass Optic",
      html: `
      <div style="
        background:#fafafa;
        padding:40px 20px;
        font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;
        color:#111;
      ">

        <div style="
          max-width:560px;
          margin:0 auto;
          background:#ffffff;
          padding:40px;
          border-radius:8px;
        ">

          <!-- TITRE -->
          <h1 style="
            font-size:26px;
            font-weight:500;
            margin:0 0 20px 0;
            text-align:center;
          ">
            Confirmation de rendez-vous
          </h1>

          <p style="
            font-size:16px;
            line-height:1.6;
            text-align:center;
            color:#333;
          ">
            Bonjour ${body.firstname},<br>
            Votre demande de rendez-vous chez <strong>Jass Optic</strong> a bien été prise en compte.
          </p>

          <div style="height:30px;"></div>

          <!-- CRÉNEAU -->
          <div style="
            border:1px solid #eee;
            border-radius:6px;
            padding:20px;
          ">
            <p style="margin:0;font-size:15px;color:#555;">
              Rendez-vous prévu
            </p>
            <p style="margin:8px 0 0 0;font-size:17px;">
              <strong>${formattedDate}</strong><br>
              ${body.slotHour}
            </p>
          </div>

          <div style="height:30px;"></div>

          <!-- INFOS CLIENT -->
          <p style="font-size:15px;color:#444;line-height:1.6;">
            <strong>Nom :</strong> ${body.firstname} ${body.lastname}<br>
            <strong>Téléphone :</strong> ${body.phone}<br>
            <strong>Email :</strong> ${body.email}
          </p>

          <div style="height:30px;"></div>

          <!-- MESSAGE -->
          <p style="font-size:15px;color:#444;line-height:1.6;">
            Si vous avez un empêchement ou besoin d’informations complémentaires,
            n’hésitez pas à nous contacter.
          </p>

          <div style="height:40px;"></div>

          <!-- FOOTER -->
          <p style="
            font-size:13px;
            color:#888;
            text-align:center;
            line-height:1.5;
          ">
            Jass Optic<br>
            <a href="https://jassoptic.fr" style="color:#111;text-decoration:none;">
              jassoptic.fr
            </a><br><br>
            Email automatique — merci de ne pas répondre.
          </p>

        </div>
      </div>
      `
    })

    if (error) {
      console.error("RESEND ERROR:", error)
      return { success: false }
    }

    return { success: true }

  } catch (err) {
    console.error("SEND EMAIL ERROR:", err)
    return { success: false }
  }
})
