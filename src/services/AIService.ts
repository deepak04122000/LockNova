import { PasswordEntry } from './StorageService';

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export class AIService {
  // Analyze password strength
  static analyzePasswordStrength(password: string): PasswordStrength {
    let score = 0;
    const checks = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noSequence: !/(.)\1{2,}/.test(password),
      noCommon: !this.isCommonPassword(password)
    };

    // Base scoring
    if (checks.length) score++;
    if (checks.uppercase && checks.lowercase) score++;
    if (checks.numbers) score++;
    if (checks.symbols) score++;

    // Advanced checks
    if (password.length >= 16) score += 0.5;
    if (checks.noSequence) score += 0.5;
    if (checks.noCommon) score += 0.5;

    // Ensure score is between 0-4
    score = Math.min(4, Math.max(0, Math.floor(score)));

    const strengthLevels = [
      { label: 'Very Weak', color: 'text-red-500' },
      { label: 'Weak', color: 'text-red-400' },
      { label: 'Fair', color: 'text-yellow-400' },
      { label: 'Strong', color: 'text-green-400' },
      { label: 'Very Strong', color: 'text-green-500' }
    ];

    return {
      score,
      label: strengthLevels[score].label,
      color: strengthLevels[score].color
    };
  }

  // Check if password is commonly used
  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      'dragon', 'master', 'sunshine', 'princess', 'football'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }

  // Generate secure password
  static generatePassword(options: PasswordGeneratorOptions): string {
    let charset = '';
    
    if (options.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.includeNumbers) charset += '0123456789';
    if (options.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      charset = 'abcdefghijklmnopqrstuvwxyz'; // fallback
    }

    let password = '';
    
    // Ensure at least one character from each selected type
    if (options.includeLowercase) {
      password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    }
    if (options.includeUppercase) {
      password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    }
    if (options.includeNumbers) {
      password += '0123456789'[Math.floor(Math.random() * 10)];
    }
    if (options.includeSymbols) {
      password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    }

    // Fill the rest randomly
    for (let i = password.length; i < options.length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Suggest category based on website/URL
  static suggestCategory(website: string, url?: string): string {
    const text = (website + ' ' + (url || '')).toLowerCase();
    
    const categoryKeywords = {
      social: ['facebook', 'twitter', 'instagram', 'linkedin', 'snapchat', 'tiktok', 'discord', 'reddit'],
      email: ['gmail', 'outlook', 'yahoo', 'mail', 'email', 'protonmail'],
      banking: ['bank', 'chase', 'wells', 'citi', 'paypal', 'venmo', 'zelle', 'credit'],
      shopping: ['amazon', 'ebay', 'shop', 'store', 'cart', 'buy', 'walmart', 'target'],
      work: ['slack', 'teams', 'office', 'work', 'corp', 'company', 'business', 'zoom'],
      entertainment: ['netflix', 'spotify', 'youtube', 'gaming', 'steam', 'twitch', 'hulu', 'disney']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }

  // Find duplicate passwords
  static findDuplicatePasswords(passwords: PasswordEntry[]): PasswordEntry[][] {
    const passwordGroups: { [key: string]: PasswordEntry[] } = {};
    
    passwords.forEach(password => {
      if (!passwordGroups[password.password]) {
        passwordGroups[password.password] = [];
      }
      passwordGroups[password.password].push(password);
    });

    return Object.values(passwordGroups).filter(group => group.length > 1);
  }

  // Generate security response (simulated AI chat)
  static generateSecurityResponse(query: string, passwords: PasswordEntry[]): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('weak') || lowerQuery.includes('strength')) {
      const weakPasswords = passwords.filter(p => this.analyzePasswordStrength(p.password).score < 3);
      return `I found ${weakPasswords.length} weak passwords in your vault. ${weakPasswords.length > 0 ? `The weakest passwords are for: ${weakPasswords.slice(0, 3).map(p => p.website).join(', ')}. ` : ''}I recommend using at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols.`;
    }
    
    if (lowerQuery.includes('duplicate')) {
      const duplicates = this.findDuplicatePasswords(passwords);
      return `I found ${duplicates.length} groups of duplicate passwords. Using unique passwords for each account is crucial for security. If one account is compromised, your other accounts remain safe.`;
    }
    
    if (lowerQuery.includes('generate') || lowerQuery.includes('create')) {
      return 'I can help you generate strong passwords! Use the Generate tab to create a secure password with your preferred settings. I recommend at least 16 characters with all character types enabled.';
    }
    
    if (lowerQuery.includes('secure') || lowerQuery.includes('safe')) {
      const totalPasswords = passwords.length;
      const strongPasswords = passwords.filter(p => this.analyzePasswordStrength(p.password).score >= 3).length;
      const percentage = totalPasswords > 0 ? Math.round((strongPasswords / totalPasswords) * 100) : 0;
      return `Your vault contains ${totalPasswords} passwords, with ${strongPasswords} (${percentage}%) being strong. ${percentage >= 80 ? 'Great job maintaining good password security!' : 'Consider strengthening your weaker passwords for better security.'}`;
    }
    
    if (lowerQuery.includes('two factor') || lowerQuery.includes('2fa') || lowerQuery.includes('mfa')) {
      return 'Two-factor authentication (2FA) adds an extra layer of security beyond passwords. I recommend enabling 2FA on all important accounts, especially email, banking, and social media. Popular 2FA apps include Google Authenticator, Authy, and Microsoft Authenticator.';
    }
    
    if (lowerQuery.includes('breach') || lowerQuery.includes('hack')) {
      return 'If you suspect a breach: 1) Change the compromised password immediately, 2) Check if the password is reused elsewhere and change those too, 3) Enable 2FA if available, 4) Monitor your accounts for suspicious activity. Prevention is key - use unique, strong passwords for each account.';
    }
    
    // Default response
    return 'I\'m here to help with password security! I can analyze your password strength, find duplicates, generate secure passwords, and answer security questions. What would you like to know about password security?';
  }

  // Get security recommendations
  static getSecurityRecommendations(passwords: PasswordEntry[]): string[] {
    const recommendations: string[] = [];
    
    const weakPasswords = passwords.filter(p => this.analyzePasswordStrength(p.password).score < 3);
    const duplicates = this.findDuplicatePasswords(passwords);
    const oldPasswords = passwords.filter(p => {
      const daysSince = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 90;
    });

    if (weakPasswords.length > 0) {
      recommendations.push(`Strengthen ${weakPasswords.length} weak password${weakPasswords.length > 1 ? 's' : ''}`);
    }
    
    if (duplicates.length > 0) {
      recommendations.push(`Replace ${duplicates.length} duplicate password${duplicates.length > 1 ? 's' : ''}`);
    }
    
    if (oldPasswords.length > 0) {
      recommendations.push(`Update ${oldPasswords.length} password${oldPasswords.length > 1 ? 's' : ''} older than 90 days`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Your password security looks good!');
    }
    
    recommendations.push('Enable two-factor authentication where possible');
    recommendations.push('Regularly review and update your passwords');
    
    return recommendations;
  }
}