import type { ReactNode } from 'react'

type Gradient = 'home' | 'results' | 'blind'

const GRADIENTS: Record<Gradient, string> = {
  home: 'from-indigo-600 via-purple-600 to-pink-600',
  results: 'from-purple-500 via-pink-500 to-red-500',
  blind: 'from-indigo-700 via-purple-700 to-fuchsia-700',
}

interface ScreenShellProps {
  children: ReactNode
  gradient?: Gradient
}

/** Full-screen gradient page with safe-area padding and centered content. */
export default function ScreenShell({ children, gradient = 'home' }: ScreenShellProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br ${GRADIENTS[gradient]} px-4 py-8 safe-area-top safe-area-bottom`}
    >
      {children}
    </div>
  )
}
