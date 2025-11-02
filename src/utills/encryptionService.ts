// Simple encryption utility using Web Crypto API
// Note: For production, use proper encryption libraries

const ENCRYPTION_KEY = 'investify-secret-key-2025'; // In production, use env variable

export async function encryptData(text: string): Promise<string> {
  try {
    // Simple base64 encoding with key mixing (for demonstration)
    const combined = `${ENCRYPTION_KEY}:${text}`;
    return btoa(combined);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

export async function decryptData(encryptedText: string): Promise<string> {
  try {
    const decrypted = atob(encryptedText);
    const text = decrypted.replace(`${ENCRYPTION_KEY}:`, '');
    return text;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Hash sensitive data (one-way)
export async function hashData(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Mask sensitive data for display
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) return '*'.repeat(data.length);
  return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
}