import React from 'react';
import { useEditor } from '../context/EditorContext';
import { Save } from 'lucide-react';

const SaveIndicator = () => {
  const { saveStatus, apiAvailable, modifiedFiles, saveAllFiles, activeFileId, saveFile } = useEditor();

  const hasModifiedFiles = Object.keys(modifiedFiles).length > 0;

  const handleSave = () => {
    if (activeFileId && modifiedFiles[activeFileId]) {
      saveFile(activeFileId);
    } else if (hasModifiedFiles) {
      saveAllFiles();
    }
  };

  const statusColors = {
    ready: '#888',
    saving: '#f7df1e',
    saved: '#7ec699',
    error: '#f48771',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: '#1e1e1e',
        borderLeft: '1px solid #3c3c3c',
        color: '#cccccc',
        fontSize: '12px',
      }}
    >
      {!apiAvailable && (
        <div title="Backend not available - offline mode" style={{ color: '#f48771' }}>
          ⚠️ Offline
        </div>
      )}

      {apiAvailable && (
        <>
          <button
            onClick={handleSave}
            disabled={!hasModifiedFiles || saveStatus === 'saving'}
            title="Save all modified files"
            style={{
              background: 'none',
              border: 'none',
              cursor: hasModifiedFiles && saveStatus !== 'saving' ? 'pointer' : 'default',
              opacity: hasModifiedFiles && saveStatus !== 'saving' ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: hasModifiedFiles ? '#f7df1e' : '#888',
              padding: '0',
            }}
          >
            <Save size={14} />
            Save
          </button>

          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: statusColors[saveStatus],
              animation: saveStatus === 'saving' ? 'pulse 1s infinite' : 'none',
            }}
          />
          <span style={{ color: statusColors[saveStatus], fontSize: '11px' }}>
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Saved'}
            {saveStatus === 'ready' && 'Ready'}
            {saveStatus === 'error' && 'Error'}
          </span>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SaveIndicator;
