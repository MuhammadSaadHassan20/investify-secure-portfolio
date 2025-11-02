export interface PasswordValidation {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  }
  
  export function validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];
    
    // Minimum length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    // Maximum length check
    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }
    
    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    // Number check
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*...)');
    }
    
    // Calculate strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    const criteriaCount = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      password.length >= 12
    ].filter(Boolean).length;
    
    if (criteriaCount >= 5) strength = 'strong';
    else if (criteriaCount >= 3) strength = 'medium';
    
    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  }