export class CryptoService {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  // Generate a key from password using PBKDF2
  static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const passwordBuffer = this.encoder.encode(password);
    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Generate random salt
  static generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  // Generate random IV
  static generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(12));
  }

  // Encrypt data
  static async encrypt(data: string, masterKey: string): Promise<string> {
    const salt = this.generateSalt();
    const iv = this.generateIV();
    const key = await this.deriveKey(masterKey, salt);
    
    const dataBuffer = this.encoder.encode(data);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataBuffer
    );

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  // Decrypt data
  static async decrypt(encryptedData: string, masterKey: string): Promise<string> {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    const key = await this.deriveKey(masterKey, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encrypted
    );

    return this.decoder.decode(decrypted);
  }

  // Generate a hash for verification
  static async generateHash(data: string): Promise<string> {
    const buffer = this.encoder.encode(data);
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
  }
}