import { CryptoService } from './CryptoService';

export interface PasswordEntry {
  id: string;
  website: string;
  username: string;
  password: string;
  url?: string;
  category: string;
  notes?: string;
  createdAt: string;
  lastModified: string;
}

export interface EncryptedPasswordEntry {
  id: string;
  website: string;
  username: string;
  encryptedPassword: string;
  url?: string;
  category: string;
  notes?: string;
  createdAt: string;
  lastModified: string;
}

export class StorageService {
  private static readonly VAULT_KEY = 'securevault_data';
  private static readonly MASTER_KEY_HASH = 'securevault_master_hash';

  // Check if vault exists
  static hasVault(): boolean {
    return localStorage.getItem(this.VAULT_KEY) !== null;
  }

  // Initialize new vault
  static async initializeVault(masterKey: string): Promise<void> {
    const masterHash = await CryptoService.generateHash(masterKey);
    localStorage.setItem(this.MASTER_KEY_HASH, masterHash);
    localStorage.setItem(this.VAULT_KEY, JSON.stringify([]));
  }

  // Verify master key
  static async verifyMasterKey(masterKey: string): Promise<boolean> {
    const storedHash = localStorage.getItem(this.MASTER_KEY_HASH);
    if (!storedHash) return false;
    
    const masterHash = await CryptoService.generateHash(masterKey);
    return masterHash === storedHash;
  }

  // Get encrypted data
  static getEncryptedData(): EncryptedPasswordEntry[] {
    const data = localStorage.getItem(this.VAULT_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Save encrypted data
  static saveEncryptedData(data: EncryptedPasswordEntry[]): void {
    localStorage.setItem(this.VAULT_KEY, JSON.stringify(data));
  }

  // Add new password
  static async addPassword(
    passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'lastModified'>,
    masterKey: string
  ): Promise<void> {
    const encryptedPassword = await CryptoService.encrypt(passwordData.password, masterKey);
    
    const newEntry: EncryptedPasswordEntry = {
      id: crypto.randomUUID(),
      website: passwordData.website,
      username: passwordData.username,
      encryptedPassword,
      url: passwordData.url,
      category: passwordData.category,
      notes: passwordData.notes,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const data = this.getEncryptedData();
    data.push(newEntry);
    this.saveEncryptedData(data);
  }

  // Get decrypted passwords
  static async getDecryptedPasswords(masterKey: string): Promise<PasswordEntry[]> {
    const encryptedData = this.getEncryptedData();
    const decryptedPasswords: PasswordEntry[] = [];

    for (const entry of encryptedData) {
      try {
        const decryptedPassword = await CryptoService.decrypt(entry.encryptedPassword, masterKey);
        decryptedPasswords.push({
          ...entry,
          password: decryptedPassword
        });
      } catch (error) {
        console.error('Failed to decrypt password:', error);
        // Skip corrupted entries
      }
    }

    return decryptedPasswords;
  }

  // Update password
  static async updatePassword(
    id: string,
    passwordData: Partial<PasswordEntry>,
    masterKey: string
  ): Promise<void> {
    const data = this.getEncryptedData();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('Password entry not found');
    }

    const updatedEntry = { ...data[index] };
    
    if (passwordData.website) updatedEntry.website = passwordData.website;
    if (passwordData.username) updatedEntry.username = passwordData.username;
    if (passwordData.password) {
      updatedEntry.encryptedPassword = await CryptoService.encrypt(passwordData.password, masterKey);
    }
    if (passwordData.url !== undefined) updatedEntry.url = passwordData.url;
    if (passwordData.category) updatedEntry.category = passwordData.category;
    if (passwordData.notes !== undefined) updatedEntry.notes = passwordData.notes;
    
    updatedEntry.lastModified = new Date().toISOString();
    
    data[index] = updatedEntry;
    this.saveEncryptedData(data);
  }

  // Delete password
  static async deletePassword(id: string): Promise<void> {
    const data = this.getEncryptedData();
    const filteredData = data.filter(item => item.id !== id);
    this.saveEncryptedData(filteredData);
  }

  // Clear all data (reset vault)
  static clearVault(): void {
    localStorage.removeItem(this.VAULT_KEY);
    localStorage.removeItem(this.MASTER_KEY_HASH);
  }

  // Export data (encrypted)
  static exportData(): string {
    const data = this.getEncryptedData();
    return JSON.stringify(data, null, 2);
  }

  // Import data
  static importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data)) {
        this.saveEncryptedData(data);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      throw new Error('Failed to import data: Invalid JSON format');
    }
  }
}