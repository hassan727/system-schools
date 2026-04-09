interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }

function getInitials(name?: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizeClasses[size]

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'avatar'}
        className={['rounded-full object-cover', sizeClass, className].join(' ')}
      />
    )
  }

  return (
    <div
      className={[
        'rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold select-none',
        sizeClass,
        className,
      ].join(' ')}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}
