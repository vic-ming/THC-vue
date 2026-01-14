<template>
  <Layout>
    <div class="container">
      <!-- 全球地圖 -->
      <img v-if="selectedRegion === ''" class="map-img" src="/map/world.svg" alt="map">

      <!-- 台灣 -->
      <img v-else-if="selectedRegion === '台灣'" class="map-img" src="/map/taiwan.svg" alt="map" @click="router.push('/detail')">
      <!-- 中國大陸 -->
      <img v-else-if="selectedRegion === '中國大陸'" class="map-img" src="/map/china.svg" alt="map" @click="router.push('/detail')">
      <!-- 印尼 -->
      <img v-else-if="selectedRegion === '印尼'" class="map-img" src="/map/indonesia.svg" alt="map" @click="router.push('/detail')">
      <!-- 越南 -->
      <img v-else-if="selectedRegion === '越南'" class="map-img" src="/map/vietnam.svg" alt="map" @click="router.push('/detail')">
      <!-- 泰國 -->
      <img v-else-if="selectedRegion === '泰国'" class="map-img" src="/map/thailand.svg" alt="map" @click="router.push('/detail')">
      <!-- 馬來西亞 -->
      <img v-else-if="selectedRegion === '马来西亚'" class="map-img" src="/map/malaysia.svg" alt="map" @click="router.push('/detail')">
      <!-- 緬甸 -->
      <img v-else-if="selectedRegion === '缅甸'" class="map-img" src="/map/myanmar.svg" alt="map" @click="router.push('/detail')">
      <!-- 柬埔寨 -->
      <img v-else-if="selectedRegion === '柬埔寨'" class="map-img" src="/map/cambodia.svg" alt="map" @click="router.push('/detail')">
      <!-- 莫三比克 -->
      <img v-else-if="selectedRegion === '莫三比克'" class="map-img" src="/map/mozambique.svg" alt="map" @click="router.push('/detail')">

      <!-- 右側選單 -->
      <div class="filter-right-menu">
        <button class="home-button" @click="router.push('/')">
          <img class="w-[40px] h-[40px] absolute right-[-14px] top-[-18px] " src="/icon/menu-home.svg" alt="home">
          {{ t('menu.home') }}
        </button>
        <div class="menu-inside">
          <div class="filter-box">
            <div class="filter-title">
              產品及服務
              <span @click="clearProductFilter">清除產品篩選</span>
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

          <div class="filter-box">
            <div class="filter-title">
              全球據點
              <span @click="clearRegionFilter">清除據點篩選</span>
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

// 選中的產品（多選）
const selectedProducts = ref([])
// 選中的據點（單選）
const selectedRegion = ref('')

// 切換產品選擇（多選）
const toggleProduct = (item) => {
  if (item.disabled) return
  
  const index = selectedProducts.value.indexOf(item.value)
  if (index > -1) {
    // 已選中，則取消選中
    selectedProducts.value.splice(index, 1)
  } else {
    // 未選中，則添加到選中列表
    selectedProducts.value.push(item.value)
  }
  console.log('Selected products:', selectedProducts.value)
}

// 選擇據點（單選）
const selectRegion = (item) => {
  if (item.disabled) return
  selectedRegion.value = item.value
  console.log('Selected region:', selectedRegion.value)
}

// 清除產品篩選
const clearProductFilter = () => {
  selectedProducts.value = []
  console.log('Cleared product filter')
}

// 清除據點篩選
const clearRegionFilter = () => {
  selectedRegion.value = ''
  console.log('Cleared region filter')
}

const filterTypeList = ref([
  {'name': '爪蓋', 'value': '爪蓋', 'disabled': true},
  {'name': '鋁蓋', 'value': '鋁蓋', 'disabled': false},
  {'name': '塑蓋', 'value': '塑蓋', 'disabled': false},
  {'name': '標籤', 'value': '標籤', 'disabled': false},
  {'name': 'PET寶特瓶', 'value': 'PET寶特瓶', 'disabled': false},
  {'name': '瓶胚', 'value': '瓶胚', 'disabled': false},
  {'name': '無菌充填', 'value': '無菌充填', 'disabled': false},
  {'name': '熱充填', 'value': '熱充填', 'disabled': false},
  {'name': '水充填', 'value': '水充填', 'disabled': false},
  {'name': '冷高壓充埴', 'value': '冷高壓充埴', 'disabled': false},
])
const filterRegionList = ref([
  {'name': '台灣', 'value': '台灣', amount: 10, disabled: false },
  {'name': '中國大陸', 'value': '中國大陸', amount: 14, disabled: false },
  {'name': '印尼', 'value': '印尼', amount: 7, disabled: false },
  {'name': '越南', 'value': '越南', amount: 5, disabled: false },
  {'name': '泰国', 'value': '泰国', amount: 5, disabled: false },
  {'name': '马来西亚', 'value': '马来西亚', amount: 2, disabled: false },
  {'name': '缅甸', 'value': '缅甸', amount: 4, disabled: false },
  {'name': '柬埔寨', 'value': '柬埔寨', amount: 1, disabled: false },
  {'name': '莫三比克', 'value': '莫三比克', amount: 0, disabled: true },
])


</script>
<style scoped>

</style>
