import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, Key, Sparkles } from 'lucide-react';
import { CryptoService } from '../services/CryptoService';
import { StorageService } from '../services/StorageService';

interface AuthScreenProps {
  onAuthenticate: (masterKey: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticate }) => {
  const [masterKey, setMasterKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(!StorageService.hasVault());
  const [confirmKey, setConfirmKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateMasterKey = (key: string): string[] => {
    const errors = [];
    if (key.length < 12) errors.push('At least 12 characters');
    if (!/[A-Z]/.test(key)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(key)) errors.push('One lowercase letter');
    if (!/\d/.test(key)) errors.push('One number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(key)) errors.push('One special character');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isCreating) {
        const validationErrors = validateMasterKey(masterKey);
        if (validationErrors.length > 0) {
          setError(`Password must have: ${validationErrors.join(', ')}`);
          setIsLoading(false);
          return;
        }

        if (masterKey !== confirmKey) {
          setError('Master keys do not match');
          setIsLoading(false);
          return;
        }

        // Create new vault
        StorageService.initializeVault(masterKey);
        onAuthenticate(masterKey);
      } else {
        // Verify existing vault
        const isValid = await StorageService.verifyMasterKey(masterKey);
        if (!isValid) {
          setError('Invalid master key');
          setIsLoading(false);
          return;
        }
        onAuthenticate(masterKey);
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  const generateSecureMasterKey = () => {
    const length = 16;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    
    // Ensure at least one of each required character type
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    result += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    result += '0123456789'[Math.floor(Math.random() * 10)];
    result += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the result
    const shuffled = result.split('').sort(() => Math.random() - 0.5).join('');
    setMasterKey(shuffled);
    setConfirmKey(shuffled);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">SecureVault</h1>
            <p className="text-blue-200">
              {isCreating ? 'Create your secure vault' : 'Access your secure vault'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Master Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Enter your master key..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {isCreating && masterKey && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 text-xs">
                    {validateMasterKey(masterKey).length === 0 ? (
                      <span className="text-green-400">✓ Strong master key</span>
                    ) : (
                      <span className="text-amber-400">
                        {validateMasterKey(masterKey).length} requirement(s) remaining
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isCreating && (
              <>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Confirm Master Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmKey}
                      onChange={(e) => setConfirmKey(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Confirm your master key..."
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={generateSecureMasterKey}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Secure Master Key</span>
                </button>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <span>{isCreating ? 'Create Vault' : 'Access Vault'}</span>
              )}
            </button>

            {!isCreating && (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full text-blue-300 hover:text-blue-200 transition-colors text-sm"
              >
                Need to create a new vault?
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;