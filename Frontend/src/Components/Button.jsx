export default function Button({ children, variant = 'primary', type = 'button', disabled = false, onClick, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </button>
  )
}
