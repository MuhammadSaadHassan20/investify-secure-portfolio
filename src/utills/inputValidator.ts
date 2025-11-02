export function sanitizeInput(input: string): string {
    // Remove HTML tags and potentially dangerous characters
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
  
  export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }
  
  export function validateNumericInput(value: string): boolean {
    return /^\d+\.?\d*$/.test(value) && !isNaN(parseFloat(value));
  }
  
  export function validateInputLength(input: string, maxLength: number = 1000): boolean {
    return input.length <= maxLength;
  }
  
  export function escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
  
  // Prevent SQL injection attempts
  export function detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(--)|;|\/\*|\*\/|xp_|sp_/gi,
      /('|(\\'))|(--)|;|\||%|\/\*|\*\//gi,
      /(\bOR\b|\bAND\b)\s*\d+\s*=\s*\d+/gi
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }
  
  // Prevent XSS attempts
  export function detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }