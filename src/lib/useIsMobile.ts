import { useSyncExternalStore } from 'react'

/** Viewport уже 768px считаем мобильным — соответствует брейкпоинту `md` в Tailwind. */
const MOBILE_QUERY = '(max-width: 767px)'

const subscribe = (onChange: () => void) => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return () => {}
  }
  const mediaQuery = window.matchMedia(MOBILE_QUERY)
  mediaQuery.addEventListener('change', onChange)
  return () => mediaQuery.removeEventListener('change', onChange)
}

const getSnapshot = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(MOBILE_QUERY).matches

const getServerSnapshot = () => false

/** true — если приложение открыто на мобильном устройстве (viewport < 768px). */
export const useIsMobile = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
