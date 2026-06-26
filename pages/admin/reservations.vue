<script setup>
const reservations = ref([])
const newCount = ref(0)
const loading = ref(true)
const error = ref("")
const selectedView = ref("upcoming")

async function load() {
  loading.value = true
  error.value = ""

  try {
    const data = await $fetch("/api/admin/get-reservations")

    reservations.value = data.reservations || []
    newCount.value = data.newCount || 0
  } catch (err) {
    console.error(err)
    error.value = "Impossible de charger les réservations."
  } finally {
    loading.value = false
  }
}

onMounted(load)

function getReservationStartDate(reservation) {
  if (!reservation.slot?.date || !reservation.slot?.start_time) {
    return null
  }

  return new Date(`${reservation.slot.date}T${reservation.slot.start_time}`)
}

function getReservationEndDate(reservation) {
  if (!reservation.slot?.date || !reservation.slot?.end_time) {
    return null
  }

  return new Date(`${reservation.slot.date}T${reservation.slot.end_time}`)
}

const sortedReservations = computed(() => {
  return [...reservations.value].sort((a, b) => {
    const da = getReservationStartDate(a)
    const db = getReservationStartDate(b)

    if (!da || !db) return 0

    return da - db
  })
})

const upcomingReservations = computed(() => {
  const now = new Date()

  return sortedReservations.value.filter((reservation) => {
    const endDate = getReservationEndDate(reservation)

    if (!endDate) return false

    return endDate > now
  })
})

const pastReservations = computed(() => {
  const now = new Date()

  return sortedReservations.value
    .filter((reservation) => {
      const endDate = getReservationEndDate(reservation)

      if (!endDate) return false

      return endDate <= now
    })
    .reverse()
})

const displayedReservations = computed(() => {
  return selectedView.value === "past"
    ? pastReservations.value
    : upcomingReservations.value
})

const pendingUpcomingReservations = computed(() => {
  return upcomingReservations.value.filter((reservation) => !reservation.validated)
})

async function cancel(id) {
  if (!confirm("Annuler cette réservation ?")) return

  await $fetch(`/api/admin/cancel-reservation/${id}`, { method: "DELETE" })
  await load()
}

async function validateR(id) {
  await $fetch(`/api/admin/validate-reservation/${id}`, { method: "POST" })
  await load()
}

function formatSlot(slot) {
  if (!slot?.date) return ""

  const d = new Date(slot.date)

  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ]

  const jour = jours[d.getDay()]
  const jourNum = d.getDate()
  const moisTxt = mois[d.getMonth()]

  const h1 = slot.start_time?.slice(0, 5)
  const h2 = slot.end_time?.slice(0, 5)

  return `${jour} ${jourNum} ${moisTxt} — ${h1} → ${h2}`
}
</script>

<template>
  <div class="page admin-reservations">
    <NuxtLink to="/admin" class="back-link">
      ← Retour à l'administration
    </NuxtLink>

    <div class="admin-page-heading">
      <div>
        <h1>
          Réservations
        </h1>

        <p class="admin-intro">
          Consultez les rendez-vous à venir ou l’historique des réservations passées.
        </p>
      </div>
    </div>

    <section class="reservations-summary-grid">
      <div class="card reservation-summary-card">
        <span class="summary-label">À traiter</span>
        <strong>{{ pendingUpcomingReservations.length }}</strong>
        <p>réservation{{ pendingUpcomingReservations.length > 1 ? "s" : "" }} en attente</p>
      </div>

      <div class="card reservation-summary-card">
        <span class="summary-label">À venir</span>
        <strong>{{ upcomingReservations.length }}</strong>
        <p>rendez-vous prévu{{ upcomingReservations.length > 1 ? "s" : "" }}</p>
      </div>

      <div class="card reservation-summary-card">
        <span class="summary-label">Passées</span>
        <strong>{{ pastReservations.length }}</strong>
        <p>réservation{{ pastReservations.length > 1 ? "s" : "" }} passée{{ pastReservations.length > 1 ? "s" : "" }}</p>
      </div>
    </section>

    <section class="reservations-filter-card card">
      <div>
        <p class="section-kicker">Affichage</p>
        <h2>
          {{ selectedView === "upcoming" ? "Réservations à venir" : "Réservations passées" }}
        </h2>
      </div>

      <div class="link-type-toggle reservation-view-toggle">
        <button
          type="button"
          :class="['link-type-option', { active: selectedView === 'upcoming' }]"
          @click="selectedView = 'upcoming'"
        >
          À venir
        </button>

        <button
          type="button"
          :class="['link-type-option', { active: selectedView === 'past' }]"
          @click="selectedView = 'past'"
        >
          Passées
        </button>
      </div>
    </section>

    <p v-if="loading" class="admin-message">
      Chargement des réservations...
    </p>

    <p v-if="error" class="error">
      {{ error }}
    </p>

    <section class="reservations-section">
      <div v-if="!loading && displayedReservations.length" class="reservations-list">
        <div
          v-for="r in displayedReservations"
          :key="r.id"
          class="card reservation-card"
          :class="{ 'past-reservation-card': selectedView === 'past' }"
        >
          <div class="reservation-top">
            <div>
              <h3>{{ r.firstname }} {{ r.lastname }}</h3>

              <p class="contact">
                {{ r.email }} · {{ r.phone }}
              </p>
            </div>

            <div class="header-badges">
              <span
                class="type-badge"
                :class="r.type === 'particulier' ? 'badge-particulier' : 'badge-pro'"
              >
                {{ r.type === 'particulier' ? 'Particulier' : 'Pro' }}
              </span>

              <span v-if="r.validated" class="status validated">
                Validée
              </span>

              <span v-else class="status pending">
                {{ selectedView === "past" ? "Non validée" : "En attente" }}
              </span>
            </div>
          </div>

          <div class="reservation-slot-box">
            <span>{{ selectedView === "past" ? "Créneau passé" : "Créneau" }}</span>
            <strong>{{ formatSlot(r.slot) }}</strong>
          </div>

          <div class="documents compact-documents">
            <div class="download-row">
              <span>Ordonnance</span>

              <a
                v-if="r.ordonnance_url"
                :href="r.ordonnance_url"
                class="download-pill"
                target="_blank"
              >
                Télécharger
              </a>

              <span v-else class="download-empty">
                Aucun fichier
              </span>
            </div>

            <div class="download-row">
              <span>Carte mutuelle</span>

              <a
                v-if="r.mutuelle_url"
                :href="r.mutuelle_url"
                class="download-pill"
                target="_blank"
              >
                Télécharger
              </a>

              <span v-else class="download-empty">
                Aucun fichier
              </span>
            </div>
          </div>

          <div class="btn-row">
            <button
              v-if="selectedView === 'upcoming' && !r.validated"
              class="btn"
              @click="validateR(r.id)"
            >
              Valider
            </button>

            <button class="btn danger" @click="cancel(r.id)">
              {{ selectedView === "past" ? "Supprimer" : "Annuler" }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="!loading && !displayedReservations.length"
        class="card empty-admin-card"
      >
        <h3>
          {{ selectedView === "upcoming" ? "Aucune réservation à venir" : "Aucune réservation passée" }}
        </h3>

        <p>
          {{
            selectedView === "upcoming"
              ? "Les prochains rendez-vous apparaîtront ici."
              : "L’historique apparaîtra ici après les premiers rendez-vous."
          }}
        </p>
      </div>
    </section>
  </div>
</template>