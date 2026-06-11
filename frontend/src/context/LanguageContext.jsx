import { createContext, useContext, useState, useEffect } from 'react'
import translations from '../i18n/translations'

const LanguageContext = createContext(null)

const STORAGE_KEY = 'mun_lang'

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'en'
  )

  const setLang = (l) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }

  useEffect(() => {
    const tr = translations[lang]
    document.documentElement.dir  = tr.dir
    document.documentElement.lang = lang
  }, [lang])

  const t = (key) => {
    const parts = key.split('.')
    let val = translations[lang]
    for (const part of parts) {
      val = val?.[part]
      if (val === undefined) break
    }
    return typeof val === 'string' ? val : key
  }

  const months = translations[lang].months

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir: translations[lang].dir, months }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
