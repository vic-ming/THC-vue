<template>
  <div class="video-popup" :class="currentVideo ? '!z-[4]' : ''">
    <div class="popup-mask"></div>
    <div class="popup-content">
      <div class="video-list">
        <div 
          v-for="(video, index) in videoList" 
          :key="index" 
          class="video-item"
          @click="openVideoPlayer(video)"
        >
          <div class="video-title">{{ video.name }}</div>
          <div class="video-thumbnail">
            <!-- <img :src="video.thumbnail" :alt="video.name"> -->
            <div class="video-overlay">
              <div class="play-button">
                <svg class="w-[60px] h-[60px] text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 滿版影片播放器 -->
      <Transition name="player-fade">
        <div v-if="currentVideo" class="fullscreen-player">
          <div class="player-mask" @click="closePlayer"></div>
          <div class="player-container">
            <video-player
              ref="videoPlayerRef"
              class="video-player"
              :src="currentVideo.videoUrl"
              :options="playerOptions"
              @mounted="onPlayerMounted"
            />
          </div>
        </div>
      </Transition>
    </div>

    <!-- 關閉按鈕：確保在沒有播放影片時顯示 -->
    <img 
      v-show="!currentVideo" 
      class="close-icon" 
      src="/icon/close-icon.svg" 
      alt="Close" 
      @click.stop="close"
    >
    
    <button v-if="currentVideo" class="player-close-btn" @click="closePlayer">
      {{ t('menu.return') }}
      <img class="w-[32px] h-[32px] absolute right-[-12px] top-[-12px]" src="/icon/back-icon.svg" alt="back">
    </button>
  </div>
</template>
<script setup>
import { reactive, ref, computed } from 'vue'
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const emit = defineEmits(['close'])

// 接收從父組件傳來的影片列表
const props = defineProps({
  videos: {
    type: Array,
    default: () => []
  }
})

// 使用 computed 來處理影片列表，如果沒有數據則顯示空數組
const videoList = computed(() => {
  return props.videos || []
})

const close = () => {
  console.log('close')
  emit('close')
}

// 當前播放的影片
const currentVideo = ref(null)
const videoPlayerRef = ref(null)

// 播放器配置
const playerOptions = reactive({
  autoplay: true,
  muted: false,
  loop: false,
  controls: true,
  fluid: false,
  fill: true,
  language: 'zh-TW'
})

// 打開影片播放器
const openVideoPlayer = (video) => {
  currentVideo.value = video
}

// 關閉影片播放器
const closePlayer = () => {
  // 停止播放
  if (videoPlayerRef.value && videoPlayerRef.value.$el) {
    const videoElement = videoPlayerRef.value.$el.querySelector('video')
    if (videoElement) {
      videoElement.pause()
    }
  }
  currentVideo.value = null
}

// 播放器掛載完成
const onPlayerMounted = (player) => {
  console.log('Player mounted:', player)
}
</script>

<style lang="scss" scoped>
.video-popup {
  @apply fixed top-[112px] left-[35px] w-[1651px] h-[894px] z-[2] flex items-center justify-between gap-[16px];
  
  .popup-content {
    @apply relative z-[2] h-full w-[1577px] border-[8px] border-[#FFC936] rounded-[32px] flex items-center justify-center;
    box-shadow: 2px 0px 8px 0px #00000066;
    background-color: #fff;
  }

  .video-list {
    @apply grid grid-cols-3 gap-[32px] items-end;
  }

  .video-item {
    @apply flex flex-col gap-[16px] cursor-pointer w-[480px];
    
    .video-title {
      @apply text-[32px] font-[700] text-[#2B74C6] text-left;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .video-thumbnail {
      @apply relative w-full h-[270px] overflow-hidden bg-[#000];

      img {
        @apply w-full h-full object-cover;
      }
    }

    .video-overlay {
      @apply absolute inset-0 flex items-center justify-center;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4));
      transition: background 0.3s ease;
    }

    &:hover {
      .video-overlay {
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5));
      }

      .play-button {
        transform: scale(1.15);
      }
    }

    .play-button {
      @apply w-[100px] h-[100px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
  }

  .close-icon {
    @apply relative z-[2] w-[40px] h-[40px] cursor-pointer hover:opacity-70 active:scale-95 transition-all;
    flex-shrink: 0;
    pointer-events: auto;
  }

  .popup-mask {
    @apply fixed top-0 left-0 w-full h-full z-[1];
    background-color: rgba(0, 0, 0, 0.5);
  }
}

/* 滿版播放器（在 popup 內） */
.fullscreen-player {
  @apply absolute inset-0 z-[10] flex items-center justify-center overflow-hidden rounded-[26px];

  .player-mask {
    @apply absolute inset-0 z-[1];
    background-color: rgba(0, 0, 0, 0.95);
  }

  .player-container {
    @apply relative z-[2] w-full h-full;
  }

  .video-player {
    @apply w-full h-full;
    
    :deep(.vjs-tech) {
      object-fit: cover;
    }
  }

  
}
.player-close-btn {
  @apply absolute z-[3] bottom-[0px] right-[-85px] w-[140px] h-[60px] border-[2px] flex items-center justify-center bg-white border-[#2B74C6] rounded-[24px] text-[20px] text-[#2B74C6] font-[700];
}

/* 播放器淡入淡出動畫 */
.player-fade-enter-active,
.player-fade-leave-active {
  transition: opacity 0.3s ease;
}

.player-fade-enter-active .player-container,
.player-fade-leave-active .player-container {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.player-fade-enter-from,
.player-fade-leave-to {
  opacity: 0;
}

.player-fade-enter-from .player-container,
.player-fade-leave-to .player-container {
  opacity: 0;
  transform: scale(0.9);
}

/* 淡入淡出過渡動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-active .popup-content,
.fade-leave-active .popup-content {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .popup-content,
.fade-leave-to .popup-content {
  opacity: 0;
  transform: scale(0.95);
}

</style>