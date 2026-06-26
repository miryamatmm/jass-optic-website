<script setup>
const galleryImages = [
  "/images/gallery/model-1.jpg",
  "/images/gallery/model-2.jpg",
  "/images/gallery/model-3.jpg",
  "/images/gallery/model-4.jpg"
]
</script>

<template>
  <div class="landing">

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

    <!-- HERO -->
    <section class="hero hero-brand-section">
      <div class="hero-inner">
        <div class="hero-text">
          <p class="hero-kicker">Opticienne diplômée</p>

          <h1>
            L’art de réinventer<br />
            votre regard
          </h1>

          <p class="hero-subtitle">
            Des montures choisies avec soin, pour femmes et hommes,
            avec un accompagnement personnalisé.
          </p>
        </div>

        <div class="hero-mark">
          <img
            src="/images/logo.png"
            alt="Jass Optic"
            class="hero-logo"
          />
        </div>
      </div>
    </section>

    <!-- GALLERY -->
    <section class="gallery-section">
      <div class="section-heading">
        <p class="section-kicker">Sélection optique</p>
        <h2>Une allure pensée pour chaque visage</h2>
        <p>
          Des modèles sobres, élégants ou affirmés, sélectionnés pour accompagner
          aussi bien les styles féminins que masculins.
        </p>
      </div>

      <div class="gallery">
        <img
          v-for="image in galleryImages"
          :key="image"
          :src="image"
          alt="Monture optique Jass Optic"
        />
      </div>
    </section>

    <!-- VALUES -->
    <section class="values">
      <div class="value">
        <h3>Conseil personnalisé</h3>
        <p>Chaque visage est unique.</p>
      </div>

      <div class="value">
        <h3>Commande à distance</h3>
        <p>Sans déplacement inutile.</p>
      </div>

      <div class="value">
        <h3>Accompagnement mutuelle</h3>
        <p>On s’occupe de votre dossier.</p>
      </div>
    </section>

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