import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './lang_en.json'
import ja from './lang_ja.json'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en
    },
    ja: {
      translation: ja
    }
  },
  fallbackLng: 'ja',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
