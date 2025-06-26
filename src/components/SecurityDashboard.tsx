import React from 'react';
import { Shield, AlertTriangle, Clock, Copy, RefreshCw, TrendingUp } from 'lucide-react';
import { PasswordEntry } from '../services/StorageService';
import { AIService } from '../services/AIService';

interface SecurityDashboardProps {
  passwords: PasswordEntry[];
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ passwords }) => {
  const getSecurityMetrics = () => {
    const totalPasswords = passwords.length;
    const weakPasswords = passwords.filter(p => AIService.analyzePasswordStrength(p.password).score < 3);
    const duplicates = AIService.findDuplicatePasswords(passwords);
    const oldPasswords = passwords.filter(p => {
      const daysSince = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 90;
    });

    const categoryDistribution = passwords.reduce((acc, password) => {
      acc[password.category] = (acc[password.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const securityScore = Math.max(0, Math.min(100, 
      100 - (weakPasswords.length * 20) - (duplicates.length * 15) - (oldPasswords.length * 10)
    ));

    return {
      totalPasswords,
      weakPasswords,
      duplicates,
      oldPasswords,
      categoryDistribution,
      securityScore
    };
  };

  const metrics = getSecurityMetrics();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 60) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Security Dashboard</h2>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <span className="text-blue-200">Security Analysis</span>
        </div>
      </div>

      {/* Security Score */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Overall Security Score</h3>
            <p className="text-blue-200">Based on password strength, uniqueness, and age</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(metrics.securityScore)}`}>
              {metrics.securityScore}
            </div>
            <div className="text-blue-200 text-sm">/100</div>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${getScoreBg(metrics.securityScore)}`}
            style={{ width: `${metrics.securityScore}%` }}
          ></div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{metrics.totalPasswords}</span>
          </div>
          <h3 className="text-blue-200 font-medium">Total Passwords</h3>
          <p className="text-xs text-blue-300 mt-1">Stored securely</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <span className="text-2xl font-bold text-red-400">{metrics.weakPasswords.length}</span>
          </div>
          <h3 className="text-blue-200 font-medium">Weak Passwords</h3>
          <p className="text-xs text-red-300 mt-1">Need strengthening</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Copy className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">{metrics.duplicates.length}</span>
          </div>
          <h3 className="text-blue-200 font-medium">Duplicate Passwords</h3>
          <p className="text-xs text-yellow-300 mt-1">Security risk</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-orange-400" />
            <span className="text-2xl font-bold text-orange-400">{metrics.oldPasswords.length}</span>
          </div>
          <h3 className="text-blue-200 font-medium">Old Passwords</h3>
          <p className="text-xs text-orange-300 mt-1">&gt;90 days old</p>
        </div>
      </div>

      {/* Security Issues */}
      {(metrics.weakPasswords.length > 0 || metrics.duplicates.length > 0 || metrics.oldPasswords.length > 0) && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span>Security Issues</span>
          </h3>
          <div className="space-y-4">
            {metrics.weakPasswords.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="text-red-300 font-medium mb-2">
                  Weak Passwords ({metrics.weakPasswords.length})
                </h4>
                <div className="space-y-2">
                  {metrics.weakPasswords.slice(0, 3).map((password) => (
                    <div key={password.id} className="flex items-center justify-between text-sm">
                      <span className="text-red-200">{password.website}</span>
                      <span className="text-red-400">
                        {AIService.analyzePasswordStrength(password.password).label}
                      </span>
                    </div>
                  ))}
                  {metrics.weakPasswords.length > 3 && (
                    <div className="text-red-300 text-xs">
                      +{metrics.weakPasswords.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {metrics.duplicates.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h4 className="text-yellow-300 font-medium mb-2">
                  Duplicate Passwords ({metrics.duplicates.length})
                </h4>
                <div className="space-y-2">
                  {metrics.duplicates.slice(0, 3).map((group, index) => (
                    <div key={index} className="text-sm text-yellow-200">
                      {group.length} accounts: {group.map(p => p.website).join(', ')}
                    </div>
                  ))}
                  {metrics.duplicates.length > 3 && (
                    <div className="text-yellow-300 text-xs">
                      +{metrics.duplicates.length - 3} more groups
                    </div>
                  )}
                </div>
              </div>
            )}

            {metrics.oldPasswords.length > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <h4 className="text-orange-300 font-medium mb-2">
                  Old Passwords ({metrics.oldPasswords.length})
                </h4>
                <div className="space-y-2">
                  {metrics.oldPasswords.slice(0, 3).map((password) => {
                    const daysSince = Math.floor((Date.now() - new Date(password.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={password.id} className="flex items-center justify-between text-sm">
                        <span className="text-orange-200">{password.website}</span>
                        <span className="text-orange-400">{daysSince} days old</span>
                      </div>
                    );
                  })}
                  {metrics.oldPasswords.length > 3 && (
                    <div className="text-orange-300 text-xs">
                      +{metrics.oldPasswords.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Distribution */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Password Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics.categoryDistribution).map(([category, count]) => {
            const categoryIcons: { [key: string]: string } = {
              social: '👥',
              email: '📧',
              banking: '🏦',
              shopping: '🛒',
              work: '💼',
              entertainment: '🎮',
              other: '🔐'
            };
            
            return (
              <div key={category} className="text-center">
                <div className="text-2xl mb-2">{categoryIcons[category] || '🔐'}</div>
                <div className="text-lg font-bold text-white">{count}</div>
                <div className="text-sm text-blue-200 capitalize">{category}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 text-green-400" />
          <span>Security Recommendations</span>
        </h3>
        <div className="space-y-3">
          {metrics.weakPasswords.length > 0 && (
            <div className="flex items-center space-x-3 text-blue-200">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Update {metrics.weakPasswords.length} weak password{metrics.weakPasswords.length > 1 ? 's' : ''} with stronger alternatives</span>
            </div>
          )}
          {metrics.duplicates.length > 0 && (
            <div className="flex items-center space-x-3 text-blue-200">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Replace {metrics.duplicates.length} duplicate password{metrics.duplicates.length > 1 ? 's' : ''} with unique ones</span>
            </div>
          )}
          {metrics.oldPasswords.length > 0 && (
            <div className="flex items-center space-x-3 text-blue-200">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span>Refresh {metrics.oldPasswords.length} password{metrics.oldPasswords.length > 1 ? 's' : ''} that are over 90 days old</span>
            </div>
          )}
          <div className="flex items-center space-x-3 text-blue-200">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Enable two-factor authentication where available</span>
          </div>
          <div className="flex items-center space-x-3 text-blue-200">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Regular security audits help maintain password hygiene</span>
          </div>
          {metrics.securityScore >= 80 && (
            <div className="flex items-center space-x-3 text-green-300">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Excellent! Your password security is well-maintained</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;