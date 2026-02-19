import React, { useState, useEffect } from 'react';
import { EditorProvider } from './context/EditorContext';
import FileTree from './components/FileTree';
import EditorTabs from './components/EditorTabs';
import CodeEditor from './components/CodeEditor';
import SaveIndicator from './components/SaveIndicator';
import Terminal from './components/Terminal';
import Auth from './components/Auth';
import { Terminal as TerminalIcon, LogOut } from 'lucide-react';

function App() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
    
    setLoading(false);
  }, []);

  const handleAuthSuccess = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setAccessToken(null);
  };

  if (loading) {
    return <div style={{ color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!user || !accessToken) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <EditorProvider accessToken={accessToken}>
      <div className="app-container">
        <FileTree />
        <div className="editor-area">
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <EditorTabs />
                <SaveIndicator />
                <button
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    color: isTerminalOpen ? '#007acc' : '#888',
                    cursor: 'pointer',
                    fontSize: '13px',
                    borderLeft: '1px solid #3c3c3c',
                    transition: 'color 0.2s',
                  }}
                  title="Toggle Terminal"
                >
                  <TerminalIcon size={16} />
                  Terminal
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px', borderLeft: '1px solid #3c3c3c' }}>
                <span style={{ color: '#ccc', fontSize: '12px' }}>Welcome, <strong>{user.username}</strong></span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'color 0.2s',
                  }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
            <CodeEditor />
          </div>
        </div>
      </div>
      <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} accessToken={accessToken} />
    </EditorProvider>
  );
}

export default App;
