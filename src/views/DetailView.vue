<template>
  <Layout>
    <Transition name="page-fade" appear>
      <div class="container relative z-[2]">
      <!-- 背景曲線 -->
      <img class="top-bg" src="/detail-top-bg.svg" alt="bg"> 
      
      <!-- 可置換的圖片容器 -->
      <div class="top-img-wrapper">
        <div class="top-img-container">
          <img :src="topImage" alt="detail-top" class="top-img opacity-40" />
          <div class="top-title" :class="locale === 'en' ? 'text-[52px] leading-[60px]' : 'text-[67px] leading-[96px]'" v-html="currentFactory ? (locale === 'zh-TW' ? getCorrectName(currentFactory.name.zh) : getCorrectName(currentFactory.name.en)) : '工廠詳情'"></div>
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
              :class="{
                'menu-item-selected': selectedMenu === item.id,
                'disabled': item.disabled
              }"
              @click="handleMenuSelect(item)"
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
          <div class="date">{{ t('factory.establishmentDate') }} <span>{{ currentFactory?.established_date || '-' }}</span></div>
          <div class="country">{{ currentRegion ? (locale === 'zh-TW' ? currentRegion.name.zh : currentRegion.name.en) : '' }}</div>
          <div class="address">{{ currentFactory ? (locale === 'zh-TW' ? currentFactory.address.zh : currentFactory.address.en) : 'address'}}</div>
        </div>
        
        <div v-if="factoryImages.length > 0" class="detail-swiper">
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
        <div v-else class="detail-swiper">
          <p>暫無圖片</p>
        </div>

        <div class="detail-chart">
          <img v-if="factoryLogo" :src="factoryLogo" alt="chart">
          <div v-else class="chart-placeholder">
            <p>暫無資訊</p>
          </div>
        </div>
      </div>

      <!-- 訪廠影片 -->
      <Transition name="popup-zoom">
        <div v-if="selectedMenu === 'video'" class="common-content !z-[5]">
          <div class="popup-mask" @click="selectedMenu = 'introduction'"></div>
          <div class="video-content">
            <video-player
              :key="visitVideoSrc"
              ref="videoPlayerRef"
              class="video-player"
              :src="visitVideoSrc"
              :options="playerOptions"
              @mounted="onPlayerMounted"
            />
            <div class="player-step">
              <button
                type="button"
                aria-label="Switch visit video"
                :class="{ disabled: !canSwitchVisitVideo }"
                :disabled="!canSwitchVisitVideo"
                @click.stop="switchVisitVideo"
              >
                <img src="/icon/movie_arrow_left.svg" alt="back">
              </button>
              <button
                type="button"
                aria-label="Switch visit video"
                :class="{ disabled: !canSwitchVisitVideo }"
                :disabled="!canSwitchVisitVideo"
                @click.stop="switchVisitVideo"
              >
                <img src="/icon/movie_arrow_right.svg" alt="next">
              </button>
            </div>
          </div>
          <img class="close-icon" src="/icon/close-icon.svg" alt="Close" @click="selectedMenu = 'introduction'">

          
        </div>
      </Transition>
      <!-- 360 影片 -->
      <Transition name="popup-zoom">
        <div v-if="selectedMenu === 'video360'" class="common-content !z-[5]">
          <div class="popup-mask" @click="selectedMenu = 'introduction'"></div>
          <div class="video-content">
            <Video360
              :key="video360Src"
              ref="video360PlayerRef"
              class="video-player"
              :src="video360Src"
              :autoplay="true"
              :muted="false"
              :loop="true"
            />
            <div class="player-step">
              <button
                type="button"
                aria-label="Switch 360 video"
                :class="{ disabled: !canSwitchVideo360 }"
                :disabled="!canSwitchVideo360"
                @click.stop="switchVideo360"
              >
                <img src="/icon/movie_arrow_left.svg" alt="back">
              </button>
              <button
                type="button"
                aria-label="Switch 360 video"
                :class="{ disabled: !canSwitchVideo360 }"
                :disabled="!canSwitchVideo360"
                @click.stop="switchVideo360"
              >
                <img src="/icon/movie_arrow_right.svg" alt="next">
              </button>
            </div>
          </div>
          <img class="close-icon" src="/icon/close-icon.svg" alt="Close" @click="selectedMenu = 'introduction'">
        </div>
      </Transition>
      </div>
    </Transition>
  </Layout>
</template>
<script setup>
import { useRouter, useRoute } from 'vue-router'
import Layout from '../components/layout/layout.vue'
import Video360 from '../components/Video360.vue'
import { useI18n } from 'vue-i18n'
import { computed, ref, reactive, watch } from 'vue'
import { useAppData } from '../composables/useAppData.js'
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

// 使用全局共享的應用數據
const { regions } = useAppData()

// 獲取從 FilterView 傳來的參數
const regionFromRoute = ref(route.query.region || '')
const factoryIdFromRoute = ref(route.query.factoryId || '')

// 獲取當前區域數據
const currentRegion = computed(() => {
  if (!regionFromRoute.value || !regions.value) return null
  
  return regions.value.find(region => {
    const regionValue = (region.name.en || '').toLowerCase().replace(/\s+/g, '-')
    return regionValue === regionFromRoute.value
  })
})

// 獲取當前工廠數據
const currentFactory = computed(() => {
  if (!factoryIdFromRoute.value || !regions.value) {
    console.log('No factoryId or regions data')
    return null
  }
  
  console.log('Looking for factory with ID:', factoryIdFromRoute.value, 'Type:', typeof factoryIdFromRoute.value)
  
  // 遍歷所有區域找到對應的工廠
  for (const region of regions.value) {
    if (region.factories && Array.isArray(region.factories)) {
      const factory = region.factories.find(f => {
        // 使用寬鬆比較，支持數字和字符串
        return f.id == factoryIdFromRoute.value || String(f.id) === String(factoryIdFromRoute.value)
      })
      if (factory) {
        console.log('Found factory:', factory.name, 'ID:', factory.id)
        return factory
      }
    }
  }
  
  console.warn('Factory not found for ID:', factoryIdFromRoute.value)
  console.log('Available regions:', regions.value.map(r => ({
    name: r.name,
    factoryCount: r.factories?.length || 0,
    factoryIds: r.factories?.map(f => f.id) || []
  })))
  return null
})


const getCorrectName = (name) => {
  if (name.includes('(')) {
    const parts = name.split('(')
    const line1 = parts[0].trim()
    const line2 = '(' + parts.slice(1).join('(')
    console.log(line1 + '<br>' + line2);
    return line1 +'<br>'+ line2
  } else {
    return name
  }
}
 
// 選中的選單項目
const selectedMenu = ref('introduction')

// Video player refs
const videoPlayerRef = ref(null)
const video360PlayerRef = ref(null)
const visitVideoIndex = ref(0)
const video360Index = ref(0)

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

// 根據語系獲取圖片列表
const localizedImages = computed(() => {
  if (!currentFactory.value?.images) return []
  
  // 根據當前 locale 選擇陣列
  const langKey = locale.value === 'zh-TW' ? 'zh' : 'en'
  const imageList = currentFactory.value.images[langKey]
  
  return Array.isArray(imageList) ? imageList : []
})

// 可置換的頂部圖片（使用當前語系的單一圖片欄位）
const topImage = computed(() => {
  if (!currentFactory.value?.image) return '/top-img-example.jpg'
  
  const langKey = locale.value === 'zh-TW' ? 'zh' : 'en'
  return currentFactory.value.image[langKey] || '/top-img-example.jpg'
})

// Swiper modules
const swiperModules = [Navigation, Pagination]
const swiperRef = ref(null)
const activeSlideIndex = ref(0)

// Factory images for the carousel (使用工廠數據中的本地化圖片)
const factoryImages = computed(() => {
  const images = localizedImages.value
  if (images.length > 0) {
    return images
  }
  // 如果沒有圖片，顯示預設占位圖
  return [
    '/top-img-example.jpg',
    '/top-img-example.jpg',
  ]
})

// 工廠 Logo 路徑
const factoryLogo = computed(() => {
  if (!currentFactory.value?.logo) return null
  
  const langKey = locale.value === 'zh-TW' ? 'zh' : 'en'
  return currentFactory.value.logo[langKey] || null
})

const getLocalizedMediaSrc = (media) => {
  if (!media) return null
  if (typeof media === 'string') return media
  if (Array.isArray(media)) {
    for (const item of media) {
      const src = getLocalizedMediaSrc(item)
      if (src) return src
    }
    return null
  }

  const langKey = locale.value === 'zh-TW' ? 'zh' : 'en'
  const fallbackLangKey = langKey === 'zh' ? 'en' : 'zh'
  const localizedSrc = getLocalizedMediaSrc(media[langKey]) || getLocalizedMediaSrc(media[fallbackLangKey])
  if (localizedSrc) return localizedSrc

  for (const key of ['url', 'src', 'path', 'file', 'video']) {
    const src = getLocalizedMediaSrc(media[key])
    if (src) return src
  }

  for (const value of Object.values(media)) {
    const src = getLocalizedMediaSrc(value)
    if (src) return src
  }

  return null
}

const getFactoryVideoList = (fieldNames) => {
  if (!currentFactory.value) return []
  return fieldNames
    .map(fieldName => getLocalizedMediaSrc(currentFactory.value[fieldName]))
    .filter(Boolean)
}

// 訪廠影片路徑
const visitVideos = computed(() => getFactoryVideoList(['visit_video', 'visit_video_2']))

const visitVideoSrc = computed(() => {
  if (!visitVideos.value.length) return null
  return visitVideos.value[visitVideoIndex.value] || visitVideos.value[0]
})

// 360 影片路徑
const video360Videos = computed(() => getFactoryVideoList(['video_360', 'video_360_2']))

const video360Src = computed(() => {
  if (!video360Videos.value.length) return null
  return video360Videos.value[video360Index.value] || video360Videos.value[0]
})

const canSwitchVisitVideo = computed(() => visitVideos.value.length > 1)
const canSwitchVideo360 = computed(() => video360Videos.value.length > 1)

watch(visitVideos, (videos) => {
  if (visitVideoIndex.value >= videos.length) {
    visitVideoIndex.value = 0
  }
})

watch(video360Videos, (videos) => {
  if (video360Index.value >= videos.length) {
    video360Index.value = 0
  }
})

const switchVideoByStep = (videos, indexRef) => {
  if (videos.value.length <= 1) return
  indexRef.value = (indexRef.value + 1) % videos.value.length
}

const switchVisitVideo = () => {
  switchVideoByStep(visitVideos, visitVideoIndex)
}

const switchVideo360 = () => {
  console.log('switchVideo360 called');
  switchVideoByStep(video360Videos, video360Index)
}

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

// 詳情頁選單項目 (改為 computed 以響應數據變化)
const detailMenuItems = computed(() => [
  {
    id: 'introduction',
    name: t('menu.introduction'),
    icon: '/icon/menu-info.svg',
    disabled: false
  },
  {
    id: 'video',
    name: t('menu.video'),
    icon: '/icon/menu-camera.svg',
    disabled: !visitVideoSrc.value
  },
  {
    id: 'video360',
    name: t('menu.video360'),
    icon: '/icon/menu-video.svg',
    disabled: !video360Src.value
  }
])

// 選單選擇處理函數
const handleMenuSelect = (item) => {
  if (item.disabled) return
  selectedMenu.value = item.id
  console.log('Menu selected:', item.id)
}

// 返回到該國家的地圖頁面
const handleReturn = () => {
  if (regionFromRoute.value) {
    // 返回到該國家的地圖,並保持區域選擇
    router.push({
      path: '/filter',
      query: { region: regionFromRoute.value }
    })
  } else {
    // 如果沒有區域信息,返回到全球地圖
    router.push('/filter')
  }
}

// 使用 computed 讓選單項目響應語言變化
const rightMenu = computed(() => [
  {
    id: 'home',
    name: t('menu.home'),
    icon: '/icon/menu-home.svg',
    selectable: false,
    onClick: () => {router.push('/filter')}
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
    onClick: handleReturn
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
  @apply font-[900] text-[#2B74C6] absolute right-[182px] top-[50px] w-[750px];
  letter-spacing: 1px;
  -webkit-text-stroke: 8px #fff;
  paint-order: stroke fill;
}
.right-menu{
  bottom: 175px; 
  z-index: 6;
}
.menu-inside{
  padding: 19px 0 27px 20px;
  align-items: center;
}
.menu-item.disabled {
  color: #B3B3B3 !important;
  background-color: #EAEAEA !important;
  border-color: #FFFFFF !important;
  cursor: not-allowed;
  pointer-events: none;
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
    -webkit-text-stroke: 5px #000;
    paint-order: stroke fill;
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
  @apply h-[96px] flex gap-[16px] mt-[16px] justify-start items-center;
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

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.8s ease-in-out;
}

.page-fade-enter-from {
  opacity: 0;
}

.player-step {
  @apply absolute z-[3] bottom-[0px] right-[-145px] w-[112px] gap-[16px] flex items-center justify-center;
}
.player-step button {
  @apply w-[48px] h-[48px] cursor-pointer;
}
.player-step button:disabled,
.player-step button.disabled {
  @apply cursor-default opacity-40;
}
.player-step img {
  @apply w-full h-full;
  pointer-events: none;
}

</style> 
