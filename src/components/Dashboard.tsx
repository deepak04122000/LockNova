import React, { useState, useEffect } from 'react';
import { Shield, Plus, Search, Settings, LogOut, BarChart3, Sparkles, Filter, Download, Upload } from 'lucide-react';
import PasswordList from './PasswordList';
import AddPasswordModal from './AddPasswordModal';
import AIAssistant from './AIAssistant';
import SecurityDashboard from './SecurityDashboard';
import { StorageService, PasswordEntry } from '../services/StorageService';

interface DashboardProps {
  masterKey: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ masterKey, onLogout }) => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [filteredPasswords, setFilteredPasswords] = useState<PasswordEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('passwords');

  useEffect(() => {
    loadPasswords();
  }, []);

  useEffect(() => {
    filterPasswords();
  }, [passwords, searchTerm, selectedCategory]);

  const loadPasswords = async () => {
    try {
      const decryptedPasswords = await StorageService.getDecryptedPasswords(masterKey);
      setPasswords(decryptedPasswords);
    } catch (error) {
      console.error('Failed to load passwords:', error);
    }
  };

  const filterPasswords = () => {
    let filtered = passwords;

    if (searchTerm) {
      filtered = filtered.filter(password =>
        password.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(password => password.category === selectedCategory);
    }

    setFilteredPasswords(filtered);
  };

  const handleAddPassword = async (passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'lastModified'>) => {
    try {
      await StorageService.addPassword(passwordData, masterKey);
      await loadPasswords();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add password:', error);
    }
  };

  const handleDeletePassword = async (id: string) => {
    try {
      await StorageService.deletePassword(id);
      await loadPasswords();
    } catch (error) {
      console.error('Failed to delete password:', error);
    }
  };

  const handleUpdatePassword = async (id: string, passwordData: Partial<PasswordEntry>) => {
    try {
      await StorageService.updatePassword(id, passwordData, masterKey);
      await loadPasswords();
    } catch (error) {
      console.error('Failed to update password:', error);
    }
  };

  const categories = ['all', ...Array.from(new Set(passwords.map(p => p.category)))];

  const exportData = () => {
    const dataStr = JSON.stringify(passwords, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `securevault-backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-400" />
              <h1 className="text-xl font-bold text-white">SecureVault</h1>
              <div className="hidden sm:flex items-center space-x-1 text-sm text-blue-200">
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                  {passwords.length} entries
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('passwords')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'passwords' 
                    ? 'bg-blue-500/30 text-blue-200' 
                    : 'text-blue-300 hover:text-blue-200'
                }`}
              >
                Passwords
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'security' 
                    ? 'bg-blue-500/30 text-blue-200' 
                    : 'text-blue-300 hover:text-blue-200'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-1" />
                Security
              </button>
              <button
                onClick={() => setShowAIAssistant(true)}
                className="p-2 text-purple-300 hover:text-purple-200 hover:bg-purple-500/20 rounded-lg transition-all duration-200"
                title="AI Assistant"
              >
                <Sparkles className="h-5 w-5" />
              </button>
              <button
                onClick={exportData}
                className="p-2 text-blue-300 hover:text-blue-200 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                title="Export Data"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'passwords' && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search passwords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent capitalize"
                >
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-slate-800 text-white">
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
              >
                <Plus className="h-5 w-5" />
                <span>Add Password</span>
              </button>
            </div>

            <PasswordList
              passwords={filteredPasswords}
              onDelete={handleDeletePassword}
              onUpdate={handleUpdatePassword}
              masterKey={masterKey}
            />
          </>
        )}

        {activeTab === 'security' && (
          <SecurityDashboard passwords={passwords} />
        )}
      </main>

      {showAddModal && (
        <AddPasswordModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddPassword}
        />
      )}

      {showAIAssistant && (
        <AIAssistant
          onClose={() => setShowAIAssistant(false)}
          passwords={passwords}
        />
      )}
    </div>
  );
};

export default Dashboard;