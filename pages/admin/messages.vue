<script setup>
const loading = ref(true)
const error = ref("")
const success = ref("")
const messages = ref([])
const selectedView = ref("new")
const processingId = ref(null)

async function loadMessages() {
  loading.value = true
  error.value = ""
  success.value = ""

  try {
    const res = await $fetch("/api/admin/messages")

    messages.value = res.messages || []
  } catch (err) {
    console.error(err)
    error.value = "Impossible de charger les messages."
  } finally {
    loading.value = false
  }
}

onMounted(loadMessages)

const newMessages = computed(() => {
  return messages.value.filter((message) => message.status === "new")
})

const doneMessages = computed(() => {
  return messages.value.filter((message) => message.status === "done")
})

const displayedMessages = computed(() => {
  return selectedView.value === "done"
    ? doneMessages.value
    : newMessages.value
})

async function updateMessageStatus(id, status) {
  processingId.value = id
  error.value = ""
  success.value = ""

  try {
    await $fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      body: { status }
    })

    success.value = status === "done"
      ? "Message marqué comme traité."
      : "Message remis en nouveau."

    await loadMessages()
  } catch (err) {
    console.error(err)
    error.value = "Impossible de mettre à jour ce message."
  } finally {
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
  <div class="page admin-messages-page">
    <NuxtLink to="/admin" class="back-link">
      ← Retour à l'administration
    </NuxtLink>

    <div class="admin-page-heading">
      <div>
        <h1>
          Messages contact
        </h1>

        <p class="admin-intro">
          Consultez les messages envoyés depuis le formulaire de contact du site.
        </p>
      </div>
    </div>

    <section class="reservations-summary-grid">
      <div class="card reservation-summary-card">
        <span class="summary-label">Nouveaux</span>
        <strong>{{ newMessages.length }}</strong>
        <p>message{{ newMessages.length > 1 ? "s" : "" }} à traiter</p>
      </div>

      <div class="card reservation-summary-card">
        <span class="summary-label">Traités</span>
        <strong>{{ doneMessages.length }}</strong>
        <p>message{{ doneMessages.length > 1 ? "s" : "" }} archivé{{ doneMessages.length > 1 ? "s" : "" }}</p>
      </div>

      <div class="card reservation-summary-card">
        <span class="summary-label">Total</span>
        <strong>{{ messages.length }}</strong>
        <p>message{{ messages.length > 1 ? "s" : "" }} reçu{{ messages.length > 1 ? "s" : "" }}</p>
      </div>
    </section>

    <section class="reservations-filter-card card">
      <div>
        <p class="section-kicker">Affichage</p>
        <h2>
          {{ selectedView === "new" ? "Messages nouveaux" : "Messages traités" }}
        </h2>
      </div>

      <div class="link-type-toggle reservation-view-toggle">
        <button
          type="button"
          :class="['link-type-option', { active: selectedView === 'new' }]"
          @click="selectedView = 'new'"
        >
          Nouveaux
        </button>

        <button
          type="button"
          :class="['link-type-option', { active: selectedView === 'done' }]"
          @click="selectedView = 'done'"
        >
          Traités
        </button>
      </div>
    </section>

    <p v-if="loading" class="admin-message">
      Chargement des messages...
    </p>

    <p v-if="error" class="error">
      {{ error }}
    </p>

    <p v-if="success" class="success">
      {{ success }}
    </p>

    <section class="admin-messages-list">
      <div
        v-if="!loading && displayedMessages.length"
        class="messages-grid"
      >
        <div
          v-for="message in displayedMessages"
          :key="message.id"
          class="card admin-message-card"
          :class="{ 'done-message-card': selectedView === 'done' }"
        >
          <div class="admin-message-header">
            <div>
              <h3>
                {{ message.firstname }} {{ message.lastname }}
              </h3>

              <p v-if="message.createdAt">
                {{ formatDate(message.createdAt) }}
              </p>
            </div>

            <span
              class="status"
              :class="message.status === 'done' ? 'validated' : 'pending'"
            >
              {{ message.status === 'done' ? 'Traité' : 'Nouveau' }}
            </span>
          </div>

          <div class="admin-message-contact">
            <p>
              <strong>Email :</strong>
              <a :href="`mailto:${message.email}`">
                {{ message.email }}
              </a>
            </p>

            <p v-if="message.phone">
              <strong>Téléphone :</strong>
              <a :href="`tel:${message.phone}`">
                {{ message.phone }}
              </a>
            </p>

            <p v-else>
              <strong>Téléphone :</strong>
              <span class="download-empty">Non renseigné</span>
            </p>
          </div>

          <div class="admin-message-body">
            <p>
              {{ message.message }}
            </p>
          </div>

          <div class="btn-row">
            <button
              v-if="message.status === 'new'"
              class="btn"
              :disabled="processingId === message.id"
              @click="updateMessageStatus(message.id, 'done')"
            >
              {{ processingId === message.id ? "Traitement..." : "Marquer traité" }}
            </button>

            <button
              v-else
              class="btn"
              :disabled="processingId === message.id"
              @click="updateMessageStatus(message.id, 'new')"
            >
              {{ processingId === message.id ? "Traitement..." : "Remettre en nouveau" }}
            </button>

            <a
              class="btn"
              :href="`mailto:${message.email}`"
            >
              Répondre
            </a>
          </div>
        </div>
      </div>

      <div
        v-if="!loading && !displayedMessages.length"
        class="card empty-admin-card"
      >
        <h3>
          {{ selectedView === "new" ? "Aucun nouveau message" : "Aucun message traité" }}
        </h3>

        <p>
          {{
            selectedView === "new"
              ? "Les messages envoyés depuis le formulaire apparaîtront ici."
              : "Les messages marqués comme traités apparaîtront ici."
          }}
        </p>
      </div>
    </section>
  </div>
</template>