import { createI18n } from 'vue-i18n'
import zhTW from './zh-TW.json'
import en from './en.json'

const i18n = createI18n({
    legacy: false, // 使用 Composition API 模式
    locale: 'zh-TW', // 預設語言
    fallbackLocale: 'en', // 備用語言
    messages: {
        'zh-TW': zhTW,
        'en': en
    }
})

export default i18n
