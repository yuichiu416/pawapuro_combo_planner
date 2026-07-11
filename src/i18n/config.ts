// src/i18n/config.ts
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';

const STORAGE_KEY = 'パワプロ_planner_language';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ja: { translation: ja },
      en: { translation: en },
      zh: { translation: zh },
    },
    lng: typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) ?? 'ja')
      : 'ja',
    fallbackLng: 'ja',
    supportedLngs: ['ja', 'en', 'zh'],
    interpolation: { escapeValue: false },
    detection: { order: [] }, // disable auto-detection — we manage it manually
  });

export default i18n;
export { STORAGE_KEY };
