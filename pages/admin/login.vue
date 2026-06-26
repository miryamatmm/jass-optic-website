<script setup>
const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)

async function login() {
  error.value = ""

  if (!email.value.trim() || !password.value.trim()) {
    error.value = "Merci de renseigner vos identifiants."
    return
  }

  loading.value = true

  try {
    const res = await $fetch("/api/admin/login", {
      method: "POST",
      body: {
        email: email.value.trim(),
        password: password.value
      }
    })

    if (res.success) {
      await navigateTo("/admin")
      return
    }

    error.value = res.error || "Identifiants incorrects."
  } catch (err) {
    console.error(err)
    error.value = "Impossible de se connecter pour le moment."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page login">

    <h1>
      Accès administrateur
    </h1>

    <p class="login-intro">
      Cet espace est réservé à l’administration.
    </p>

    <div class="card login-card">
      <input
        v-model="email"
        class="input"
        type="email"
        placeholder="Adresse email"
        autocomplete="email"
        @keyup.enter="login"
      />

      <input
        v-model="password"
        class="input"
        type="password"
        placeholder="Mot de passe"
        autocomplete="current-password"
        @keyup.enter="login"
      />

      <button
        class="btn cta-full"
        :disabled="loading"
        @click="login"
      >
        {{ loading ? "Connexion..." : "Se connecter" }}
      </button>

      <p v-if="error" class="error">
        {{ error }}
      </p>
    </div>
  </div>
</template>