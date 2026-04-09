interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-4', lg: 'w-12 h-12 border-4' }

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="جاري التحميل"
      className={[
        'rounded-full border-blue-600 border-t-transparent animate-spin',
        sizeClasses[size],
        className,
      ].join(' ')}
    />
  )
}
