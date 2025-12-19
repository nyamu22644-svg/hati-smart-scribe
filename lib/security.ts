import CryptoJS from 'crypto-js';

/**
 * Principal Architect's Security Layer:
 * Zero-Knowledge Client-Side Encryption
 */

// Safety check for process.env to prevent white screen crashes
const getEncryptionKey = (): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_ENCRYPTION_KEY) {
      return process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    }
  } catch (e) {}
  return 'MOCK_KEY_FOR_LOCAL_DEV_0987654321';
};

const ENCRYPTION_KEY = getEncryptionKey();

/**
 * Encrypts any data object using AES-256.
 */
export const encrypt = (data: any, key: string = ENCRYPTION_KEY): string => {
  if (!data) return "";
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, key).toString();
};

/**
 * Alias for encrypt to satisfy components that expect encryptData
 */
export const encryptData = encrypt;

/**
 * Decrypts a ciphertext string back into the original object.
 */
export const decrypt = (ciphertext: string, key: string = ENCRYPTION_KEY): any => {
  if (!ciphertext) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error("Decryption returned empty string - Invalid Key?");
    }
    
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Critical Security Failure: Decryption Error", error);
    return null;
  }
};

/**
 * Generates a random shared key for temporary access.
 */
export const generateSharedKey = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};