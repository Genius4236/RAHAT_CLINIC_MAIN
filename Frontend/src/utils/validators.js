export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
export const phoneRegex = /^[0-9]{10}$/

export const validators = {
  email: (value) => {
    if (!value) return 'Email is required'
    if (!emailRegex.test(value)) return 'Please enter a valid email address'
    return ''
  },

  password: (value) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (!passwordRegex.test(value)) {
      return 'Password must contain uppercase, lowercase, and a number'
    }
    return ''
  },

  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password'
    if (password !== confirmPassword) return 'Passwords do not match'
    return ''
  },

  name: (value, fieldName = 'Name') => {
    if (!value) return `${fieldName} is required`
    if (value.trim().length < 2) return `${fieldName} must be at least 2 characters`
    return ''
  },

  phone: (value) => {
    if (!value) return 'Phone number is required'
    if (!phoneRegex.test(value)) return 'Please enter a valid 10-digit phone number'
    return ''
  },

  dob: (value) => {
    if (!value) return 'Date of birth is required'
    const age = new Date().getFullYear() - new Date(value).getFullYear()
    if (age < 18) return 'You must be at least 18 years old'
    return ''
  },

  required: (value, fieldName = 'This field') => {
    if (!value) return `${fieldName} is required`
    return ''
  },
}

export const validateForm = (formData, validationRules) => {
  const errors = {}
  for (const [field, rule] of Object.entries(validationRules)) {
    const error = rule(formData[field])
    if (error) errors[field] = error
  }
  return errors
}
