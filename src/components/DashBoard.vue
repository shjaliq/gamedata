<template>
  <div class="dashboard">
    
    <!-- 左侧：钻取柱状图 + 热力图 -->
    <div class="left-panel">
      <div class="chart-box drill-chart">
        <BarChart />
      </div>
      <div class="chart-box heatmap-chart">
        <WorldMap />
      </div>
    </div>

    <!-- 右侧：上三图 + 下地图 -->
    <div class="right-panel">
      <div class="pie-row">
        <div class="chart-box pie-wrapper">
          <PieChart />
        </div>
        <div class="chart-box pie-wrapper">
          <GameCommentImage />
        </div>
        <div class="chart-box pie-wrapper">
          <GameWordcloudImage />
        </div>
      </div>

      <div class="chart-box map-chart">
        <YearlySalesChartMini />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import BarChart from './BarChart.vue'
import PieChart from './PieChart.vue'
import WorldMap from './WorldMap.vue'
import GameCommentImage from './GameCommentImage.vue'
import GameWordcloudImage from './GameWordcloudImage.vue'
import YearlySalesChartMini from './YearlySalesChartMini.vue'

const showTopHint = ref(false)

onMounted(() => {
  // 添加滚动监听，在顶部时显示提示
  window.addEventListener('scroll', checkScrollPosition)
  checkScrollPosition()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', checkScrollPosition)
})

function checkScrollPosition() {
  // 当页面滚动到顶部时显示提示
  showTopHint.value = window.scrollY < 100
}
</script>

<style scoped>
:root {
  --gap: 1.5rem;
}

.dashboard {
  display: flex;
  height: 100vh;
  width: 100vw;
  padding: var(--gap);
  box-sizing: border-box;
  background: #f5f6fa;
  position: relative;
}

.top-hint {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  text-align: center;
  color: #3498db;
  font-size: 1.2rem;
  opacity: 0.8;
  z-index: 10;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.4; }
  50% { opacity: 0.8; }
  100% { opacity: 0.4; }
}

.left-panel {
  flex: 1.3;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  min-width: 300px;
}

.right-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  min-width: 500px;
}

.chart-box {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 1;
}

.pie-row {
  display: flex;
  gap: var(--gap);
  flex: 1;
  min-height: 200px;
}

.pie-wrapper {
  flex: 1;
  aspect-ratio: 1 / 1;
  min-width: 0;
}

.map-chart {
  flex: 1.3;
  min-height: 300px;
}

.drill-chart {
  flex: 3;
  min-height: 400px;
}

.heatmap-chart {
  flex: 2;
  min-height: 300px;
}

@media (max-width: 1200px) {
  .dashboard {
    flex-direction: column;
  }
  
  .left-panel,
  .right-panel {
    min-width: 100%;
  }
}
</style>
