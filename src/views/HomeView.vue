<template>
  <Layout>
    <div class="container">
      <!-- 全球地圖 & 區域地圖 -->
      <Transition :name="mapTransitionName" mode="out-in">
        <!-- 1. World Map (Home Mode & Filter Mode Root) -->
        <WorldMap
          v-if="currentMapMode === 'world'"
          key="world-map"
          :map-src="currentMapSrc"
          :selected-region="selectedRegion"
          :region-data="currentRegionList"
          @region-click="handleRegionClick"
          class="map-img"
        />
        
        <!-- 2. Region Map (Filter Mode - Selected Region) -->
        <RegionMap
          v-else-if="currentMapMode === 'region'"
          :key="`region-map-${selectedRegion}`"
          :map-src="currentMapSrc"
          :region="selectedRegion"
          :factories="currentRegionFactories"
          :selected-products="selectedProducts"
          @factory-click="handleFactoryClick"
          class="map-img"
        />

        <!-- 3. Sales Location Image (Home Mode - Landmark) -->
        <img 
          v-else-if="currentMapMode === 'landmark'" 
          key="landmark" 
          class="map-img" 
          :src="salesLocationImage" 
          alt="Logo"
        >
      </Transition>
      
      <!-- 右側選單區域 -->
      <Transition name="slide-in-right" mode="out-in" appear>
        
        <!-- HOME MENU -->
        <div v-if="!isFilterMode" class="right-menu" key="home-menu">
          <div class="menu-inside">
            <div 
              v-for="(item, index) in rightMenu" 
              :key="item.id" 
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

        <!-- FILTER MENU -->
        <div v-else class="filter-right-menu" key="filter-menu">
          <button class="home-button" @click="exitFilterMode">
            <img class="w-[40px] h-[40px] absolute right-[-14px] top-[-18px] " src="/icon/menu-home.svg" alt="home">
            {{ t('menu.home') }}
          </button>
          <div class="menu-inside">
            <!-- Product Filter -->
            <div class="filter-box">
              <div class="filter-title" :class="{ '!text-[28px]': locale === 'en' }">
                {{ t('filter.productsAndServices') }}
                <span :class="{ '!text-[20px]': locale === 'en' }" @click="clearProductFilter">{{ t('filter.clearProductFilter') }}</span>
              </div>
              <div class="filter-list">
                <div 
                  class="filter-item" 
                  :class="{
                    'disabled': item.disabled,
                    'selected': selectedProducts.includes(item.value)
                  }" 
                  v-for="item in filterTypeList" 
                  :key="item.value" 
                  @click="toggleProduct(item)"
                >
                  {{ item.name }}
                </div>
              </div>
            </div>

            <!-- Region Filter -->
            <div class="filter-box">
              <div class="filter-title" :class="{ '!text-[28px]': locale === 'en' }">
                {{ t('location.global') }}
                <span :class="{ '!text-[20px]': locale === 'en' }" @click="clearRegionFilter">{{ t('location.clean') }}</span>
              </div>
              <div class="region-list">
                <div 
                  class="region-item" 
                  :class="{'selected': selectedRegion === item.value, 'disabled': item.disabled}"
                  v-for="item in filterRegionList" 
                  :key="item.value"
                  @click="selectRegion(item)"
                >
                  <img v-if="selectedRegion === item.value" src="/icon/arrow-icon-active.svg" alt="arrow">
                  <img v-else src="/icon/arrow-icon.svg" alt="arrow">
                  <span>{{ item.name }}({{ item.amount }})</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Transition>


      <!-- 據點查詢按鈕 (Only in Home Mode) -->
      <Transition name="fade">
        <div v-if="!isFilterMode" class="search-button" @click="enterFilterMode">
          <img src="/search-btn-img.svg" alt="Search">
          <div class="flex-1 flex items-center justify-center" :class="locale === 'en' ? 'text-[18px]' : 'text-[24px]'">{{ t('location.finder') }}</div>
        </div>
      </Transition>

      <Transition name="popup-zoom">
        <TotalPopup
          v-if="selectedMenu === 'stats'" 
          :image="homeImage"
          @close="selectedMenu = null" 
        />
      </Transition>

      <Transition name="popup-zoom">
        <VideoListPopup 
          v-if="selectedMenu === 'groupVideo'" 
          :videos="homeVideos"
          @close="selectedMenu = null" 
        />
      </Transition>
    </div>
  </Layout>
</template>
<script setup>
import { useRouter, useRoute } from 'vue-router'
import Layout from '../components/layout/layout.vue'
import WorldMap from '../components/WorldMap.vue'
import RegionMap from '../components/RegionMap.vue'
import TotalPopup from '../components/total-popup.vue'
import VideoListPopup from '../components/video-list-popup.vue'
import { useI18n } from 'vue-i18n'
import { computed, ref, watch, onMounted } from 'vue'
import { useAppData } from '../composables/useAppData.js'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

// 使用全局共享的應用數據
const { homeData, salesLocations, regions, productServices } = useAppData()

// State
const selectedMenu = ref(null) // 'home', 'stats', 'groupVideo', 'coopLandmark', etc.
const isFilterMode = ref(false) // Toggle between Home View and Filter View

// Filter State
const selectedProducts = ref([])
const selectedRegion = ref('')
const previousRegion = ref('')

// Initialize from route query if present (e.g. deep linking)
onMounted(() => {
  if (route.query.filter === 'true' || route.path === '/filter') {
    isFilterMode.value = true
    if (route.query.region) selectedRegion.value = route.query.region
    if (route.query.products) selectedProducts.value = route.query.products.split(',')
  }
})

// --- Computed Properties for Map ---

const currentMapMode = computed(() => {
  if (!isFilterMode.value) {
    return selectedMenu.value === 'coopLandmark' ? 'landmark' : 'world'
  }
  // Filter Mode
  return selectedRegion.value ? 'region' : 'world'
})

const currentMapSrc = computed(() => {
  if (currentMapMode.value === 'region') {
    return `/map/${selectedRegion.value}.svg`
  }
  return '/map/world.svg'
})

// Unified Region List for WorldMap
const currentRegionList = computed(() => {
  if (!isFilterMode.value) {
    // HOME MODE: Show all regions with total factory counts
    if (!regions.value || regions.value.length === 0) return []
    return regions.value.map(region => ({
      name: locale.value === 'zh-TW' ? region.name.zh : region.name.en,
      value: (region.name.en || '').toLowerCase().replace(/\s+/g, '-'),
      amount: region.factories ? region.factories.length : 0,
      id: region.id
    }))
  } else {
    // FILTER MODE: Show regions with filtered counts
    return filterRegionList.value
  }
})

const mapTransitionName = computed(() => {
  if (!isFilterMode.value) {
    return 'map-fade'
  }
  // Filter Mode Transitions
  if (previousRegion.value === '' && selectedRegion.value !== '') return 'map-zoom'
  if (previousRegion.value !== '' && selectedRegion.value === '') return 'map-zoom-reverse'
  return 'map-fade'
})

// --- Computed Properties for Home Data ---

const homeVideos = computed(() => {
  if (!homeData.value?.videos) return []
  return homeData.value.videos.map(video => ({
    id: video.id,
    name: locale.value === 'zh-TW' ? video.title.zh : video.title.en,
    videoUrl: locale.value === 'zh-TW' ? video.video.zh.url : video.video.en.url,
    fileName: locale.value === 'zh-TW' ? video.video.zh.name : video.video.en.name
  }))
})

const homeImage = computed(() => {
  if (!homeData.value?.images) return ''
  return locale.value === 'zh-TW' ? homeData.value.images[0].image.zh : homeData.value.images[0].image.en
})

const salesLocationImage = computed(() => {
  if (!salesLocations.value?.length) return '/map/world-landmark.svg'
  const location = salesLocations.value[0]
  return (locale.value === 'zh-TW' ? location.image.zh : location.image.en) || '/map/world-landmark.svg'
})

// --- Computed Properties for Filter Data (Migrated) ---

const currentRegionFactories = computed(() => {
  if (selectedRegion.value === '' || !regions.value) return []
  const selectedRegionData = regions.value.find(region => {
    return (region.name.en || '').toLowerCase().replace(/\s+/g, '-') === selectedRegion.value
  })
  return selectedRegionData?.factories || []
})

const filterTypeList = computed(() => {
  if (!productServices.value?.length) return []
  
  let availableProductServices = new Set()
  
  if (selectedRegion.value !== '') {
    const selectedRegionData = regions.value?.find(region => {
      return (region.name.en || '').toLowerCase().replace(/\s+/g, '-') === selectedRegion.value
    })
    
    if (selectedRegionData?.factories) {
      selectedRegionData.factories.forEach(factory => {
        factory.product_services?.forEach(service => {
          if (service.name?.zh) availableProductServices.add(service.name.zh)
        })
      })
    }
  }
  
  return productServices.value.map(service => {
    const serviceName = service.name.zh
    const isDisabled = selectedRegion.value !== '' && !availableProductServices.has(serviceName)
    return {
      name: locale.value === 'zh-TW' ? service.name.zh : service.name.en,
      value: serviceName,
      id: service.id,
      disabled: isDisabled
    }
  })
})

const filterRegionList = computed(() => {
  if (!regions.value?.length) return []
  
  return regions.value.map(region => {
    let factoryCount = 0
    if (region.factories) {
      if (selectedProducts.value.length === 0) {
        factoryCount = region.factories.length
      } else {
        factoryCount = region.factories.filter(factory => {
          const factoryServices = factory.product_services?.map(s => s.name.zh) || []
          return selectedProducts.value.some(product => factoryServices.includes(product))
        }).length
      }
    }
    
    return {
      name: locale.value === 'zh-TW' ? region.name.zh : region.name.en,
      value: (region.name.en || '').toLowerCase().replace(/\s+/g, '-'),
      amount: factoryCount,
      id: region.id,
      disabled: factoryCount === 0
    }
  })
})

// --- Actions ---

const enterFilterMode = () => {
  isFilterMode.value = true
  selectedRegion.value = ''
  previousRegion.value = ''
  // Optional: clear selected menu from home ??
  selectedMenu.value = null 
}

const exitFilterMode = () => {
  isFilterMode.value = false
  selectedRegion.value = ''
  previousRegion.value = ''
  selectedProducts.value = [] // Reset filters?
}

const handleRegionClick = (region) => {
  console.log('Region clicked:', region)
  if (!isFilterMode.value) {
    // If in Home mode, clicking a region enters Filter Mode for that region
    isFilterMode.value = true
    previousRegion.value = ''
    selectedRegion.value = region
  } else {
    // If in Filter mode, standard selection
    previousRegion.value = selectedRegion.value
    selectedRegion.value = region
  }
}

const handleFactoryClick = ({ factory }) => {
  router.push({
    path: '/detail',
    query: { 
      region: selectedRegion.value,
      factoryId: factory.id,
      products: selectedProducts.value.join(',')
    }
  })
}

// Filter Actions
const toggleProduct = (item) => {
  if (item.disabled) return
  const index = selectedProducts.value.indexOf(item.value)
  if (index > -1) selectedProducts.value.splice(index, 1)
  else selectedProducts.value.push(item.value)
}

const selectRegion = (item) => {
  if (item.disabled) return
  previousRegion.value = selectedRegion.value
  selectedRegion.value = item.value
}

const clearProductFilter = () => selectedProducts.value = []

const clearRegionFilter = () => {
  previousRegion.value = selectedRegion.value
  selectedRegion.value = ''
}

// Watchers
watch(selectedRegion, (newRegion) => {
  if (newRegion !== '') {
    // Filter available products for this region (logic from FilterView)
    const availableServices = new Set()
    const selectedRegionData = regions.value?.find(region => 
      (region.name.en || '').toLowerCase().replace(/\s+/g, '-') === newRegion
    )
    
    selectedRegionData?.factories?.forEach(factory => {
      factory.product_services?.forEach(service => {
        if (service.name?.zh) availableServices.add(service.name.zh)
      })
    })
    
    selectedProducts.value = selectedProducts.value.filter(product => 
      availableServices.has(product)
    )
  }
})

// Home Menu Actions
const toggleLanguage = () => {
  locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW'
  localStorage.setItem('app-locale', locale.value)
}

const handleMenuSelect = (menuId) => selectedMenu.value = menuId

const rightMenu = computed(() => [
  { id: 'home', name: t('menu.home'), icon: '/icon/menu-home.svg', selectable: false, onClick: () => { router.push('/') } },
  { id: 'language', name: t('menu.language'), icon: '/icon/menu-lang.svg', selectable: false, onClick: toggleLanguage },
  { id: 'stats', name: t('stats.total'), icon: '/icon/menu-chart.svg', selectable: true, onClick: () => handleMenuSelect('stats') },
  { id: 'groupVideo', name: t('menu.groupVideo'), icon: '/icon/menu-video.svg', selectable: true, onClick: () => handleMenuSelect('groupVideo') },
  { id: 'coopLandmark', name: t('menu.coopLandmark'), icon: '/icon/menu-global.svg', selectable: true, onClick: () => handleMenuSelect('coopLandmark') }
])
</script>
<style scoped>
.popup-zoom-enter-active,
.popup-zoom-leave-active,
.map-zoom-enter-active,
.map-zoom-leave-active,
.map-zoom-reverse-enter-active,
.map-zoom-reverse-leave-active {
  transition: all 1.2s ease-in-out;
}

.popup-zoom-enter-active :deep(.popup-content),
.popup-zoom-leave-active :deep(.popup-content),
.popup-zoom-enter-active :deep(.close-icon),
.popup-zoom-leave-active :deep(.close-icon) {
  transition: transform 1.2s ease-in-out;
}

.popup-zoom-enter-from,
.popup-zoom-leave-to {
  opacity: 0;
}

.popup-zoom-enter-from :deep(.popup-content),
.popup-zoom-leave-to :deep(.popup-content),
.popup-zoom-enter-from :deep(.close-icon),
.popup-zoom-leave-to :deep(.close-icon) {
  transform: scale(0.1);
}

.map-zoom-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.map-zoom-leave-to {
  opacity: 0;
  transform: scale(1.2);
}

.map-zoom-reverse-enter-from {
  opacity: 0;
  transform: scale(1.2);
}

.map-zoom-reverse-leave-to {
  opacity: 0;
}

.map-fade-enter-active,
.map-fade-leave-active {
  transition: opacity 0.7s ease-in-out;
}

.map-fade-enter-from,
.map-fade-leave-to {
  opacity: 0;
}

.slide-in-right-enter-active,
.slide-in-right-leave-active {
  transition: all 0.8s ease-out;
}

.slide-in-right-enter-from,
.slide-in-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
