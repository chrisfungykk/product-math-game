import { useEffect, useState } from 'react'

export interface ResponsiveState {
  width: number
  height: number
  isPortrait: boolean
  isTablet: boolean
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => getState())

  function getState(): ResponsiveState {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024
    const height = typeof window !== 'undefined' ? window.innerHeight : 768
    return {
      width,
      height,
      isPortrait: height >= width,
      isTablet: Math.min(width, height) >= 768,
    }
  }

  useEffect(() => {
    const handler = () => setState(getState())
    window.addEventListener('resize', handler)
    window.addEventListener('orientationchange', handler)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('orientationchange', handler)
    }
  }, [])

  return state
}
