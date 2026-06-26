<template>
  <div class="reviews-page">
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

    <main class="reviews-main">
      <section class="reviews-hero">
        <p class="section-kicker">Avis clients</p>

        <h1>
          Vos retours,<br />
          notre plus belle vitrine
        </h1>

        <p>
          Découvrez les expériences de clientes et clients accompagnés par
          Jass Optic, à travers leurs retours et recommandations.
        </p>
      </section>

      <section
        v-if="reviews.length"
        :class="reviews.length > 3 ? 'reviews-marquee' : 'reviews-static'"
      >
        <div :class="reviews.length > 3 ? 'reviews-track' : 'reviews-static-grid'">
          <article
            v-for="(review, index) in displayedReviews"
            :key="`${review.id}-${index}`"
            class="review-card"
          >
            <div class="review-top">
              <div>
                <h3>{{ review.name }}</h3>
                <p>{{ review.label }}</p>
              </div>

              <span
                class="review-rating"
                :aria-label="`${review.rating} étoiles sur 5`"
              >
                <span
                  v-for="star in 5"
                  :key="star"
                  :class="['star', { empty: star > review.rating }]"
                >
                  ★
                </span>
              </span>
            </div>

            <p class="review-text">
              “{{ review.text }}”
            </p>

            <img
              v-if="review.image"
              :src="review.image"
              :alt="`Avis client ${review.name}`"
              class="review-image"
            />
          </article>
        </div>
      </section>

      <section v-else class="reviews-empty">
        <p>
          Les premiers avis seront bientôt affichés ici.
        </p>
      </section>

      <section class="review-submit-card">
        <div>
          <p class="section-kicker">Partager votre expérience</p>
          <h2>Laisser un avis</h2>
          <p>
            Partagez votre expérience avec Jass Optic.
            Votre retour aide les futurs clients à se projeter et à choisir en confiance.
          </p>
        </div>

        <form class="review-form" @submit.prevent="submitReview">
          <input
            v-model="form.name"
            class="input"
            type="text"
            placeholder="Votre prénom"
            maxlength="50"
            :disabled="form.isAnonymous"
          />

          <label class="anonymous-option">
            <input
              v-model="form.isAnonymous"
              type="checkbox"
            />
            <span>Publier mon avis anonymement</span>
          </label>

          <div class="rating-input">
            <p>Votre note</p>

            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="rating-star"
              :class="{ active: star <= form.rating }"
              :aria-label="`${star} étoile${star > 1 ? 's' : ''}`"
              @click="form.rating = star"
            >
              ★
            </button>
          </div>

          <textarea
            v-model="form.message"
            class="input textarea"
            placeholder="Votre avis"
            maxlength="1000"
          />

          <button class="btn" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer mon avis' }}
          </button>

          <p v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </p>

          <p v-if="submitted" class="submit-message">
            Merci pour votre avis. Votre retour a bien été transmis.
          </p>
        </form>
      </section>
    </main>

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

<script setup lang="ts">
type Review = {
  id: string
  name: string
  label: string
  rating: number
  text: string
  image: string
}

const submitted = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)

const form = ref({
  name: '',
  message: '',
  rating: 5,
  isAnonymous: false
})

const { data: reviews, refresh } = await useFetch<Review[]>('/api/reviews', {
  default: () => []
})

const displayedReviews = computed(() => {
  if (!reviews.value.length) {
    return []
  }

  if (reviews.value.length <= 3) {
    return reviews.value
  }

  return [...reviews.value, ...reviews.value]
})

const submitReview = async () => {
  submitted.value = false
  errorMessage.value = ''

  if (!form.value.isAnonymous && !form.value.name.trim()) {
    errorMessage.value = 'Merci d’indiquer votre prénom ou de cocher l’option anonyme.'
    return
  }

  if (!form.value.message.trim()) {
    errorMessage.value = 'Merci d’écrire un avis avant de l’envoyer.'
    return
  }

  try {
    isSubmitting.value = true

    await $fetch('/api/reviews', {
      method: 'POST',
      body: {
        name: form.value.name.trim(),
        isAnonymous: form.value.isAnonymous,
        rating: form.value.rating,
        message: form.value.message.trim()
      }
    })

    submitted.value = true

    form.value = {
      name: '',
      message: '',
      rating: 5,
      isAnonymous: false
    }

    await refresh()
  } catch (error) {
    console.error(error)
    errorMessage.value = "Impossible d’envoyer l’avis pour le moment. Merci de réessayer."
  } finally {
    isSubmitting.value = false
  }
}
</script>