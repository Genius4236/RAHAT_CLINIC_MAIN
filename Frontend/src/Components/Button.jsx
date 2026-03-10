import { Button as MuiButton } from '@mui/material';

export default function Button({ children, variant = 'primary', type = 'button', disabled = false, onClick, style, className, ...props }) {
  const muiVariant = variant === 'outline' ? 'outlined' : 'contained';
  const color = variant === 'danger' ? 'error' : 'primary';

  return (
    <MuiButton
      type={type}
      disabled={disabled}
      onClick={onClick}
      variant={muiVariant}
      color={color}
      style={style}
      className={className}
      {...props}
    >
      {children}
    </MuiButton>
  );
}
