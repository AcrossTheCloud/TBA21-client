
// Check if we have any uppercase characters in a string
export const hasUpperCase = (query: string): boolean => (
  /^(.*[A-Z].*)$/.test(query)
);
// Check that we have any lowercase characters in a string
export const hasLowerCase = (query: string): boolean => (
  /^(.*[a-z].*)$/.test(query)
);
// Check that we have any symbols in a string
export const hasSymbol = (query: string): boolean => (
  /[~!@#$%^&*()_+\-={}\[\]|\\;':"<>?,./]/.test(query)
);
// Check that we have any numbers in a string
export const hasNumber = (query: string): boolean => (
  /^(.*[0-9].*)$/.test(query)
);
