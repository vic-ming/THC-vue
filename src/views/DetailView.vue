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
      <div v-if="selectedMenu === 'introduction'" class="detail-content">
        <div class="detail-info">
          <div class="date">設立日期： <span>2023/12</span></div>
          <div class="country">印尼</div>
          <div class="address">41361 Industrial VI Lot PD Road 13-15, Margamulya Village/Sub-district, West Telukjambe District, Karawang Regency, West Java Province, Indonesia</div>
        </div>

        <div class="detail-chart">
          <img src="/chart-info-example.svg" alt="chart">
        </div>
      </div>

      <!-- 訪廠影片 -->
      <div v-if="selectedMenu === 'video'" class="common-content">
        <div class="video-content">
          <video class="w-full h-full object-cover rounded-[24px]" controls autoplay loop muted>
            <source src="/example.mp4" type="video/mp4">
            您的瀏覽器不支援影片播放。
          </video>
        </div>
        <img class="close-icon" src="/icon/close-icon.svg" alt="Close" @click="selectedMenu = 'introduction'">
      </div>
      <!-- 360 影片 -->
      <div v-if="selectedMenu === 'video360'" class="common-content">
        <div class="video-content">
          <video class="w-full h-full object-cover rounded-[24px]" controls autoplay loop muted>
            <source src="/example.mp4" type="video/mp4">
            您的瀏覽器不支援影片播放。
          </video>
        </div>
        <img class="close-icon" src="/icon/close-icon.svg" alt="Close" @click="selectedMenu = 'introduction'">
      </div>
    </div>
  </Layout>
</template>
<script setup>
import { useRouter } from 'vue-router'
import Layout from '../components/layout/layout.vue'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'

const router = useRouter()
const { t, locale } = useI18n()

// 選中的選單項目
const selectedMenu = ref('introduction')

// 語系切換函數
const toggleLanguage = () => {
  locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW'
  console.log('Language switched to:', locale.value)
}

// 可置換的頂部圖片
const topImage = ref('/top-img-example.jpg')

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

.detail-chart{
  @apply fixed top-[376px] left-[840px] w-[768px] h-[572px];
}

.common-content{
  @apply fixed z-[2] top-[212px] left-[142px] flex items-center justify-between gap-[16px] w-[1488px] h-[804px];
  .video-content{
    @apply relative z-[2] h-full w-[1577px] border-[8px] border-[#FFC936] rounded-[32px] flex items-center justify-center;
    box-shadow: 2px 0px 8px 0px #00000066;
    background-color: #fff;
  }
  
}
</style>
