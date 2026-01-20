<template>
  <Layout>
    <div class="container">
      <!-- 背景曲線 -->
      <img class="top-bg" src="/detail-top-bg.svg" alt="bg"> 
      
      <!-- 可置換的圖片容器 -->
      <div class="top-img-wrapper">
        <div class="top-img-container">
          <img :src="topImage" alt="detail-top" class="top-img opacity-40" />
          <div class="top-title">印尼KIIC無菌飲料廠</div>
        </div>
      </div>

      <!-- 右側選單 -->
      <div class="right-menu">
        <div class="menu-inside">
          <div class="menu-group">
            <div 
              v-for="item in detailMenuItems"
              :key="item.id"
              class="menu-item"
              :class="selectedMenu === item.id ? 'menu-item-selected' : ''"
              @click="handleMenuSelect(item.id)"
            >
              <img class="w-[32px] h-[32px] absolute right-[-12px] top-[-12px]" :src="item.icon" :alt="item.id">
              <span :class="locale === 'en' ? 'text-[18px]' : 'text-[20px]'">{{ item.name }}</span>
            </div>
          </div>
          <div 
            v-for="(item, index) in rightMenu" 
            :key="item.name" 
            :class="[
              'menu-item !w-[140px]', 
              index === 0 ? 'yellow' : '',
              index === 1 ? 'blue' : '',
              locale === 'en' ? 'text-[18px]' : 'text-[20px]',
            ]"
            @click="item.onClick"
          >
            <img class="w-[32px] h-[32px] absolute right-[-12px] top-[-12px]" :src="item.icon" :alt="item.name">
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>


      <!-- 關於本廠 -->
      <div class="detail-content">
        <div class="detail-info">
          <div class="date">{{ t('factory.establishmentDate') }} <span>2023/12</span></div>
          <div class="country">印尼</div>
          <div class="address">41361 Industrial VI Lot PD Road 13-15, Margamulya Village/Sub-district, West Telukjambe District, Karawang Regency, West Java Province, Indonesia</div>
        </div>
        
        <div class="detail-swiper">
          <swiper
            ref="swiperRef"
            :modules="swiperModules"
            :slides-per-view="1"
            :space-between="0"
            :navigation="{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }"
            :pagination="{
              clickable: true,
              el: '.swiper-pagination',
            }"
            :loop="true"
            class="factory-swiper"
            @slideChange="onSlideChange"
          >
            <swiper-slide v-for="(image, index) in factoryImages" :key="index">
              <img :src="image" :alt="`Factory image ${index + 1}`" class="swiper-image">
            </swiper-slide>
            
            <!-- Custom Navigation Buttons -->
            <div class="swiper-button-prev">
              <img src="/icon/arrow-icon-yellow.svg" alt="arrow-icon-yellow">
            </div>
            <div class="swiper-button-next">
              <img src="/icon/arrow-icon-yellow.svg" alt="arrow-icon-yellow" class="rotate-180">
            </div>
            
            <!-- Pagination -->
            <div class="swiper-pagination"></div>
          </swiper>

          <!-- Thumbnail Images -->
          <div class="thumbnail-container">
            <div 
              v-for="(image, index) in factoryImages.slice(0, 4)" 
              :key="index"
              class="thumbnail-item"
              :class="{ 'active': index === activeSlideIndex }"
              @click="goToSlide(index)"
            >
              <img :src="image" :alt="`Thumbnail ${index + 1}`">
            </div>
          </div>

         
        </div>
        <div class="detail-chart">
          <img src="/chart-info-example.svg" alt="chart">
        </div>
      </div>

      <!-- 訪廠影片 -->
      <Transition name="popup-zoom">
        <div v-if="selectedMenu === 'video'" class="common-content !z-[5]">
          <div class="popup-mask" @click="selectedMenu = 'introduction'"></div>
          <div class="video-content">
            <video-player
              ref="videoPlayerRef"
              class="video-player"
              src="/example.mp4"
              :options="playerOptions"
              @mounted="onPlayerMounted"
            />
          </div>
          <img class="close-icon" src="/icon/close-icon.svg" alt="Close" @click="selectedMenu = 'introduction'">
        </div>
      </Transition>
      <!-- 360 影片 -->
      <Transition name="popup-zoom">
        <div v-if="selectedMenu === 'video360'" class="common-content !z-[5]">
          <div class="popup-mask" @click="selectedMenu = 'introduction'"></div>
          <div class="video-content">
            <video-player
              ref="video360PlayerRef"
              class="video-player"
              src="/example.mp4"
              :options="playerOptions"
              @mounted="onPlayerMounted"
            />
          </div>
          <img class="close-icon" src="/icon/close-icon.svg" alt="Close" @click="selectedMenu = 'introduction'">
        </div>
      </Transition>
    </div>
  </Layout>
</template>
<script setup>
import { useRouter } from 'vue-router'
import Layout from '../components/layout/layout.vue'
import { useI18n } from 'vue-i18n'
import { computed, ref, reactive } from 'vue'
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const router = useRouter()
const { t, locale } = useI18n()

// 選中的選單項目
const selectedMenu = ref('introduction')

// Video player refs
const videoPlayerRef = ref(null)
const video360PlayerRef = ref(null)

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

// 播放器掛載完成
const onPlayerMounted = (player) => {
  console.log('Player mounted:', player)
}


// 語系切換函數
const toggleLanguage = () => {
  locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW'
  // 保存到 localStorage
  localStorage.setItem('app-locale', locale.value)
  console.log('Language switched to:', locale.value)
}

// 可置換的頂部圖片
const topImage = ref('/top-img-example.jpg')

// Swiper modules
const swiperModules = [Navigation, Pagination]
const swiperRef = ref(null)
const activeSlideIndex = ref(0)

// Factory images for the carousel
const factoryImages = ref([
  '/top-img-example.jpg',
  '/top-img-example.jpg',
  '/top-img-example.jpg',
  '/top-img-example.jpg',
])

// Handle slide change
const onSlideChange = (swiper) => {
  // Get the real index (not the loop index)
  activeSlideIndex.value = swiper.realIndex
}

// Go to specific slide
const goToSlide = (index) => {
  console.log('goToSlide called with index:', index)
  console.log('swiperRef.value:', swiperRef.value)
  
  if (swiperRef.value && swiperRef.value.$el) {
    const swiper = swiperRef.value.$el.swiper
    console.log('swiper instance:', swiper)
    if (swiper) {
      swiper.slideTo(index)
      activeSlideIndex.value = index
    }
  }
}

// 詳情頁選單項目
const detailMenuItems = [
  {
    id: 'introduction',
    name: computed(() => t('menu.introduction')),
    icon: '/icon/menu-info.svg'
  },
  {
    id: 'video',
    name: computed(() => t('menu.video')),
    icon: '/icon/menu-camera.svg'
  },
  {
    id: 'video360',
    name: computed(() => t('menu.video360')),
    icon: '/icon/menu-video.svg'
  }
]

// 選單選擇處理函數
const handleMenuSelect = (menuId) => {
  selectedMenu.value = menuId
  console.log('Menu selected:', menuId)
}

// 使用 computed 讓選單項目響應語言變化
const rightMenu = computed(() => [
  {
    id: 'home',
    name: t('menu.home'),
    icon: '/icon/menu-home.svg',
    selectable: false,
    onClick: () => {router.push('/')}
  },
  {
    id: 'language',
    name: t('menu.language'),
    icon: '/icon/menu-lang.svg',
    selectable: false,
    onClick: toggleLanguage
  },

  {
    id: 'return',
    name: t('menu.return'),
    icon: '/icon/back-icon.svg',
    selectable: true,
    onClick: () => {router.push('/filter')}
  },

])
</script>
<style scoped>
.top-img-wrapper {
  @apply w-full fixed top-0 left-0;
  height: 304px;
  filter: drop-shadow(0 0 16px rgba(43, 116, 198, 1));
  z-index: 1;
}

.top-img-container {
  @apply w-full h-full bg-white;
  clip-path: path('M1920 0V222.812C1759.61 282.215 1593.52 306.453 1410.68 304C1184.35 300.964 972.593 246.778 760.236 196.684C517.909 139.518 258.167 112.83 0 118.019V0.00152588H1920V0Z');
  overflow: hidden;
}

.top-img {
  @apply w-full h-full;
  object-fit: cover;
  object-position: center;
}
.top-title{
  @apply text-[67px] font-[900] text-[#2B74C6] absolute right-[207px] top-[50px] leading-[96px] w-[670px];
  letter-spacing: 1px;
  text-shadow: 
    -4px -4px 0 #fff,
     4px -4px 0 #fff,
    -4px  4px 0 #fff,
     4px  4px 0 #fff,
    -4px  0   0 #fff,
     4px  0   0 #fff,
     0   -4px 0 #fff,
     0    4px 0 #fff;
}
.right-menu{
  bottom: 175px; 
  z-index: 6;
}
.menu-inside{
  padding: 19px 0 27px 20px;
  align-items: center;
}
.detail-info{
  @apply flex flex-col fixed top-[150px] left-[64px] w-[480px];
  .date{
    @apply leading-[30px] text-[20px] font-[700] text-black;
    span{
      color: #2B74C6;
    }
  }
  .country{
    @apply leading-[48px] text-[32px] font-[700] text-[#FFC936];
    text-shadow: 
      -2px -2px 0 #000,
       2px -2px 0 #000,
      -2px  2px 0 #000,
       2px  2px 0 #000,
      -2px  0   0 #000,
       2px  0   0 #000,
       0   -2px 0 #000,
       0    2px 0 #000;
  }
  .address{
    @apply text-[16px] font-[500] text-black leading-[25px];
    letter-spacing: 1px;
  }
}

.detail-swiper{
  @apply fixed top-[370px] left-[58px] w-[662px] z-[3];
}

.detail-chart{
  @apply fixed top-[376px] left-[840px] w-[768px] h-[572px];
}

.factory-swiper {
  @apply w-full h-[372px] rounded-[24px] overflow-hidden;
  border: 6px solid #2B74C6;
  box-shadow: 4.5px 8.25px 7.05px 0px #00000040;
}

.swiper-image {
  @apply w-full h-full object-cover;
}

/* Custom Navigation Buttons */
.factory-swiper :deep(.swiper-button-prev),
.factory-swiper :deep(.swiper-button-next) {
  @apply w-[32px] h-[32px] rounded-full absolute z-[11];

}
.factory-swiper :deep(.swiper-button-prev){
  @apply bottom-[10px] right-[61px] left-[auto] top-[auto];
}
.factory-swiper :deep(.swiper-button-next){
  @apply bottom-[10px] right-[13px] left-[auto] top-[auto];
}

/* Pagination Dots */
.factory-swiper :deep(.swiper-pagination) {
  bottom: 15px !important;
}

.factory-swiper :deep(.swiper-pagination-bullet) {
  @apply w-[15px] h-[15px] bg-[#2B74C6] opacity-100 mx-[6px];
  transition: all 0.3s ease;
}

.factory-swiper :deep(.swiper-pagination-bullet-active) {
  @apply w-[15px] opacity-100;
  background: #C6E0F1;
}

/* Thumbnail Container */
.thumbnail-container {
  @apply h-[96px] flex gap-[16px] mt-[16px] justify-between items-center;
}

.thumbnail-item {
  @apply w-[137px] h-[85px] rounded-[18px] overflow-hidden cursor-pointer;
  border: 2px solid #2B74C6;
  box-shadow: 2px 0px 8px 0px #00000066;
  transition: all 0.3s ease;
}

.thumbnail-item.active {
  @apply w-[155px] h-[96px] ;
}

.thumbnail-item img {
  @apply w-full h-full object-cover;
}

.common-content{
  @apply fixed inset-0 z-[2] flex items-center justify-center gap-[16px];
  padding: 152px 218px 84px 142px;

  .popup-mask {
    @apply fixed inset-0 z-[1];
    background-color: rgba(0, 0, 0, 0.5);
  }

  .video-content{
    @apply relative z-[2] h-full w-[1488px] border-[8px] border-[#FFC936] rounded-[32px] flex items-center justify-center;
    box-shadow: 2px 0px 8px 0px #00000066;
    background-color: #fff;
  }

  .video-player {
    @apply w-full h-full rounded-[24px] overflow-hidden;
    
    :deep(.vjs-tech) {
      object-fit: cover;
      border-radius: 24px;
    }
  }

  .close-icon {
    @apply relative z-[2] cursor-pointer hover:opacity-70 transition-opacity;
  }
  
}

.popup-zoom-enter-active,
.popup-zoom-leave-active {
  transition: opacity 1.2s ease-in-out;
}

.popup-zoom-enter-active :deep(.video-content),
.popup-zoom-leave-active :deep(.video-content),
.popup-zoom-enter-active :deep(.close-icon),
.popup-zoom-leave-active :deep(.close-icon) {
  transition: transform 1.2s ease-in-out;
}

.popup-zoom-enter-from,
.popup-zoom-leave-to {
  opacity: 0;
}

.popup-zoom-enter-from :deep(.video-content),
.popup-zoom-leave-to :deep(.video-content),
.popup-zoom-enter-from :deep(.close-icon),
.popup-zoom-leave-to :deep(.close-icon) {
  transform: scale(0.1);
}
</style>
