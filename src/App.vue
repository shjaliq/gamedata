<template>
  <div class="app-container" ref="appContainer">
    <div class="page-section" ref="introSection">
      <Intro />
    </div>
    
    <div class="page-section" ref="dashboardSection">
      <div id="chart">
        <Dashboard />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Intro from './components/Intro.vue'
import Dashboard from './components/Dashboard.vue'

const appContainer = ref(null)
const introSection = ref(null)
const dashboardSection = ref(null)
let currentSection = ref(0)
let isScrolling = false

onMounted(() => {
  setupScrollObserver()
  // 移除滚动事件监听器，允许内部滚动
  // setupScrollListeners()
  window.addEventListener('scroll-to-dashboard', () => {
    scrollToSection(1) // 滚动到dashboard部分
  })
})

onBeforeUnmount(() => {
  // 移除滚动事件监听器
  window.removeEventListener('wheel', handleWheel, { passive: false })
  window.removeEventListener('touchstart', handleTouchStart, { passive: false })
  window.removeEventListener('touchmove', handleTouchMove, { passive: false })
})

function setupScrollObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target === introSection.value) {
          currentSection.value = 0
        } else if (entry.target === dashboardSection.value) {
          currentSection.value = 1
        }
      }
    })
  }, { threshold: 0.5 })
  
  observer.observe(introSection.value)
  observer.observe(dashboardSection.value)
}

// 移除这些函数，因为它们会阻止内部滚动
// function setupScrollListeners() { ... }
// function handleTouchStart(e) { ... }
// function handleTouchMove(e) { ... }
// function handleWheel(e) { ... }

function scrollToSection(index) {
  isScrolling = true
  const section = index === 0 ? introSection.value : dashboardSection.value
  
  section.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
  
  setTimeout(() => {
    isScrolling = false
  }, 1000)
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  overflow: auto; /* 改为允许滚动 */
  position: relative;
  scroll-behavior: smooth;
}

.page-section {
  min-height: 100vh; /* 改为 min-height 允许内容扩展 */
  width: 100vw;
}

/* 移除强制滚动捕捉 */
/* .app-container {
  scroll-snap-type: y mandatory;
} */
</style>
