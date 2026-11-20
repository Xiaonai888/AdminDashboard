import { useCallback, useState } from 'react'

const STORAGE_KEY = 'shadow_admin_story_language_v1'
const LANGUAGES = new Set(['all', 'khmer', 'english', 'chinese', 'japanese', 'korean'])

export function normalizeAdminStoryLanguageSelection(value) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : 'all'
  return LANGUAGES.has(normalized) ? normalized : 'all'
}

function readLanguagePreference() {
  try {
    return normalizeAdminStoryLanguageSelection(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return 'all'
  }
}

export function addAdminStoryLanguageParam(params, language) {
  params.set('language', normalizeAdminStoryLanguageSelection(language))
  return params
}

export default function useAdminStoryLanguage() {
  const [language, setLanguage] = useState(readLanguagePreference)
  const selectLanguage = useCallback((nextLanguage) => {
    const normalized = normalizeAdminStoryLanguageSelection(nextLanguage)
    setLanguage(normalized)
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized)
    } catch {
      return
    }
  }, [])
  return { language, selectLanguage }
}
