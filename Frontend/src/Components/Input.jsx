export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  ...props
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {label && (
        <label htmlFor={name} style={{ fontWeight: 500, fontSize: '0.875rem' }}>
          {label} {required && <span style={{ color: 'var(--color-error, #d32f2f)' }}>*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: '0.75rem',
          border: `1px solid ${error ? 'var(--color-error, #d32f2f)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius)',
          fontSize: '1rem',
          fontFamily: 'inherit',
          backgroundColor: 'var(--color-surface)',
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.875rem', color: 'var(--color-error, #d32f2f)' }}>
          {error}
        </span>
      )}
    </div>
  )
}
