<script setup>
// middleware OK
</script>

<template>
  <div class="page admin">
    <NuxtLink to="/" class="back-link">
      ← Voir le site
    </NuxtLink>

    <h1>
      Espace administration
    </h1>

    <p class="admin-intro">
      Gérez les créneaux, les réservations et les avis clients depuis cet espace sécurisé.
    </p>

    <div class="admin-cards">

      <NuxtLink to="/admin/slots" class="admin-card">
        <h3>Gestion des créneaux</h3>
        <p>Ajouter, modifier ou supprimer des créneaux.</p>
      </NuxtLink>

      <NuxtLink to="/admin/reservations" class="admin-card">
        <h3>Réservations</h3>
        <p>Consulter et annuler les réservations.</p>
      </NuxtLink>

      <NuxtLink to="/admin/avis" class="admin-card">
        <h3>Avis clients</h3>
        <p>Valider ou refuser les avis reçus depuis le site.</p>
      </NuxtLink>

      <NuxtLink to="/admin/messages" class="admin-card">
        <h3>Messages contact</h3>
        <p>Lire et traiter les messages envoyés depuis le formulaire.</p>
      </NuxtLink>

    </div>
  </div>
</template>