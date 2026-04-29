<script setup lang="ts">
import AdminSidebar from '@/admin/components/admin-sidebar.vue';
import AdminTopBar from '@/admin/components/admin-top-bar.vue';
import { RouterView } from 'vue-router';
import { SidebarProvider } from '@/admin/components/ui/sidebar';
</script>

<template>
  <SidebarProvider>
    <div class="flex flex-1 bg-background min-h-svh">
      <AdminSidebar />
      <div class="flex flex-1 flex-col min-w-0">
        <AdminTopBar />
        <main class="flex-1 overflow-y-auto p-6">
          <RouterView />
        </main>
      </div>
    </div>
  </SidebarProvider>
</template>
