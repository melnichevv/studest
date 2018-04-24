export const required = value => (value ? undefined : 'Required');
export const maxLength = max => value =>
  (value && value.length > max ? `Must be ${max} characters or less` : undefined);
export const maxLength15 = maxLength(15);
export const minLength = min => value =>
  (value && value.length < min ? `Must be ${min} characters or more` : undefined);
export const minLength2 = minLength(2);
export const minLength5 = minLength(5);
export const minValue = min => value =>
  (value && value < min ? `Must be at least ${min}` : undefined);
export const minValue18 = minValue(18);
export const email = value =>
  (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email address'
    : undefined);
