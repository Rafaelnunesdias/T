import './Badge.css'

const variants = {
  default: 'badge--default',
  primary: 'badge--primary',
  green: 'badge--green',
  blue: 'badge--blue',
  amber: 'badge--amber',
  red: 'badge--red',
  purple: 'badge--purple',
  brown: 'badge--brown',
}

const sizes = {
  sm: 'badge--sm',
  md: 'badge--md',
}

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  return (
    <span className={`badge ${variants[variant] || variants.default} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}
