import React, { useState } from 'react';
import { X, Sparkles, MessageCircle, Zap, Shield, RefreshCw, Copy } from 'lucide-react';
import { PasswordEntry } from '../services/StorageService';
import { AIService } from '../services/AIService';

interface AIAssistantProps {
  onClose: () => void;
  passwords: PasswordEntry[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, passwords }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'generate' | 'analyze'>('chat');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI security assistant. I can help you generate strong passwords, analyze your security posture, and answer questions about password security. How can I help you today?'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordOptions, setPasswordOptions] = useState({
    length: 16,
    includeSymbols: true,
    includeNumbers: true,
    includeUppercase: true,
    includeLowercase: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { role: 'user' as const, content: userInput };
    setChatMessages(prev => [...prev, newMessage]);
    setUserInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = AIService.generateSecurityResponse(userInput, passwords);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 1000);
  };

  const generatePassword = () => {
    const password = AIService.generatePassword(passwordOptions);
    setGeneratedPassword(password);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getSecurityInsights = () => {
    const totalPasswords = passwords.length;
    const weakPasswords = passwords.filter(p => AIService.analyzePasswordStrength(p.password).score < 3).length;
    const duplicates = AIService.findDuplicatePasswords(passwords);
    const oldPasswords = passwords.filter(p => {
      const daysSince = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 90;
    }).length;

    return {
      totalPasswords,
      weakPasswords,
      duplicates: duplicates.length,
      oldPasswords,
      securityScore: Math.max(0, Math.min(100, 100 - (weakPasswords * 20) - (duplicates.length * 15) - (oldPasswords * 10)))
    };
  };

  const insights = getSecurityInsights();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Security Assistant</h2>
              <p className="text-blue-200 text-sm">Your intelligent password security companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chat' 
                ? 'text-blue-200 border-b-2 border-blue-400' 
                : 'text-blue-300 hover:text-blue-200'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'generate' 
                ? 'text-blue-200 border-b-2 border-blue-400' 
                : 'text-blue-300 hover:text-blue-200'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Generate</span>
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'analyze' 
                ? 'text-blue-200 border-b-2 border-blue-400' 
                : 'text-blue-300 hover:text-blue-200'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Analyze</span>
          </button>
        </div>

        <div className="flex-1 p-6 overflow-hidden">
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-blue-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-blue-100 px-4 py-2 rounded-lg flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me about password security..."
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Password Generator</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-blue-200">Length: {passwordOptions.length}</label>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={passwordOptions.length}
                      onChange={(e) => setPasswordOptions(prev => ({ ...prev, length: Number(e.target.value) }))}
                      className="w-32"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-2 text-blue-200">
                      <input
                        type="checkbox"
                        checked={passwordOptions.includeUppercase}
                        onChange={(e) => setPasswordOptions(prev => ({ ...prev, includeUppercase: e.target.checked }))}
                        className="rounded"
                      />
                      <span>Uppercase Letters</span>
                    </label>
                    <label className="flex items-center space-x-2 text-blue-200">
                      <input
                        type="checkbox"
                        checked={passwordOptions.includeNumbers}
                        onChange={(e) => setPasswordOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                        className="rounded"
                      />
                      <span>Numbers</span>
                    </label>
                    <label className="flex items-center space-x-2 text-blue-200">
                      <input
                        type="checkbox"
                        checked={passwordOptions.includeSymbols}
                        onChange={(e) => setPasswordOptions(prev => ({ ...prev, includeSymbols: e.target.checked }))}
                        className="rounded"
                      />
                      <span>Symbols</span>
                    </label>
                    <label className="flex items-center space-x-2 text-blue-200">
                      <input
                        type="checkbox"
                        checked={passwordOptions.includeLowercase}
                        onChange={(e) => setPasswordOptions(prev => ({ ...prev, includeLowercase: e.target.checked }))}
                        className="rounded"
                      />
                      <span>Lowercase Letters</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={generatePassword}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
              >
                Generate Password
              </button>

              {generatedPassword && (
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-blue-200">Generated Password</label>
                    <button
                      onClick={() => copyToClipboard(generatedPassword)}
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="font-mono text-white bg-black/20 p-3 rounded border">
                    {generatedPassword}
                  </div>
                  <div className="mt-2">
                    {(() => {
                      const strength = AIService.analyzePasswordStrength(generatedPassword);
                      return (
                        <div className={`text-sm ${strength.color} flex items-center space-x-2`}>
                          <div className={`w-3 h-3 rounded-full ${strength.color === 'text-red-400' ? 'bg-red-400' : strength.color === 'text-yellow-400' ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                          <span>{strength.label} ({strength.score}/4)</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analyze' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Security Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-200">Security Score</span>
                      <span className={`font-bold ${insights.securityScore >= 80 ? 'text-green-400' : insights.securityScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {insights.securityScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          insights.securityScore >= 80 ? 'bg-green-400' : insights.securityScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${insights.securityScore}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-blue-200 mb-2">Total Passwords</div>
                    <div className="text-2xl font-bold text-white">{insights.totalPasswords}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="text-red-300 mb-2">Weak Passwords</div>
                    <div className="text-2xl font-bold text-red-400">{insights.weakPasswords}</div>
                    <div className="text-xs text-red-300 mt-1">Need strengthening</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="text-yellow-300 mb-2">Duplicate Passwords</div>
                    <div className="text-2xl font-bold text-yellow-400">{insights.duplicates}</div>
                    <div className="text-xs text-yellow-300 mt-1">Security risk</div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <div className="text-orange-300 mb-2">Old Passwords</div>
                    <div className="text-2xl font-bold text-orange-400">{insights.oldPasswords}</div>
                    <div className="text-xs text-orange-300 mt-1">Should be updated</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Security Recommendations</h4>
                  <div className="space-y-2 text-sm">
                    {insights.weakPasswords > 0 && (
                      <div className="flex items-center space-x-2 text-red-300">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span>Update {insights.weakPasswords} weak password{insights.weakPasswords > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {insights.duplicates > 0 && (
                      <div className="flex items-center space-x-2 text-yellow-300">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Replace {insights.duplicates} duplicate password{insights.duplicates > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {insights.oldPasswords > 0 && (
                      <div className="flex items-center space-x-2 text-orange-300">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>Refresh {insights.oldPasswords} old password{insights.oldPasswords > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {insights.securityScore >= 80 && (
                      <div className="flex items-center space-x-2 text-green-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Great job! Your password security is excellent</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;