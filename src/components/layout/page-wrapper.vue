<script setup lang="ts">
import Navbar from './navbar.vue';
import Footer from './footer.vue';
import HeroSection from './hero-section.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <Navbar />
    <HeroSection />
    <div class="flex-1 flex justify-center py-8">
      <slot />
    </div>
    <Footer />
  </div>
</template>
