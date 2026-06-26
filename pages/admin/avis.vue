<script setup>
const loading = ref(true)
const error = ref("")
const success = ref("")
const reviews = ref([])
const selectedView = ref("pending")
const processingId = ref(null)

async function loadReviews() {
  loading.value = true
  error.value = ""
  success.value = ""

  try {
    const res = await $fetch("/api/admin/reviews")

    reviews.value = res.reviews || []
  }
  catch (err) {
    console.error(err)
    error.value = "Impossible de charger les avis."
  }
  finally {
    loading.value = false
  }
}

onMounted(loadReviews)

const pendingReviews = computed(() => {
  return reviews.value.filter((review) => review.status === "pending")
})

const approvedReviews = computed(() => {
  return reviews.value.filter((review) => review.status === "approved")
})

const rejectedReviews = computed(() => {
  return reviews.value.filter((review) => review.status === "rejected")
})

const displayedReviews = computed(() => {
  if (selectedView.value === "approved") {
    return approvedReviews.value
  }

  if (selectedView.value === "rejected") {
    return rejectedReviews.value
  }

  return pendingReviews.value
})

const pageTitle = computed(() => {
  if (selectedView.value === "approved") {
    return "Avis validés"
  }

  if (selectedView.value === "rejected") {
    return "Avis refusés"
  }

  return "Avis à traiter"
})

async function updateReviewStatus(id, status) {
  processingId.value = id
  error.value = ""
  success.value = ""

  try {
    await $fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      body: { status }
    })

    success.value = status === "approved"
      ? "Avis validé avec succès."
      : "Avis refusé avec succès."

    await loadReviews()
  }
  catch (err) {
    console.error(err)
    error.value = "Impossible de mettre à jour cet avis."
  }
  finally {
    processingId.value = null
  }
}

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date))
}
</script>

<template>
  <div class="page admin-reviews-page">
    <NuxtLink to="/admin" class="back-link">
      ← Retour à l'administration
    </NuxtLink>

    <div class="admin-page-heading">
      <div>
        <h1>
          Avis clients
        </h1>

        <p class="admin-intro">
          Gérez les avis envoyés depuis le site. Vous pouvez les valider, les refuser et consulter l’historique.
        </p>
      </div>
    </div>

    <section class="reservations-summary-grid">
      <div class="card reservation-summary-card">
        <span class="summary-label">À traiter</span>
        <strong>{{ pendingReviews.length }}</strong>
        <p>avis en attente</p>
      </div>

      <div class="card reservation-summary-card">
        <span class="summary-label">Validés</span>
        <strong>{{ approvedReviews.length }}</strong>
        <p>avis publié{{ approvedReviews.length > 1 ? "s" : "" }}</p>
      </div>

      <div class="card reservation-summary-card">
        <span class="summary-label">Refusés</span>
        <strong>{{ rejectedReviews.length }}</strong>
        <p>avis refusé{{ rejectedReviews.length > 1 ? "s" : "" }}</p>
      </div>
    </section>

    <section class="reservations-filter-card card">
      <div>
        <p class="section-kicker">Affichage</p>
        <h2>
          {{ pageTitle }}
        </h2>
      </div>

      <div class="link-type-toggle admin-review-view-toggle">
        <button
          type="button"
          :class="['link-type-option', { active: selectedView === 'pending' }]"
          @click="selectedView = 'pending'"
        >
          À traiter
        </button>

        <button
          type="button"
          :class="['link-type-option', { active: selectedView === 'approved' }]"
          @click="selectedView = 'approved'"
        >
          Validés
        </button>

        <button
          type="button"
          :class="['link-type-option', { active: selectedView === 'rejected' }]"
          @click="selectedView = 'rejected'"
        >
          Refusés
        </button>
      </div>
    </section>

    <p v-if="loading" class="admin-message">
      Chargement des avis...
    </p>

    <p v-if="error" class="error">
      {{ error }}
    </p>

    <p v-if="success" class="success">
      {{ success }}
    </p>

    <div
      v-if="!loading && displayedReviews.length === 0"
      class="card empty-admin-card"
    >
      <h3>
        {{
          selectedView === "pending"
            ? "Aucun avis à traiter"
            : selectedView === "approved"
              ? "Aucun avis validé"
              : "Aucun avis refusé"
        }}
      </h3>

      <p>
        {{
          selectedView === "pending"
            ? "Tous les avis reçus ont déjà été traités."
            : selectedView === "approved"
              ? "Les avis validés apparaîtront ici."
              : "Les avis refusés apparaîtront ici."
        }}
      </p>
    </div>

    <div
      v-if="!loading && displayedReviews.length"
      class="admin-reviews-list"
    >
      <div
        v-for="review in displayedReviews"
        :key="review.id"
        class="card admin-review-card"
        :class="{ 'done-review-card': selectedView !== 'pending' }"
      >
        <div class="admin-review-header">
          <div>
            <h3>
              {{ review.name }}
            </h3>

            <p>
              {{ review.isAnonymous ? "Avis anonyme" : "Avis nominatif" }}
              <span v-if="review.createdAt">
                · {{ formatDate(review.createdAt) }}
              </span>
            </p>
          </div>

          <div class="header-badges">
            <span
              class="status"
              :class="review.status === 'approved' ? 'validated' : review.status === 'rejected' ? 'rejected' : 'pending'"
            >
              {{
                review.status === "approved"
                  ? "Validé"
                  : review.status === "rejected"
                    ? "Refusé"
                    : "En attente"
              }}
            </span>

            <span class="review-rating admin-review-rating">
              <span
                v-for="star in 5"
                :key="star"
                :class="['star', { empty: star > review.rating }]"
              >
                ★
              </span>
            </span>
          </div>
        </div>

        <p class="admin-review-message">
          “{{ review.message }}”
        </p>

        <div class="btn-row">
          <button
            v-if="review.status !== 'approved'"
            class="btn"
            :disabled="processingId === review.id"
            @click="updateReviewStatus(review.id, 'approved')"
          >
            {{ processingId === review.id ? "Traitement..." : "Valider" }}
          </button>

          <button
            v-if="review.status !== 'rejected'"
            class="btn danger"
            :disabled="processingId === review.id"
            @click="updateReviewStatus(review.id, 'rejected')"
          >
            {{ processingId === review.id ? "Traitement..." : "Refuser" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>