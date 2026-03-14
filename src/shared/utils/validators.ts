export interface ValidationResult {
  isValid: boolean;
  error?: string;
}


export type Validator<T = string> = (value: T) => ValidationResult;
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};


export const isNotEmpty = (value: unknown): boolean => !isEmpty(value);
export const required = (message = 'This field is required'): Validator => {
  return (value: string) => ({
    isValid: isNotEmpty(value),
    error: isEmpty(value) ? message : undefined,
  });
};


export const minLength = (min: number, message?: string): Validator => {
  return (value: string) => ({
    isValid: value.length >= min,
    error: value.length < min
      ? message ?? `Must be at least ${min} characters`
      : undefined,
  });
};


export const maxLength = (max: number, message?: string): Validator => {
  return (value: string) => ({
    isValid: value.length <= max,
    error: value.length > max
      ? message ?? `Must be no more than ${max} characters`
      : undefined,
  });
};


export const lengthBetween = (
  min: number,
  max: number,
  message?: string
): Validator => {
  return (value: string) => ({
    isValid: value.length >= min && value.length <= max,
    error:
      value.length < min || value.length > max
        ? message ?? `Must be between ${min} and ${max} characters`
        : undefined,
  });
};


export const pattern = (regex: RegExp, message: string): Validator => {
  return (value: string) => ({
    isValid: regex.test(value),
    error: !regex.test(value) ? message : undefined,
  });
};


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (email: string): boolean => EMAIL_REGEX.test(email);
export const email = (message = 'Please enter a valid email address'): Validator => {
  return (value: string) => ({
    isValid: isValidEmail(value),
    error: !isValidEmail(value) ? message : undefined,
  });
};


export interface PasswordRequirements {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
}


const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false,
};


export const checkPasswordStrength = (
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (requirements.minLength && password.length < requirements.minLength) {
    errors.push(`At least ${requirements.minLength} characters`);
  }
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter');
  }
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter');
  }
  if (requirements.requireNumber && !/\d/.test(password)) {
    errors.push('At least one number');
  }
  if (requirements.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('At least one special character');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};


export const password = (
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): Validator => {
  return (value: string) => {
    const result = checkPasswordStrength(value, requirements);
    return {
      isValid: result.isValid,
      error: result.errors.length > 0 ? result.errors[0] : undefined,
    };
  };
};


export const confirmPassword = (
  originalPassword: string,
  message = 'Passwords do not match'
): Validator => {
  return (value: string) => ({
    isValid: value === originalPassword,
    error: value !== originalPassword ? message : undefined,
  });
};


// username: litere, cifre, underscore, 3-20 caractere
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export const isValidUsername = (username: string): boolean =>
  USERNAME_REGEX.test(username);
export const username = (
  message = 'Username must be 3-20 characters (letters, numbers, underscores)'
): Validator => {
  return (value: string) => ({
    isValid: isValidUsername(value),
    error: !isValidUsername(value) ? message : undefined,
  });
};


// validatori numerici
export const min = (minValue: number, message?: string): Validator<number> => {
  return (value: number) => ({
    isValid: value >= minValue,
    error: value < minValue
      ? message ?? `Must be at least ${minValue}`
      : undefined,
  });
};


export const max = (maxValue: number, message?: string): Validator<number> => {
  return (value: number) => ({
    isValid: value <= maxValue,
    error: value > maxValue
      ? message ?? `Must be no more than ${maxValue}`
      : undefined,
  });
};


export const between = (
  minValue: number,
  maxValue: number,
  message?: string
): Validator<number> => {
  return (value: number) => ({
    isValid: value >= minValue && value <= maxValue,
    error:
      value < minValue || value > maxValue
        ? message ?? `Must be between ${minValue} and ${maxValue}`
        : undefined,
  });
};


export const positive = (message = 'Must be a positive number'): Validator<number> => {
  return (value: number) => ({
    isValid: value > 0,
    error: value <= 0 ? message : undefined,
  });
};


export const compose =<T = string>(...validators: Validator<T>[]): Validator<T> => {
  return (value: T) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  };
};
export const optional =<T = string>(validator: Validator<T>): Validator<T> => {
  return (value: T) => {
    if (isEmpty(value)) {
      return { isValid: true };
    }
    return validator(value);
  };
};



export const timeLimit = (
  minMinutes = 1,
  maxMinutes = 1440 // 24 hours
): Validator<number> => {
  return compose(
    min(minMinutes, `Minimum ${minMinutes} minute${minMinutes !== 1 ? 's' : ''}`),
    max(maxMinutes, `Maximum ${Math.floor(maxMinutes / 60)} hours`)
  );
};


export const activityDuration = (
  minSeconds = 30,
  maxSeconds = 3600 // 1 hour
): Validator<number> => {
  return compose(
    min(minSeconds, 'Activity too short'),
    max(maxSeconds, 'Activity too long')
  );
};


export const displayName = compose(
  required('Display name is required'),
  minLength(2, 'Display name must be at least 2 characters'),
  maxLength(50, 'Display name must be no more than 50 characters')
);



export const validate = <T = string>(
  value: T,
  ...validators: Validator<T>[]
): ValidationResult => {
  return compose(...validators)(value);
};



export const validateFields = <T extends Record<string, unknown>>(
  data: T,
  validatorMap: { [K in keyof T]?: Validator<T[K]>[] }
): { isValid: boolean; errors: { [K in keyof T]?: string } } => {
  const errors: { [K in keyof T]?: string } = {};
  let isValid = true;
  for (const [field, validators] of Object.entries(validatorMap)) {
    if (validators && Array.isArray(validators)) {
      const result = compose(...(validators as Validator<unknown>[]))(
        data[field as keyof T]
      );
      if (!result.isValid) {
        isValid = false;
        errors[field as keyof T] = result.error;
      }
    }
  }
  return { isValid, errors };
};
