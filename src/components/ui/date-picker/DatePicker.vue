<script setup lang="ts">
import { ref } from 'vue';
import type { DateValue } from '@internationalized/date';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@iconify/vue';

const props = defineProps<{
  modelValue: string;
}>();
const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

function to_date_value(s: string): DateValue {
  try {
    return parseDate(s);
  } catch {
    return today(getLocalTimeZone());
  }
}

const date = ref(to_date_value(props.modelValue)) as ReturnType<typeof ref<DateValue>>;
</script>

<template>
  <Popover v-slot="{ close }">
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="w-36 justify-between font-normal">
        {{ date.toDate(getLocalTimeZone()).toLocaleDateString() }}
        <Icon icon="lucide:chevron-down" class="size-3.5 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto overflow-hidden p-0" align="start">
      <Calendar
        :model-value="date"
        layout="month-and-year"
        @update:model-value="(val: DateValue) => {
          if (val) {
            date = val;
            emit('update:modelValue', val.toString());
            close();
          }
        }"
      />
    </PopoverContent>
  </Popover>
</template>
