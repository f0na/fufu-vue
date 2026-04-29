<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from '@/admin/components/ui/sidebar';
import { admin_nav_items } from '@/admin/stores/admin-nav';

const route = useRoute();

function is_active(href: string): boolean {
  return route.path === href;
}
</script>

<template>
  <Sidebar collapsible="none" class="border-r border-border">
    <SidebarHeader class="px-4 py-3 border-b border-border">
      <div class="flex items-center gap-2">
        <div class="size-7 rounded-md bg-primary flex items-center justify-center">
          <span class="text-primary-foreground text-xs font-bold">F</span>
        </div>
        <span class="text-sm font-semibold text-foreground">Fufu Admin</span>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in admin_nav_items" :key="item.key">
              <SidebarMenuButton
                as-child
                :is-active="is_active(item.href)"
                :class="
                  cn(
                    'relative',
                    is_active(item.href) && 'bg-accent text-accent-foreground font-medium'
                  )
                "
              >
                <RouterLink :to="item.href">
                  <Icon :icon="item.icon" class="size-4" />
                  <span>{{ item.label }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
