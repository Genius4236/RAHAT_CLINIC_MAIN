import { TextField } from '@mui/material';

export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  style,
  ...props
}) {
  return (
    <TextField
      label={label}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={!!error}
      helperText={error}
      required={required}
      fullWidth
      variant="outlined"
      style={{ marginBottom: '1rem', ...style }}
      {...props}
    />
  );
}
