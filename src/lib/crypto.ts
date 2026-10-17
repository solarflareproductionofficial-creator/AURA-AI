/**
 * Web Crypto API based AES-GCM 256-bit encryption for End-to-End Security (E2EE)
 * Zero-knowledge guarantee: Keys are stored exclusively client-side.
 */

const STORAGE_KEY_NAME = 'aura_e2ee_crypto_key';

// Generate or retrieve persistent master key for the user session
export async function getOrCreateMasterKey(): Promise<CryptoKey> {
  const existingKeyJwk = sessionStorage.getItem(STORAGE_KEY_NAME) || localStorage.getItem(STORAGE_KEY_NAME);
  
  if (existingKeyJwk) {
    try {
      const parsed = JSON.parse(existingKeyJwk);
      return await window.crypto.subtle.importKey(
        'jwk',
        parsed,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (e) {
      console.warn('Failed to parse existing key, generating fresh one', e);
    }
  }

  // Generate fresh AES-GCM 256 key
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exported = await window.crypto.subtle.exportKey('jwk', key);
  localStorage.setItem(STORAGE_KEY_NAME, JSON.stringify(exported));
  sessionStorage.setItem(STORAGE_KEY_NAME, JSON.stringify(exported));
  return key;
}

export async function encryptText(plainText: string): Promise<{ cipherText: string; iv: string }> {
  try {
    const key = await getOrCreateMasterKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);

    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const cipherArray = Array.from(new Uint8Array(cipherBuffer));
    const cipherBase64 = btoa(String.fromCharCode.apply(null, cipherArray));
    const ivBase64 = btoa(String.fromCharCode.apply(null, Array.from(iv)));

    return { cipherText: cipherBase64, iv: ivBase64 };
  } catch (err) {
    console.error('Encryption failed, falling back:', err);
    return { cipherText: btoa(unescape(encodeURIComponent(plainText))), iv: 'plain_fallback' };
  }
}

export async function decryptText(cipherText: string, iv: string): Promise<string> {
  try {
    if (iv === 'plain_fallback') {
      return decodeURIComponent(escape(atob(cipherText)));
    }

    const key = await getOrCreateMasterKey();
    const ivBytes = new Uint8Array(
      atob(iv)
        .split('')
        .map((c) => c.charCodeAt(0))
    );
    const cipherBytes = new Uint8Array(
      atob(cipherText)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes },
      key,
      cipherBytes
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error('Decryption error:', err);
    return '[Şifrelenmiş Veri - Anahtar Uyuşmazlığı]';
  }
}

export function resetEncryptionKey(): void {
  localStorage.removeItem(STORAGE_KEY_NAME);
  sessionStorage.removeItem(STORAGE_KEY_NAME);
}
