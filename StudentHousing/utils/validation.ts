import { ImageObject } from "@/components/MediaUpload";

export type ValidationRule = {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'email' | 'age' | 'url' | 'custom';
  value?: number;
  message: string;
  customValidator?: (value: any) => boolean;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const validateInput = (value: any, rules: ValidationRule[]): ValidationResult => {
  const errors: string[] = [];

  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          errors.push(rule.message);
        }
        break;

      case 'minLength':
        if (typeof value === 'string' && value.length < (rule.value || 0)) {
          errors.push(rule.message);
        }
        break;

      case 'maxLength':
        if (typeof value === 'string' && value.length > (rule.value || 0)) {
          errors.push(rule.message);
        }
        break;

      case 'min':
        if (typeof value === 'number' && value < (rule.value || 0)) {
          errors.push(rule.message);
        }
        break;

      case 'max':
        if (typeof value === 'number' && value > (rule.value || 0)) {
          errors.push(rule.message);
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value === 'string' && !emailRegex.test(value)) {
          errors.push(rule.message);
        }
        break;

      case 'age':
        if (value instanceof Date) {
          const today = new Date();
          const age = today.getFullYear() - value.getFullYear();
          if (age < (rule.value || 18)) {
            errors.push(rule.message);
          }
        }
        break;

      case 'url':
        try {
          new URL(value);
        } catch {
          errors.push(rule.message);
        }
        break;

      case 'custom':
        if (rule.customValidator && !rule.customValidator(value)) {
          errors.push(rule.message);
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Common validation rules
export const commonRules = {
  required: (message: string): ValidationRule => ({
    type: 'required',
    message
  }),
  minLength: (min: number, message: string): ValidationRule => ({
    type: 'minLength',
    value: min,
    message
  }),
  maxLength: (max: number, message: string): ValidationRule => ({
    type: 'maxLength',
    value: max,
    message
  }),
  min: (min: number, message: string): ValidationRule => ({
    type: 'min',
    value: min,
    message
  }),
  max: (max: number, message: string): ValidationRule => ({
    type: 'max',
    value: max,
    message
  }),
  email: (message: string): ValidationRule => ({
    type: 'email',
    message
  }),
  age: (minAge: number, message: string): ValidationRule => ({
    type: 'age',
    value: minAge,
    message
  }),
  url: (message: string): ValidationRule => ({
    type: 'url',
    message
  }),
  custom: (validator: (value: any) => boolean, message: string): ValidationRule => ({
    type: 'custom',
    customValidator: validator,
    message
  })
}; 