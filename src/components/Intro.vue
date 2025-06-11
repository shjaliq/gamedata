<template>
  <div class="intro-page" ref="introRef">
    <!-- 装饰元素 -->
    <div class="decoration gamepad-1">🎮</div>
    <div class="decoration gamepad-2">🕹️</div>
    <div class="decoration gamepad-3">👾</div>
    
    <!-- 主要内容 -->
    <div class="content">
      <h1 class="title">🎮 GameData <span>游戏销量可视化</span></h1>
      <p class="tip">↓ 向下滑动或点击按钮进入 ↓</p>
      <button @click="scrollToChart" class="scroll-btn">
        探索数据
        <svg class="arrow-icon" viewBox="0 0 24 24">
          <path d="M12 17.414l-5.707-5.707 1.414-1.414L12 14.586l4.293-4.293 1.414 1.414L12 17.414z"/>
        </svg>
      </button>
    </div>
    
    <!-- 优化后的波浪效果 -->
    <div class="wave-container">
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
    </div>
    
    <!-- 成员信息 - 右下角 -->
    <div class="team-info">
      <div class="team-name">不知道叫什么2号队</div>
      <div class="team-members">
        <span>张琛</span>
        <span>陈桂斌</span>
        <span>唐武咲</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const introRef = ref(null)
let scrolled = ref(false)

const scrollToChart = () => {
  if (scrolled.value) return
  scrolled.value = true
  
  // 修复：触发自定义事件，App.vue 需要监听此事件
  const event = new CustomEvent('scroll-to-dashboard')
  window.dispatchEvent(event)
  
  // 添加按钮点击反馈
  const btn = document.querySelector('.scroll-btn')
  if (btn) {
    btn.classList.add('clicked')
    setTimeout(() => btn.classList.remove('clicked'), 300)
  }
}

// 修复：使用 IntersectionObserver 检测是否返回顶部
let observer = null

onMounted(() => {
  // 添加滚轮/触摸事件
  window.addEventListener('wheel', handleScrollTrigger, { passive: true })
  window.addEventListener('touchstart', handleScrollTrigger, { passive: true })
  
  // 创建 IntersectionObserver 检测是否返回顶部
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
        scrolled.value = false
      }
    })
  }, { threshold: 0.9 })
  
  if (introRef.value) {
    observer.observe(introRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleScrollTrigger)
  window.removeEventListener('touchstart', handleScrollTrigger)
  if (observer && introRef.value) {
    observer.unobserve(introRef.value)
  }
})

// 优化滚动触发逻辑
const handleScrollTrigger = (e) => {
  // 检查是否已经滚动过
  if (scrolled.value) return
  
  // 检查滚动方向（只允许向下滚动触发）
  const deltaY = e.deltaY || e.touches?.[0]?.clientY || 0
  if (deltaY > 10) {
    scrollToChart()
  }
}
</script>

<style scoped>
.intro-page {
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #1a2a6c, #2c3e50, #3498db);
  background-size: 400% 400%;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  animation: gradientBG 15s ease infinite;
}

.content {
  z-index: 2;
  text-align: center;
  padding: 20px;
  position: relative;
  width: 90%;
  max-width: 800px;
  margin-bottom: 60px; /* 为波浪留出空间 */
}

.team-info {
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 12px 20px;
  width: fit-content;
  animation: fadeIn 2s ease forwards;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: right;
  z-index: 3;
  transition: transform 0.3s ease;
}

.team-info:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
}

.team-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: #f1c40f;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 1rem;
}

.title {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: fadeInDown 1s ease;
}

.title span {
  display: block;
  font-size: 2rem;
  margin-top: 0.5rem;
  color: #f1c40f;
}

.tip {
  margin-top: 1.5rem;
  font-size: 1.3rem;
  opacity: 0.9;
  animation: fadeIn 2s ease;
}

.scroll-btn {
  margin-top: 3rem;
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  animation: float 3s ease-in-out infinite;
  border: 2px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  z-index: 2;
}

.scroll-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.scroll-btn:hover::before {
  left: 100%;
}

.scroll-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.scroll-btn.clicked {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.arrow-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

/* 装饰元素 */
.decoration {
  position: absolute;
  font-size: 5rem;
  opacity: 0.15;
  z-index: 1;
  filter: blur(1px);
  pointer-events: none;
}

.gamepad-1 {
  top: 20%;
  left: 15%;
  animation: float 6s ease-in-out infinite;
}

.gamepad-2 {
  bottom: 30%;
  right: 15%;
  animation: float 8s ease-in-out infinite 1s;
}

.gamepad-3 {
  top: 40%;
  right: 20%;
  animation: float 7s ease-in-out infinite 0.5s;
}

/* 波浪容器 */
.wave-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 20%;
  overflow: hidden;
  z-index: 1;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background-repeat: repeat-x;
  transform-origin: bottom;
}

.wave-1 {
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 70%);
  animation: wave-animation 12s linear infinite;
  opacity: 0.7;
}

.wave-2 {
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: wave-animation 16s linear infinite reverse;
  opacity: 0.5;
  bottom: -10px;
}

.wave-3 {
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 70%);
  animation: wave-animation 20s linear infinite;
  opacity: 0.3;
  bottom: -20px;
}

/* 动画定义 */
@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes wave-animation {
  0% { transform: translateX(0) scaleY(1); }
  50% { transform: translateX(-25%) scaleY(0.85); }
  100% { transform: translateX(-50%) scaleY(1); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  
  .title span {
    font-size: 1.5rem;
  }
  
  .team-info {
    bottom: 20px;
    right: 20px;
    padding: 10px 15px;
  }
  
  .team-name {
    font-size: 1.1rem;
  }
  
  .team-members {
    font-size: 0.9rem;
  }
  
  .scroll-btn {
    padding: 0.8rem 2rem;
    font-size: 1rem;
  }
  
  .wave-container {
    height: 15%;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 2rem;
  }
  
  .team-info {
    bottom: 15px;
    right: 15px;
    padding: 8px 12px;
    border-radius: 15px;
  }
  
  .team-name {
    font-size: 1rem;
  }
  
  .team-members {
    font-size: 0.8rem;
  }
  
  .tip {
    font-size: 1.1rem;
  }
  
  .scroll-btn {
    font-size: 0.9rem;
    padding: 0.7rem 1.8rem;
  }
  
  .decoration {
    font-size: 3.5rem;
  }
}
</style>
