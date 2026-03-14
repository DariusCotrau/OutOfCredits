import { useState, useCallback, useMemo, useRef } from 'react';
export interface FieldError {
  message: string;
  type?: string;
}
export type FormErrors<T> = Partial<Record<keyof T, FieldError>>;
export type TouchedFields<T> = Partial<Record<keyof T, boolean>>;
export type ValidatorFn<T> = (value: T[keyof T], values: T) => string | undefined;
export type ValidationRules<T> = { [K in keyof T]?: ValidatorFn<T> | ValidatorFn<T>[] };
export interface UseFormConfig<T extends object> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}
export interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: TouchedFields<T>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  submitCount: number;
}
export interface FormActions<T> {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: FieldError | undefined) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  setAllTouched: () => void;
  validateField: (field: keyof T) => string | undefined;
  validate: () => boolean;
  reset: (newInitialValues?: T) => void;
  handleChange: (field: keyof T) => (value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (
    onSubmit: (values: T) => void | Promise<void>
  ) => () => Promise<void>;
  getFieldProps: (field: keyof T) => {
    value: T[keyof T];
    onChangeText: (value: string) => void;
    onBlur: () => void;
    error?: string;
  };
}
export type UseFormReturn<T> = FormState<T> & FormActions<T>;
export function useForm<T extends object>(
  config: UseFormConfig<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validationRules = {} as ValidationRules<T>,
    validateOnChange = false,
    validateOnBlur = true,
    validateOnSubmit = true,
  } = config;
  const initialValuesRef = useRef(initialValues);
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors<T>>({});
  const [touched, setTouchedState] = useState<TouchedFields<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);
  const isDirty = useMemo(() => {
    return Object.keys(values).some(
      (key) =>
        values[key as keyof T] !== initialValuesRef.current[key as keyof T]
    );
  }, [values]);
  const validateField = useCallback(
    (field: keyof T): string | undefined => {
      const rules = validationRules[field];
      if (!rules) return undefined;
      const validators = Array.isArray(rules) ? rules : [rules];
      const value = values[field];
      for (const validator of validators) {
        const error = validator(value, values);
        if (error) return error;
      }
      return undefined;
    },
    [values, validationRules]
  );
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    for (const field of Object.keys(validationRules) as (keyof T)[]) {
      const error = validateField(field);
      if (error) {
        newErrors[field] = { message: error };
      }
    }
    setErrorsState(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField, validationRules]);
  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => ({ ...prev, [field]: value }));
      if (validateOnChange) {
        const error = validateField(field);
        setErrorsState((prev) => {
          if (error) {
            return { ...prev, [field]: { message: error } };
          }
          const { [field]: _, ...rest } = prev;
          return rest as FormErrors<T>;
        });
      }
    },
    [validateOnChange, validateField]
  );
  const setValues = (newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  };
  const setError = useCallback(
    (field: keyof T, error: FieldError | undefined) => {
      setErrorsState((prev) => {
        if (error) {
          return { ...prev, [field]: error };
        }
        const { [field]: _, ...rest } = prev;
        return rest as FormErrors<T>;
      });
    },
    []
  );
  const setErrors = (newErrors: FormErrors<T>) => setErrorsState(newErrors);
  const setTouched = useCallback(
    (field: keyof T, isTouched = true) => {
      setTouchedState((prev) => ({ ...prev, [field]: isTouched }));
      if (isTouched && validateOnBlur) {
        const error = validateField(field);
        setErrorsState((prev) => {
          if (error) {
            return { ...prev, [field]: { message: error } };
          }
          const { [field]: _, ...rest } = prev;
          return rest as FormErrors<T>;
        });
      }
    },
    [validateOnBlur, validateField]
  );
  const setAllTouched = useCallback(() => {
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as TouchedFields<T>
    );
    setTouchedState(allTouched);
  }, [values]);
  const reset = useCallback((newInitialValues?: T) => {
    const resetValues = newInitialValues ?? initialValuesRef.current;
    if (newInitialValues) {
      initialValuesRef.current = newInitialValues;
    }
    setValuesState(resetValues);
    setErrorsState({});
    setTouchedState({});
    setIsSubmitting(false);
  }, []);
  const handleChange = useCallback(
    (field: keyof T) => (value: T[keyof T]) => {
      setValue(field, value);
    },
    [setValue]
  );
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched(field, true);
    },
    [setTouched]
  );
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => async () => {
      setSubmitCount((prev) => prev + 1);
      setAllTouched();
      if (validateOnSubmit) {
        const isFormValid = validate();
        if (!isFormValid) return;
      }
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, validateOnSubmit, setAllTouched]
  );
  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: values[field] as T[keyof T],
      onChangeText: (value: string) => setValue(field, value as T[keyof T]),
      onBlur: () => setTouched(field, true),
      error: touched[field] ? errors[field]?.message : undefined,
    }),
    [values, errors, touched, setValue, setTouched]
  );
  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    isSubmitting,
    submitCount,
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    setAllTouched,
    validateField,
    validate,
    reset,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps,
  };
}
export const required = (message = 'This field is required') => (value: unknown) => {
  if (value === undefined || value === null || value === '') return message;
  return undefined;
};

export const email = (message = 'Please enter a valid email') => (value: unknown) => {
  if (!value) return undefined;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? undefined : message;
};

export const minLength = (min: number, message?: string) => (value: unknown) => {
  if (!value) return undefined;
  if (String(value).length < min) return message ?? `Must be at least ${min} characters`;
  return undefined;
};

export const maxLength = (max: number, msg?: string) => (value: unknown) => {
  if (!value) return undefined;
  return String(value).length > max ? (msg ?? `Must be at most ${max} characters`) : undefined;
};

export const pattern = (regex: RegExp, message: string) => (value: unknown) => {
  if (!value) return undefined;
  return regex.test(String(value)) ? undefined : message;
};

export const matchField =
  <T extends object>(fieldToMatch: keyof T, message = 'Fields do not match') =>
  (value: T[keyof T], values: T): string | undefined =>
    value !== values[fieldToMatch] ? message : undefined;

export const compose =
  <T>(...validators: ValidatorFn<T>[]): ValidatorFn<T> =>
  (value, values) => {
    for (const v of validators) {
      const err = v(value, values);
      if (err) return err;
    }
    return undefined;
  };
export default useForm;
