import React, { useEffect, useRef, useState } from 'react';
import { Terminal, X, Play, Square } from 'lucide-react';
import io from 'socket.io-client';
import { getWebSocketURL } from '../config/api.config';

const TerminalComponent = ({ isOpen, onClose, accessToken }) => {
  const terminalRef = useRef(null);
  const socketRef = useRef(null);
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('disconnected');
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    if (!isOpen) return;

    // Connect to WebSocket with auth token. Use relative URL in development so CRA proxy forwards to backend.
    const connectOptions = {
      query: {
        userId: 'default-user',
        token: accessToken,
      },
      transports: ['websocket'],
    };

    if (process.env.NODE_ENV === 'development') {
      socketRef.current = io('/', connectOptions);
    } else {
      const wsURL = getWebSocketURL();
      socketRef.current = io(wsURL, connectOptions);
    }

    socketRef.current.on('connect', () => {
      setStatus('connected');
      console.log('✅ Terminal connected');
      socketRef.current.emit('terminal:init');
    });

    socketRef.current.on('terminal:ready', (data) => {
      setOutput((prev) => prev + '\n📡 Terminal ready for code execution\n> ');
      setStatus('ready');
    });

    socketRef.current.on('terminal:status', (data) => {
      setOutput((prev) => prev + `\n[${data.status.toUpperCase()}] ${data.message}\n`);
    });

    socketRef.current.on('terminal:output', (data) => {
      if (data.output) {
        setOutput((prev) => prev + data.output);
      }
      if (data.error) {
        setOutput((prev) => prev + `\n❌ Error: ${data.error}\n`);
      }
      setOutput((prev) => prev + '\n> ');
      setIsRunning(false);
    });

    socketRef.current.on('terminal:error', (data) => {
      setOutput((prev) => prev + `\n❌ ${data.error}\n> `);
      setIsRunning(false);
    });

    socketRef.current.on('terminal:logs', (data) => {
      setOutput((prev) => prev + data.logs + '\n');
    });

    socketRef.current.on('disconnect', () => {
      setStatus('disconnected');
      setOutput((prev) => prev + '\n❌ Disconnected\n');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isOpen, accessToken]);

  const executeCode = () => {
    if (!input.trim() || isRunning || !socketRef.current) return;

    setIsRunning(true);
    setOutput((prev) => prev + `\n${input}\n`);
    setInput('');

    socketRef.current.emit('terminal:execute', {
      code: input,
      language: language,
    });
  };

  const stopExecution = () => {
    if (socketRef.current) {
      socketRef.current.emit('terminal:stop');
      setIsRunning(false);
    }
  };

  const clearTerminal = () => {
    setOutput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCode();
    }
  };

  if (!isOpen) return null;

  const statusColors = {
    connected: '#7ec699',
    ready: '#7ec699',
    running: '#f7df1e',
    disconnected: '#f48771',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '50%',
        height: '40%',
        backgroundColor: '#1e1e1e',
        borderTop: '2px solid #3c3c3c',
        borderLeft: '2px solid #3c3c3c',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: '#252526',
          borderBottom: '1px solid #3c3c3c',
          minHeight: '35px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <Terminal size={16} color="#dcb67a" />
          <span style={{ color: '#cccccc', fontSize: '13px', fontWeight: 600 }}>
            Terminal
          </span>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: statusColors[status],
              marginLeft: '8px',
            }}
          />
          <span style={{ color: '#888', fontSize: '11px' }}>{status}</span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isRunning}
            style={{
              padding: '4px 8px',
              backgroundColor: '#2d2d2d',
              color: '#cccccc',
              border: '1px solid #3c3c3c',
              borderRadius: '3px',
              fontSize: '11px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.5 : 1,
            }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="bash">Bash</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
          </select>

          <button
            onClick={clearTerminal}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '11px',
              padding: '4px 8px',
            }}
            title="Clear terminal"
          >
            Clear
          </button>

          <button
            onClick={isRunning ? stopExecution : executeCode}
            disabled={!input.trim() && !isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 12px',
              backgroundColor: isRunning ? '#d32f2f' : '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: !input.trim() && !isRunning ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              opacity: !input.trim() && !isRunning ? 0.5 : 1,
            }}
          >
            {isRunning ? (
              <>
                <Square size={12} /> Stop
              </>
            ) : (
              <>
                <Play size={12} /> Run
              </>
            )}
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px 8px',
            }}
            title="Close terminal"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Output */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px 16px',
          fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
          fontSize: '12px',
          color: '#d4d4d4',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          backgroundColor: '#1e1e1e',
        }}
      >
        {output || '📡 Initializing terminal...'}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #3c3c3c' }}>
        <textarea
          ref={(el) => {
            if (el && output.length > 0 && status === 'ready') {
              el.focus();
            }
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter code here... (Shift+Enter for multiline)"
          disabled={status !== 'ready'}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#2d2d2d',
            color: '#d4d4d4',
            border: '1px solid #3c3c3c',
            borderRadius: '3px',
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
            fontSize: '12px',
            resize: 'none',
            height: '60px',
            opacity: status !== 'ready' ? 0.5 : 1,
            cursor: status !== 'ready' ? 'not-allowed' : 'text',
          }}
        />
      </div>
    </div>
  );
};

export default TerminalComponent;
