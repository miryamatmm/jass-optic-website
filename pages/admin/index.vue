<script setup>
// middleware OK
</script>

<template>
  <div class="page admin">

    <h1>
      Espace administration
    </h1>

    <p class="admin-intro">
      Gérez les créneaux et les réservations depuis cet espace sécurisé.
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

    </div>
  </div>
</template>
