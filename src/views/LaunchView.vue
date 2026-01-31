<template>
  <div class="launch-view fixed inset-0 w-screen h-screen overflow-hidden bg-black z-[9999]">
    <video-player
      ref="videoPlayerRef"
      class="video-player vjs-big-play-centered"
      :src="videoUrl"
      :options="playerOptions"
      @mounted="onPlayerMounted"
      @error="onPlayerError"
    />
    <div class="absolute inset-0 cursor-pointer flex items-end justify-center pb-[49px] z-10">
      <button class="common-button-outline" @click="handleSkipClick">SKIP</button>
    </div>

    <!-- 右下角音量控制按鈕 -->
    <button
      @click.stop="toggleMute"
      class="absolute bottom-8 right-8 z-20 w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group active:scale-95"
      :class="{ 'bg-white/20': !isMuted }"
    >
      <!-- 靜音圖示 -->
      <svg v-if="isMuted" class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      </svg>
      <!-- 有聲音圖示 -->
      <svg v-else class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'
import { useAppData } from '../composables/useAppData.js'

const router = useRouter()
const { introVideo } = useAppData()

const videoUrl = computed(() => {
  return introVideo.value?.video_url || '/example.mp4'
})

const videoError = ref(false)
const isMuted = ref(true)
const videoPlayerRef = ref(null)
let playerInstance = null

const playerOptions = reactive({
  autoplay: true,
  muted: true,
  loop: false,
  controls: false,
  fluid: false,
  fill: true,
  language: 'zh-TW'
})

const onPlayerMounted = (player) => {
  console.log('Player is ready', player)
  playerInstance = player
  
  // 監聽影片播放結束事件
  const videoElement = document.querySelector('.launch-view video')
  if (videoElement) {
    videoElement.addEventListener('ended', () => {
      router.push('/home')
    })
  }
}

const onPlayerError = (error) => {
  console.error('VideoJS Error:', error)
  videoError.value = true
}

const handleSkipClick = () => {
    router.push('/home')
}

const toggleMute = () => {
  try {
    // 方法 1: 通過 ref 查找 video 元素
    let videoElement = null
    
    if (videoPlayerRef.value) {
      videoElement = videoPlayerRef.value.$el?.querySelector('video')
    }
    
    // 方法 2: 直接從 DOM 查找
    if (!videoElement) {
      videoElement = document.querySelector('.launch-view video')
    }
    
    if (videoElement) {
      // 切換靜音狀態
      videoElement.muted = !videoElement.muted
      videoElement.volume = 1.0
      isMuted.value = videoElement.muted
      
      console.log(isMuted.value ? '🔇 Video muted' : '🔊 Video unmuted')
      console.log('Muted:', videoElement.muted)
      console.log('Volume:', videoElement.volume)
    } else {
      console.error('❌ Video element not found')
    }
  } catch (error) {
    console.error('Error toggling mute:', error)
  }
}
</script>

<style lang="scss" scoped>
.launch-view {
  cursor: none;
  
  :deep(.video-player) {
    width: 100%;
    height: 100%;
    
    .vjs-tech {
      object-fit: cover;
    }
  }
}
</style>
