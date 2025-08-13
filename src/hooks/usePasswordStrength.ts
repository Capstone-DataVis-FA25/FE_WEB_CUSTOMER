import React from 'react';

export const usePasswordStrength = (password: string) => {
  const isStrong = React.useMemo(() => {
    if (password.length < 6) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/\d/.test(password)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    return true;
  }, [password]);

  const isValid = password.length >= 6;

  return { isValid, isStrong };
};
