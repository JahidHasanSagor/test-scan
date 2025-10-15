/**
 * Password strength validator
 * Enforces strong password requirements
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
}

const commonPasswords = [
  'password', '12345678', 'password123', 'qwerty', 'abc123',
  'letmein', 'welcome', 'monkey', '1234567890', 'password1',
  'admin', 'root', 'user', 'test', 'guest', 'demo'
];

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
  }

  // Uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Numbers
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  } else {
    score += 2;
  }

  // Check for common passwords
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a more unique password');
    score = 0;
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeating characters (e.g., "aaa", "111")');
    score = Math.max(0, score - 1);
  }

  // Check for sequential numbers or letters
  const sequentialPatterns = ['012', '123', '234', '345', '456', '567', '678', '789', 'abc', 'bcd', 'cde', 'def'];
  if (sequentialPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    score = Math.max(0, score - 1);
  }

  // Determine strength
  let strength: PasswordValidationResult['strength'];
  if (score >= 8) strength = 'very-strong';
  else if (score >= 6) strength = 'strong';
  else if (score >= 4) strength = 'medium';
  else strength = 'weak';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
}

export function getPasswordStrengthColor(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'very-strong': return 'text-green-600 dark:text-green-400';
    case 'strong': return 'text-blue-600 dark:text-blue-400';
    case 'medium': return 'text-yellow-600 dark:text-yellow-400';
    case 'weak': return 'text-red-600 dark:text-red-400';
  }
}

export function getPasswordStrengthText(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'very-strong': return 'Very Strong';
    case 'strong': return 'Strong';
    case 'medium': return 'Medium';
    case 'weak': return 'Weak';
  }
}