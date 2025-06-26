import React, { useState } from 'react';
import { X, Eye, EyeOff, Sparkles, Copy } from 'lucide-react';
import { PasswordEntry } from '../services/StorageService';
import { AIService } from '../services/AIService';

interface EditPasswordModalProps {
  password: PasswordEntry;
  onClose: () => void;
  onSave: (password: Partial<PasswordEntry>) => void;
}

const EditPasswordModal: React.FC<EditPasswordModalProps> = ({ password, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    website: password.website,
    username: password.username,
    password: password.password,
    url: password.url || '',
    category: password.category,
    notes: password.notes || ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const categories = [
    { value: 'social', label: 'Social Media', icon: '👥' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'banking', label: 'Banking', icon: '🏦' },
    { value: 'shopping', label: 'Shopping', icon: '🛒' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎮' },
    { value: 'other', label: 'Other', icon: '🔐' }
  ];

  const generatePassword = () => {
    const newPassword = AIService.generatePassword({
      length: 16,
      includeSymbols: true,
      includeNumbers: true,
      includeUppercase: true,
      includeLowercase: true
    });
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      lastModified: new Date().toISOString()
    });
  };

  const passwordStrength = AIService.analyzePasswordStrength(formData.password);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Password</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Website/Service
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="e.g., Google, GitHub, Netflix"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Username/Email
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter username or email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Password
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-mono"
                    placeholder="Enter or generate password"
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
                <button
                  type="button"
                  onClick={copyPassword}
                  className="px-3 py-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                  title="Copy password"
                >
                  <Copy className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-3 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                  title="Generate new password"
                >
                  <Sparkles className="h-5 w-5" />
                </button>
              </div>

              {formData.password && (
                <div className={`text-sm ${passwordStrength.color} flex items-center space-x-2`}>
                  <div className={`w-3 h-3 rounded-full ${passwordStrength.color === 'text-red-400' ? 'bg-red-400' : passwordStrength.color === 'text-yellow-400' ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                  <span>{passwordStrength.label} ({passwordStrength.score}/4)</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value} className="bg-slate-800 text-white">
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Website URL (optional)
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              placeholder="Additional notes or details..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPasswordModal;