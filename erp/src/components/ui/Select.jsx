import { ChevronDown } from 'lucide-react'
import './Input.css'

export default function Select({
  label,
  error,
  options = [],
  placeholder,
  className = '',
  id,
  ...props
}) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'input-wrapper--error' : ''}`}>
        <select
          id={selectId}
          className="input input--select"
          style={{ appearance: 'none', paddingRight: '36px' }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          style={{
            position: 'absolute',
            right: '12px',
            color: 'var(--text-tertiary)',
            pointerEvents: 'none',
          }}
        />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  )
}
