import './Input.css'

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'input-wrapper--error' : ''}`}>
        {Icon && <Icon className="input-icon" size={16} />}
        <input
          id={inputId}
          className={`input ${Icon ? 'input--has-icon' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="input-error">{error}</span>}
      {helperText && !error && (
        <span className="input-helper">{helperText}</span>
      )}
    </div>
  )
}
