import { ref, computed } from 'vue'
import { fetchAllData } from '../services/api.js'

// 全局共享的數據狀態
const appData = ref(null)
const isLoading = ref(false)
const isLoaded = ref(false)
const error = ref(null)

/**
 * 全局應用數據管理 composable
 * 在整個應用中共享 API 數據，只在首次使用時加載一次
 */
export function useAppData() {
    // 產品服務列表
    const productServices = computed(() => {
        return appData.value?.product_services || []
    })

    // 區域列表
    const regions = computed(() => {
        return appData.value?.regions || []
    })

    // 首頁數據
    const homeData = computed(() => {
        return appData.value?.home || { videos: [], images: [] }
    })

    /**
     * 加載應用數據
     * 如果數據已經加載過，則不會重複加載
     */
    const loadAppData = async (force = false) => {
        // 如果已經加載過且不是強制重新加載，直接返回
        if (isLoaded.value && !force) {
            console.log('App data already loaded, using cached data')
            return appData.value
        }

        // 如果正在加載中，等待加載完成
        if (isLoading.value) {
            console.log('App data is loading...')
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!isLoading.value) {
                        clearInterval(checkInterval)
                        resolve(appData.value)
                    }
                }, 100)
            })
        }

        try {
            isLoading.value = true
            error.value = null
            console.log('Loading app data from API...')

            const data = await fetchAllData()
            appData.value = data
            isLoaded.value = true

            console.log('App data loaded successfully:', data)
            return data
        } catch (err) {
            error.value = err
            console.error('Failed to load app data:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 重新加載數據
     */
    const reloadAppData = async () => {
        return loadAppData(true)
    }

    /**
     * 清除緩存的數據
     */
    const clearAppData = () => {
        appData.value = null
        isLoaded.value = false
        error.value = null
    }

    return {
        // 數據
        appData,
        productServices,
        regions,
        homeData,

        // 狀態
        isLoading,
        isLoaded,
        error,

        // 方法
        loadAppData,
        reloadAppData,
        clearAppData
    }
}
