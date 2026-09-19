<template>
  <AppHeader />
  <main class="container mt-5">
    <router-view />
  </main>
  <AppFooter />
</template>

<script setup>
import IconSprite from '@/components/IconSprite.vue';
import AppHeader from '@/components/layout/header.vue';
import AppFooter from '@/components/layout/footer.vue';
</script>