<template>
  <div class="landing">

    <!-- HEADER -->
    <header class="header">
      <img src="/images/logo.png" alt="Jass Optic" class="logo" />

      <nav class="nav">
        <NuxtLink to="/">Accueil</NuxtLink>
        <NuxtLink to="/reserver">Rendez-vous</NuxtLink>
      </nav>
    </header>

    <!-- HERO -->
    <section class="hero">
      <img
        src="/images/hero.jpg"
        alt="Jass Optic"
        class="hero-bg"
      />

      <div class="hero-content">
        <h1>
          L’art de réinventer<br />
          votre regard
        </h1>

        <NuxtLink to="/reserver" class="btn hero-cta">
          Prendre rendez-vous
        </NuxtLink>
      </div>
    </section>

    <!-- GALLERY -->
    <section class="gallery">
      <img src="/images/gallery/model-1.jpg" alt="Jass Optic" />
      <img src="/images/gallery/model-2.jpg" alt="Jass Optic" />
      <img src="/images/gallery/model-3.jpg" alt="Jass Optic" />
      <img src="/images/gallery/model-4.jpg" alt="Jass Optic" />
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

  </div>
</template>
