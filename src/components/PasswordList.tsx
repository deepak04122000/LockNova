import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Edit, Trash2, ExternalLink, Shield, Calendar, AlertTriangle } from 'lucide-react';
import { PasswordEntry } from '../services/StorageService';
import { CryptoService } from '../services/CryptoService';
import { AIService } from '../services/AIService';
import EditPasswordModal from './EditPasswordModal';

interface PasswordListProps {
  passwords: PasswordEntry[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<PasswordEntry>) => void;
  masterKey: string;
}

const PasswordList: React.FC<PasswordListProps> = ({ passwords, onDelete, onUpdate, masterKey }) => {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string>('');

  const togglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = async (text: string, id: string, type: 'username' | 'password' | 'url') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(`${id}-${type}`);
      setTimeout(() => setCopiedId(''), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getPasswordStrength = (password: string) => {
    return AIService.analyzePasswordStrength(password);
  };

  const getPasswordAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return { text: `${diffDays} days`, color: 'text-green-400' };
    if (diffDays < 90) return { text: `${Math.floor(diffDays / 30)} months`, color: 'text-yellow-400' };
    return { text: `${Math.floor(diffDays / 365)} years`, color: 'text-red-400' };
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      social: '👥',
      email: '📧',
      banking: '🏦',
      shopping: '🛒',
      work: '💼',
      entertainment: '🎮',
      other: '🔐'
    };
    return icons[category.toLowerCase()] || '🔐';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      social: 'bg-blue-500/20 text-blue-300',
      email: 'bg-green-500/20 text-green-300',
      banking: 'bg-red-500/20 text-red-300',
      shopping: 'bg-purple-500/20 text-purple-300',
      work: 'bg-orange-500/20 text-orange-300',
      entertainment: 'bg-pink-500/20 text-pink-300',
      other: 'bg-gray-500/20 text-gray-300'
    };
    return colors[category.toLowerCase()] || 'bg-gray-500/20 text-gray-300';
  };

  if (passwords.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-white mb-2">No passwords stored yet</h3>
        <p className="text-blue-200">Add your first password to get started with SecureVault</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {passwords.map((password) => {
          const strength = getPasswordStrength(password.password);
          const age = getPasswordAge(password.createdAt);
          const isPasswordVisible = visiblePasswords.has(password.id);

          return (
            <div
              key={password.id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCategoryIcon(password.category)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white truncate max-w-32">
                      {password.website}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(password.category)}`}>
                      {password.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingPassword(password)}
                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(password.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-blue-200 mb-1">Username</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm truncate flex-1">{password.username}</span>
                    <button
                      onClick={() => copyToClipboard(password.username, password.id, 'username')}
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Copy username"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    {copiedId === `${password.id}-username` && (
                      <span className="text-green-400 text-xs">Copied!</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-blue-200 mb-1">Password</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm flex-1 font-mono">
                      {isPasswordVisible ? password.password : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => togglePasswordVisibility(password.id)}
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      title={isPasswordVisible ? 'Hide password' : 'Show password'}
                    >
                      {isPasswordVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(password.password, password.id, 'password')}
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Copy password"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    {copiedId === `${password.id}-password` && (
                      <span className="text-green-400 text-xs">Copied!</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`text-xs ${strength.color} flex items-center space-x-1`}>
                      <div className={`w-2 h-2 rounded-full ${strength.color === 'text-red-400' ? 'bg-red-400' : strength.color === 'text-yellow-400' ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                      <span>{strength.label}</span>
                    </div>
                    {strength.score < 3 && (
                      <AlertTriangle className="h-3 w-3 text-amber-400" title="Weak password detected" />
                    )}
                  </div>
                </div>

                {password.url && (
                  <div>
                    <label className="block text-xs font-medium text-blue-200 mb-1">URL</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-300 text-sm truncate flex-1">{password.url}</span>
                      <button
                        onClick={() => copyToClipboard(password.url || '', password.id, 'url')}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <a
                        href={password.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Open website"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {copiedId === `${password.id}-url` && (
                        <span className="text-green-400 text-xs">Copied!</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center space-x-1 text-xs text-blue-300">
                    <Calendar className="h-3 w-3" />
                    <span className={age.color}>{age.text} old</span>
                  </div>
                  {password.notes && (
                    <span className="text-xs text-blue-300" title={password.notes}>
                      📝 Notes
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingPassword && (
        <EditPasswordModal
          password={editingPassword}
          onClose={() => setEditingPassword(null)}
          onSave={(updatedPassword) => {
            onUpdate(editingPassword.id, updatedPassword);
            setEditingPassword(null);
          }}
        />
      )}
    </>
  );
};

export default PasswordList;