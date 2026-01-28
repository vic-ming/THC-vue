// API 基礎配置
const API_BASE_URL = 'https://honchuan.vjinc.biz/api/v1/frontend'

/**
 * 獲取所有數據（包含 home, product_services, regions）
 */
export async function fetchAllData() {
    try {
        const response = await fetch(`${API_BASE_URL}/all`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        return result.data
    } catch (error) {
        console.error('Error fetching all data:', error)
        throw error
    }
}

/**
 * 獲取產品服務列表
 */
export async function fetchProductServices() {
    try {
        const data = await fetchAllData()
        return data.product_services || []
    } catch (error) {
        console.error('Error fetching product services:', error)
        return []
    }
}

/**
 * 獲取區域列表
 */
export async function fetchRegions() {
    try {
        const data = await fetchAllData()
        return data.regions || []
    } catch (error) {
        console.error('Error fetching regions:', error)
        return []
    }
}

/**
 * 獲取首頁數據
 */
export async function fetchHomeData() {
    try {
        const data = await fetchAllData()
        return data.home || { videos: [], images: [] }
    } catch (error) {
        console.error('Error fetching home data:', error)
        return { videos: [], images: [] }
    }
}
