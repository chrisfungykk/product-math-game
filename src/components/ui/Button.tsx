import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'practice' | 'timed' | 'blind'
type Size = 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
  practice: 'bg-blue-600 hover:bg-blue-700 text-white',
  timed: 'bg-red-500 hover:bg-red-600 text-white',
  blind: 'bg-purple-600 hover:bg-purple-700 text-white',
}

const SIZES: Record<Size, string> = {
  md: 'py-3 px-5 text-base',
  lg: 'py-4 px-6 text-lg',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

/** Shared kid-friendly button with mode-aware accents. */
export default function Button({
  variant = 'primary',
  size = 'lg',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`w-full font-bold rounded-xl cantonese-text shadow-lg transition-all active:scale-95 disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
