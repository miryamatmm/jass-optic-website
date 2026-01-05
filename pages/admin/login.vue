<script setup>
const email = ref("")
const password = ref("")
const error = ref("")

async function login() {
  const res = await $fetch("/api/admin/login", {
    method: "POST",
    body: { email: email.value, password: password.value }
  })

  if (res.success) {
    await navigateTo("/admin")
  }
  else {
    error.value = res.error
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
        class="input"
        placeholder="Adresse email"
        v-model="email"
      />

      <input
        class="input"
        type="password"
        placeholder="Mot de passe"
        v-model="password"
      />

      <button class="btn cta-full" @click="login">
        Se connecter
      </button>

      <p v-if="error" class="error">
        {{ error }}
      </p>

    </div>
  </div>
</template>
