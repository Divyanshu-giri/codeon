import React from 'react';
import { X, FileCode, FileJson, FileText } from 'lucide-react';
import { useEditor } from '../context/EditorContext';

const FileIcon = ({ filename }) => {
  const ext = filename.split('.').pop();
  switch (ext) {
    case 'js':
    case 'jsx':
      return <FileCode size={14} color="#f7df1e" />;
    case 'json':
      return <FileJson size={14} color="#f7df1e" />;
    case 'html':
      return <FileCode size={14} color="#e34c26" />;
    case 'css':
      return <FileCode size={14} color="#264de4" />;
    case 'md':
      return <FileText size={14} color="#083fa1" />;
    default:
      return <FileText size={14} color="#888" />;
  }
};

const EditorTabs = () => {
  const { openFiles, activeFileId, setActiveFile, closeFile, modifiedFiles } = useEditor();

  if (openFiles.length === 0) {
    return (
      <div
        style={{
          height: '35px',
          backgroundColor: '#252526',
          borderBottom: '1px solid #3c3c3c',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '16px',
          color: '#6e6e6e',
          fontSize: '13px',
        }}
      >
        No files open
      </div>
    );
  }

  return (
    <div
      style={{
        height: '35px',
        backgroundColor: '#252526',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      {openFiles.map((file) => {
        const isActive = file.id === activeFileId;
        const isModified = modifiedFiles[file.id];

        return (
          <div
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              height: '100%',
              backgroundColor: isActive ? '#1e1e1e' : '#2d2d2d',
              borderRight: '1px solid #3c3c3c',
              borderTop: isActive ? '2px solid #007acc' : '2px solid transparent',
              cursor: 'pointer',
              minWidth: '120px',
              maxWidth: '200px',
              transition: 'background-color 0.1s',
            }}
          >
            <FileIcon filename={file.name} />
            <span
              style={{
                marginLeft: '6px',
                fontSize: '13px',
                color: isActive ? '#ffffff' : '#bbbbbb',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
              }}
            >
              {file.name}
            </span>
            {isModified && (
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#e5c07b',
                  marginLeft: '6px',
                }}
              />
            )}
            <X
              size={14}
              color="#888"
              style={{ marginLeft: '6px', opacity: 0.7 }}
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file.id);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default EditorTabs;
