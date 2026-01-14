<template>
  <Layout>
    <div class="container">
      <!-- 全球地圖 -->
      <img v-if="selectedMenu !== 'coopLandmark'" class="map-img" src="/map/world.svg" alt="Home">

      <!-- 全球地圖-銷售據點圖 -->
      <img v-else class="map-img" src="/map/world-landmark.svg" alt="Logo">
      
      <!-- 右側選單 -->
      <div class="right-menu">
        <div class="menu-inside">
          <div 
            v-for="(item, index) in rightMenu" 
            :key="item.name" 
            :class="[
              'menu-item', 
              index === 0 ? 'yellow' : '',
              index === 1 ? 'blue' : '',
              locale === 'en' ? 'text-[18px]' : 'text-[20px]',
              item.selectable && selectedMenu === item.id ? 'menu-item-selected' : ''
            ]"
            @click="item.onClick"
          >
            <img class="w-[32px] h-[32px] absolute right-[-12px] top-[-12px]" :src="item.icon" :alt="item.name">
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- 據點查詢 -->
      <div class="search-button" @click="router.push('/filter')">
        <img src="/search-btn-img.svg" alt="Search">
        <div class="flex-1 flex items-center justify-center" :class="locale === 'en' ? 'text-[18px]' : 'text-[24px]'">{{ t('location.finder') }}</div>
      </div>

      <Transition name="fade">
        <TotalPopup v-if="selectedMenu === 'stats'" @close="selectedMenu = null" />
      </Transition>

      <Transition name="fade">
        <VideoListPopup v-if="selectedMenu === 'groupVideo'" @close="selectedMenu = null" />
      </Transition>
    </div>
  </Layout>
</template>
<script setup>
import { useRouter } from 'vue-router'
import Layout from '../components/layout/layout.vue'
import TotalPopup from '../components/total-popup.vue'
import VideoListPopup from '../components/video-list-popup.vue'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'

const router = useRouter()
const { t, locale } = useI18n()

// 選中的選單項目
const selectedMenu = ref(null)

// 語系切換函數
const toggleLanguage = () => {
  locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW'
  console.log('Language switched to:', locale.value)
}

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
    id: 'stats',
    name: t('stats.total'),
    icon: '/icon/menu-chart.svg',
    selectable: true,
    onClick: () => handleMenuSelect('stats')
  },
  {
    id: 'groupVideo',
    name: t('menu.groupVideo'),
    icon: '/icon/menu-video.svg',
    selectable: true,
    onClick: () => handleMenuSelect('groupVideo')
  },
  {
    id: 'coopLandmark',
    name: t('menu.coopLandmark'),
    icon: '/icon/menu-global.svg',
    selectable: true,
    onClick: () => handleMenuSelect('coopLandmark')
  }
])
</script>
<style scoped>

</style>
