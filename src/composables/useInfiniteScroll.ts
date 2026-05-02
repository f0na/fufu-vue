import { ref, onUnmounted, watch, type Ref } from 'vue';

interface UseInfiniteScrollOptions {
  has_more?: boolean;
  onLoadMore: () => Promise<void> | void;
  initial_loading?: boolean;
  root_margin?: string;
  root?: Ref<HTMLElement | null> | null;
  disabled?: boolean;
}

interface UseInfiniteScrollReturn {
  loadMore: () => Promise<void>;
  isLoading: Ref<boolean>;
  hasMore: Ref<boolean>;
  sentinelRef: Ref<HTMLDivElement | null>;
}

export function useInfiniteScroll({
  has_more = true,
  onLoadMore,
  initial_loading = false,
  root = null,
  root_margin = undefined,
  disabled = false,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const isLoading = ref(initial_loading);
  const hasMore = ref(has_more);
  const sentinelRef = ref<HTMLDivElement | null>(null);
  let observer: IntersectionObserver | null = null;
  let is_loading_ref = false;
  let initial_load_done = false;

  const doLoadMore = async () => {
    if (is_loading_ref || !hasMore.value) return;
    is_loading_ref = true;
    isLoading.value = true;
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Failed to load more data:', error);
    } finally {
      isLoading.value = false;
      is_loading_ref = false;
    }
  };

  // 标记初始加载完成
  watch(
    () => disabled,
    (newVal) => {
      if (!newVal) {
        const raf_id = requestAnimationFrame(() => {
          initial_load_done = true;
          const sentinel = sentinelRef.value;
          if (sentinel && hasMore.value && !is_loading_ref) {
            const rect = sentinel.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              doLoadMore();
            }
          }
        });
        onUnmounted(() => cancelAnimationFrame(raf_id));
      }
    }
  );

  // 更新 hasMore
  watch(
    () => has_more,
    (val) => {
      hasMore.value = val;
    }
  );

  // 设置 Intersection Observer
  watch(sentinelRef, (sentinel) => {
    if (!sentinel || disabled) return;

    if (observer) observer.disconnect();

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore.value && !is_loading_ref && initial_load_done) {
          doLoadMore();
        }
      },
      {
        root: root?.value || null,
        rootMargin: root_margin,
        threshold: 0,
      }
    );

    observer.observe(sentinel);
  });

  onUnmounted(() => {
    if (observer) observer.disconnect();
  });

  return {
    loadMore: doLoadMore,
    isLoading,
    hasMore,
    sentinelRef,
  };
}
