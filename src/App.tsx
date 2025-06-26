import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import { CryptoService } from './services/CryptoService';
import { StorageService } from './services/StorageService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterKey, setMasterKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const hasVault = StorageService.hasVault();
      if (!hasVault) {
        setIsLoading(false);
        return;
      }
      
      // Check if there's a valid session
      const sessionKey = sessionStorage.getItem('vault_session');
      if (sessionKey) {
        try {
          // Verify session key can decrypt a test entry
          const testData = StorageService.getEncryptedData();
          if (testData && testData.length > 0) {
            await CryptoService.decrypt(testData[0].encryptedPassword, sessionKey);
            setMasterKey(sessionKey);
            setIsAuthenticated(true);
          }
        } catch (error) {
          sessionStorage.removeItem('vault_session');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuthentication = (key: string) => {
    setMasterKey(key);
    setIsAuthenticated(true);
    sessionStorage.setItem('vault_session', key);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMasterKey('');
    sessionStorage.removeItem('vault_session');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-400 animate-pulse" />
          <div className="text-white text-lg">Loading SecureVault...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {!isAuthenticated ? (
        <AuthScreen onAuthenticate={handleAuthentication} />
      ) : (
        <Dashboard masterKey={masterKey} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;