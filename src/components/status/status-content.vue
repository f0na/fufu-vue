<script setup lang="ts">
import { ref } from 'vue';
import RunningDaysCounter from '@/components/status/running-days-counter.vue';
import StatusStatsGrid from '@/components/status/status-stats-grid.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent]);

const default_trend_data = [
  { month: '一月', visitors: 45 },
  { month: '二月', visitors: 68 },
  { month: '三月', visitors: 89 },
  { month: '四月', visitors: 128 },
];

const chart_option = ref({
  grid: { left: 12, right: 12, top: 20, bottom: 20 },
  xAxis: {
    type: 'category' as const,
    data: default_trend_data.map((d) => d.month),
    boundaryGap: false,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { margin: 8 },
  },
  yAxis: {
    type: 'value' as const,
    splitLine: { lineStyle: { type: 'dashed' } },
  },
  tooltip: {
    trigger: 'axis' as const,
    axisPointer: { type: 'line' },
  },
  series: [
    {
      type: 'line' as const,
      data: default_trend_data.map((d) => d.visitors),
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(90, 143, 168, 0.4)' },
            { offset: 1, color: 'rgba(90, 143, 168, 0.05)' },
          ],
        },
      },
      lineStyle: { color: 'hsl(195, 30%, 50%)' },
      itemStyle: { color: 'hsl(195, 30%, 50%)' },
    },
  ],
});
</script>

<template>
  <div>
    <!-- 运行天数计时器 -->
    <RunningDaysCounter start_date="2026-04-17" class="mb-6" />

    <!-- 统计数据网格 -->
    <div class="mb-6">
      <h2 class="text-lg font-medium text-foreground mb-4">统计数据</h2>
      <StatusStatsGrid />
    </div>

    <!-- 访问趋势图表 -->
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">访问趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <VChart :option="chart_option" style="height: 250px" />
      </CardContent>
    </Card>
  </div>
</template>
