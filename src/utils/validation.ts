/**
 * Form Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validators = {
  required: (value: string, fieldName = 'This field'): ValidationResult => {
    if (!value || value.trim() === '') {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true };
  },

  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    return { isValid: true };
  },

  password: (value: string): ValidationResult => {
    if (value.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }
    return { isValid: true };
  },

  confirmPassword: (password: string, confirmPassword: string): ValidationResult => {
    if (password !== confirmPassword) {
      return { isValid: false, error: 'Passwords do not match' };
    }
    return { isValid: true };
  },

  phone: (value: string): ValidationResult => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return { isValid: false, error: 'Please enter a valid 10-digit Indian mobile number' };
    }
    return { isValid: true };
  },

  pincode: (value: string): ValidationResult => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(value)) {
      return { isValid: false, error: 'Please enter a valid 6-digit pincode' };
    }
    return { isValid: true };
  },

  minLength: (value: string, min: number, fieldName = 'This field'): ValidationResult => {
    if (value.length < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
    }
    return { isValid: true };
  },

  maxLength: (value: string, max: number, fieldName = 'This field'): ValidationResult => {
    if (value.length > max) {
      return { isValid: false, error: `${fieldName} must not exceed ${max} characters` };
    }
    return { isValid: true };
  },
};

export interface FormErrors {
  [key: string]: string | undefined;
}

export const validateForm = (
  values: Record<string, string>,
  rules: Record<string, ((value: string) => ValidationResult)[]>
): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {};
  let isValid = true;

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = values[field] || '';

    for (const rule of fieldRules) {
      const result = rule(value);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
        break;
      }
    }
  });

  return { isValid, errors };
};

