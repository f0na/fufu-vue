import { ref, type Ref } from 'vue';

export interface RightSidebarPortalValue {
  portal_target: Ref<HTMLElement | null>;
  set_portal_target: (target: HTMLElement | null) => void;
}

const default_value: RightSidebarPortalValue = {
  portal_target: ref(null),
  set_portal_target: () => {},
};

export const RightSidebarPortalKey = Symbol('rightSidebarPortal');

export function create_right_sidebar_portal() {
  return { ...default_value };
}
