# i18n 使用說明

## 已安裝套件
- `vue-i18n@9`

## 檔案結構
```
src/locales/
├── index.js      # i18n 配置
├── zh-TW.json    # 繁體中文翻譯
└── en.json       # 英文翻譯
```

## 使用方式

### 1. 在 Template 中使用
```vue
<template>
  <div>
    <!-- 基本用法 -->
    <h1>{{ $t('menu.home') }}</h1>
    
    <!-- 使用變數 -->
    <p>{{ $t('factory.numberOfEmployees') }}: {{ count }}</p>
  </div>
</template>
```

### 2. 在 Script 中使用
```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// 使用翻譯
const title = t('menu.home')

// 切換語言
const switchLanguage = () => {
  locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW'
}
</script>
```

### 3. 語言切換按鈕範例
```vue
<template>
  <button @click="toggleLanguage">
    {{ $t('menu.language') }}
  </button>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const toggleLanguage = () => {
  locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW'
}
</script>
```

## 翻譯檔案結構

### 主要分類
- `menu`: 選單項目
- `location`: 據點相關
- `factory`: 工廠資訊
- `stats`: 統計數據
- `regions`: 地區名稱
- `taiwan`: 台灣據點
- `china`: 中國據點

## 注意事項
- 預設語言為繁體中文 (`zh-TW`)
- 備用語言為英文 (`en`)
- 原始的 `中文.tokens.json` 和 `英文.tokens.json` 包含完整的 Design Tokens（包括顏色），已提取文字部分到新的翻譯檔案
