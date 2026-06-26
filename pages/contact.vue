<script setup>
const form = ref({
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  message: ""
})

const loading = ref(false)
const success = ref("")
const error = ref("")

async function submitContact() {
  success.value = ""
  error.value = ""

  if (
    !form.value.firstname.trim() ||
    !form.value.lastname.trim() ||
    !form.value.email.trim() ||
    !form.value.message.trim()
  ) {
    error.value = "Merci de remplir tous les champs obligatoires."
    return
  }

  loading.value = true

  try {
    const res = await $fetch("/api/contact", {
      method: "POST",
      body: {
        firstname: form.value.firstname.trim(),
        lastname: form.value.lastname.trim(),
        email: form.value.email.trim(),
        phone: form.value.phone.trim(),
        message: form.value.message.trim()
      }
    })

    if (res?.error) {
      error.value = res.error
      return
    }

    success.value = "Votre message a bien été envoyé. Nous vous répondrons rapidement."

    form.value = {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      message: ""
    }
  } catch (err) {
    console.error(err)
    error.value = "Impossible d’envoyer le message pour le moment."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="contact-page">

    <!-- HEADER -->
    <header class="header">
      <NuxtLink to="/" class="brand">
        <img src="/images/logo.png" alt="Jass Optic" class="logo" />
      </NuxtLink>

      <nav class="nav">
        <NuxtLink to="/">Accueil</NuxtLink>
        <NuxtLink to="/avis">Avis</NuxtLink>
        <NuxtLink to="/contact">Contact</NuxtLink>
      </nav>
    </header>

    <main class="contact-main">

      <!-- HERO -->
      <section class="contact-hero">
        <p class="section-kicker">Contact</p>

        <h1>
          Une question ?<br />
          Échangeons simplement
        </h1>

        <p>
          Besoin d’un conseil, d’un accompagnement personnalisé ou d’une information
          sur votre dossier mutuelle ? Envoyez-nous un message.
        </p>
      </section>

      <!-- FORM -->
      <section class="contact-submit-card">
        <div>
          <p class="section-kicker">Nous écrire</p>

          <h2>
            Contacter<br />
            Jass Optic
          </h2>

          <p>
            Pour une commande, un suivi mutuelle, un conseil monture ou une question
            sur votre dossier, laissez-nous un message.
          </p>

          <div class="contact-details">
            <span>Conseil personnalisé</span>
            <span>Commande à distance</span>
            <span>Accompagnement mutuelle</span>
          </div>
        </div>

        <form class="contact-form" @submit.prevent="submitContact">
          <div class="contact-form-grid">
            <input
              v-model="form.firstname"
              type="text"
              class="input"
              placeholder="Prénom"
              maxlength="80"
            />

            <input
              v-model="form.lastname"
              type="text"
              class="input"
              placeholder="Nom"
              maxlength="80"
            />
          </div>

          <input
            v-model="form.email"
            type="email"
            class="input"
            placeholder="Email"
            maxlength="120"
          />

          <input
            v-model="form.phone"
            type="tel"
            class="input"
            placeholder="Téléphone"
            maxlength="30"
          />

          <textarea
            v-model="form.message"
            class="input textarea"
            placeholder="Votre message"
            maxlength="1500"
          />

          <button
            class="btn"
            type="submit"
            :disabled="loading"
          >
            {{ loading ? "Envoi en cours..." : "Envoyer le message" }}
          </button>

          <p v-if="success" class="contact-message success">
            {{ success }}
          </p>

          <p v-if="error" class="contact-message error">
            {{ error }}
          </p>
        </form>
      </section>
    </main>

    <!-- FOOTER -->
    <footer class="site-footer">
      <div class="footer-brand">
        <img src="/images/logo.png" alt="Jass Optic" class="footer-logo" />

        <p>
          Opticienne diplômée, accompagnement personnalisé et sélection de montures
          pour femmes et hommes.
        </p>
      </div>

      <div class="footer-nav">
        <h3>Navigation</h3>

        <NuxtLink to="/">Accueil</NuxtLink>
        <NuxtLink to="/avis">Avis clients</NuxtLink>
        <NuxtLink to="/contact">Contact</NuxtLink>
      </div>

      <div class="footer-contact">
        <h3>Contact</h3>

        <NuxtLink to="/contact">
          Formulaire de contact
        </NuxtLink>

        <p>Accompagnement à distance</p>

        <a
          href="/admin"
          class="footer-admin-link"
          aria-label="Accès administration"
          title="Administration"
        >
          Accès privé
        </a>
      </div>
    </footer>

  </div>
</template>