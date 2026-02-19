import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, FileJson, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { useEditor } from '../context/EditorContext';

const FileIcon = ({ filename }) => {
  const ext = filename.split('.').pop();
  switch (ext) {
    case 'js':
    case 'jsx':
      return <FileCode size={16} color="#f7df1e" />;
    case 'json':
      return <FileJson size={16} color="#f7df1e" />;
    case 'html':
      return <FileCode size={16} color="#e34c26" />;
    case 'css':
      return <FileCode size={16} color="#264de4" />;
    case 'md':
      return <FileText size={16} color="#083fa1" />;
    default:
      return <FileText size={16} color="#888" />;
  }
};

const TreeNode = ({ node, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const { openFile, activeFileId } = useEditor();
  
  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      openFile(node.id);
    }
  };

  const isActive = node.id === activeFileId;

  return (
    <div>
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 8px',
          paddingLeft: `${depth * 16 + 8}px`,
          cursor: 'pointer',
          backgroundColor: isActive ? '#2a2d2e' : 'transparent',
          color: '#cccccc',
          fontSize: '13px',
          userSelect: 'none',
          transition: 'background-color 0.1s',
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = '#2a2d2e';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {node.type === 'folder' ? (
          <>
            {isExpanded ? (
              <ChevronDown size={14} color="#888" style={{ marginRight: 4 }} />
            ) : (
              <ChevronRight size={14} color="#888" style={{ marginRight: 4 }} />
            )}
            {isExpanded ? (
              <FolderOpen size={16} color="#dcb67a" style={{ marginRight: 6 }} />
            ) : (
              <Folder size={16} color="#dcb67a" style={{ marginRight: 6 }} />
            )}
          </>
        ) : (
          <FileIcon filename={node.name} style={{ marginRight: 6, marginLeft: 18 }} />
        )}
        <span style={{ 
          marginLeft: node.type === 'file' ? 0 : 0,
          opacity: 0.9 
        }}>
          {node.name}
        </span>
      </div>
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree = () => {
  const { files } = useEditor();

  return (
    <div
      style={{
        width: '250px',
        minWidth: '200px',
        backgroundColor: '#252526',
        borderRight: '1px solid #3c3c3c',
        overflow: 'auto',
        height: '100%',
      }}
    >
      <div
        style={{
          padding: '10px 16px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#bbbbbb',
          borderBottom: '1px solid #3c3c3c',
        }}
      >
        Explorer
      </div>
      <TreeNode node={files} />
    </div>
  );
};

export default FileTree;
