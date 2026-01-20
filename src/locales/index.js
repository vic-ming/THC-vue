import { createI18n } from 'vue-i18n'
import zhTW from './zh-TW.json'
import en from './en.json'

// 從 localStorage 讀取保存的語言設定，如果沒有則使用預設值
const savedLocale = localStorage.getItem('app-locale') || 'zh-TW'

const i18n = createI18n({
    legacy: false, // 使用 Composition API 模式
    locale: savedLocale, // 使用保存的語言或預設語言
    fallbackLocale: 'en', // 備用語言
    messages: {
        'zh-TW': zhTW,
        'en': en
    }
})

export default i18n
