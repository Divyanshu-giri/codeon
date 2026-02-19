import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fileAPI } from '../services/api';

const EditorContext = createContext(null);

// Sample file system structure (local fallback)
const initialFileSystem = {
  id: 'root',
  name: 'project',
  type: 'folder',
  children: [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      children: [
        {
          id: 'index-js',
          name: 'index.js',
          type: 'file',
          language: 'javascript',
          content: `// Welcome to CodeOn!\n// This is your main JavaScript file.\n\nfunction greet(name) {\n  return \`Hello, \${name}! Welcome to CodeOn.\`;\n}\n\nconsole.log(greet('Developer'));`
        },
        {
          id: 'app-js', 
          name: 'App.js',
          type:'file', 
          language:'javascript', 
          content:`import React from 'react';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello World</h1>\n      <p>Built with CodeOn - A powerful web-based code editor</p>\n    </div>\n  );\n}\n\nexport default App;`
        },
        {
          id:'styles-css', 
          name:'styles.css', 
          type:'file', 
          language:'css', 
          content:`/* Main Styles */\nbody {\n  padding: 20px;\n  background-color: #f5f5f5;\n}\nh1 { color: #333; }`
        }
      ]
    },
    {
      id:'public-folder',  
      name:'public',  
      type:'folder',  
      children:[{
         id:"index-html",  
         name:"index.html",  
         type:"file",  
         language:"html",  
         content:"<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <div id=\"root\"></div>\n</body>\n</html>"
       }]
     },
     {id:"readme-md",name:"README.md",type:"file",language:"markdown",
       content:"# My Project\n\nWelcome to my awesome project!"}
   ]
 };

export function EditorProvider({ children, accessToken }) {
 const [files] = useState(initialFileSystem);
 const [openFiles , setOpenFiles] = useState([]);
 const [activeFileId , setActiveFileId] = useState(null);
 const [modifiedFiles , setModifiedFiles] = useState({});
 const [projectId, setProjectId] = useState(null);
 const [saveStatus, setSaveStatus] = useState('ready'); // ready, saving, saved, error
 const autoSaveTimerRef = useRef(null);
 const [apiAvailable, setApiAvailable] = useState(false);

 // Check API availability on mount
 useEffect(() => {
   const checkAPI = async () => {
     try {
       const response = await fetch('http://localhost:5000/health');
       setApiAvailable(response.ok);
       console.log('✅ Backend API is available');
     } catch (error) {
       console.log('⚠️  Backend API not available - using local storage only');
       setApiAvailable(false);
     }
   };
   checkAPI();
 }, []);

 // Find a file by ID in the tree
 const findFileById=(node , targetId)=>{
   if(node.id===targetId)return node;
   if(node.children){
     for(const child of node.children){
       const found=findFileById(child , targetId);
       if(found)return found;
     }
   }
   return null;
 };

 // Open a file in a new tab
 const openFile=(fileId)=>{
   const file=findFileById(files , fileId);
   if(!file||file.type==='folder')return;

   // Check if already open
   if(!openFiles.find(f=>f.id===file.id)){
     setOpenFiles(prev=>[...prev,{...file}]);
   }
   setActiveFileId(fileId);
 };
 
 // Close a tab
 const closeFile=(fileId)=>{
   setOpenFiles(prev=>prev.filter(f=>f.id!==fileId));
   if(activeFileId===fileId){
     setActiveFileId(openFiles.length>1?openFiles[0].id:null);
   }
 };

 // Set active file
 const setActiveFile=(fileId)=>{
   setActiveFileId(fileId);
 };

 // Update file content
 const updateFileContent=(fileId, content)=>{
   setModifiedFiles(prev=>({...prev, [fileId]: true}));
   setOpenFiles(prev=>prev.map(f=>
     f.id===fileId?{...f, content}:f
   ));

   // Clear existing auto-save timer
   if (autoSaveTimerRef.current) {
     clearTimeout(autoSaveTimerRef.current);
   }

   // Set new auto-save timer (save after 2 seconds of inactivity)
   autoSaveTimerRef.current = setTimeout(() => {
     autoSaveFile(fileId, content);
   }, 2000);
 };

 // Auto-save file to backend
 const autoSaveFile = useCallback(async (fileId, content) => {
   if (!apiAvailable || !projectId) return;

   try {
     setSaveStatus('saving');
     const activeFile = openFiles.find(f => f.id === fileId);
     
     if (activeFile) {
       await fileAPI.saveFile({
         id: activeFile.id,
         projectId,
         name: activeFile.name,
         path: activeFile.name,
         content,
         type: 'file',
         language: activeFile.language || 'plaintext',
         parentId: null,
       });

       setModifiedFiles(prev => {
         const newModified = {...prev};
         delete newModified[fileId];
         return newModified;
       });

       setSaveStatus('saved');
       setTimeout(() => setSaveStatus('ready'), 1500);
     }
   } catch (error) {
     console.error('Auto-save error:', error);
     setSaveStatus('error');
   }
 }, [apiAvailable, projectId, openFiles]);

 // Manual save file (sync to backend)
 const saveFile = useCallback(async (fileId) => {
   if (!apiAvailable || !projectId) {
     // Clear modified flag even if API not available
     setModifiedFiles(prev => {
       const newModified = {...prev};
       delete newModified[fileId];
       return newModified;
     });
     return;
   }

   try {
     setSaveStatus('saving');
     const activeFile = openFiles.find(f => f.id === fileId);
     
     if (activeFile) {
       await fileAPI.saveFile({
         id: activeFile.id,
         projectId,
         name: activeFile.name,
         path: activeFile.name,
         content: activeFile.content,
         type: 'file',
         language: activeFile.language || 'plaintext',
         parentId: null,
       });

       setModifiedFiles(prev => {
         const newModified = {...prev};
         delete newModified[fileId];
         return newModified;
       });

       setSaveStatus('saved');
       setTimeout(() => setSaveStatus('ready'), 1500);
     }
   } catch (error) {
     console.error('Save error:', error);
     setSaveStatus('error');
   }
 }, [apiAvailable, projectId, openFiles]);

 // Batch save all modified files
 const saveAllFiles = useCallback(async () => {
   if (!apiAvailable || !projectId) return;

   try {
     setSaveStatus('saving');
     const filesToSave = Object.keys(modifiedFiles).map(fileId => {
       const file = openFiles.find(f => f.id === fileId);
       return file ? {
         id: file.id,
         name: file.name,
         path: file.name,
         content: file.content,
         type: 'file',
         language: file.language || 'plaintext',
         parentId: null,
       } : null;
     }).filter(Boolean);

     if (filesToSave.length > 0) {
       await fileAPI.batchSaveFiles(projectId, filesToSave);
       setModifiedFiles({});
       setSaveStatus('saved');
       setTimeout(() => setSaveStatus('ready'), 1500);
     }
   } catch (error) {
     console.error('Batch save error:', error);
     setSaveStatus('error');
   }
 }, [apiAvailable, projectId, modifiedFiles, openFiles]);

 const value={
   files,
   openFiles,
   activeFileId,
   modifiedFiles,
   projectId,
   saveStatus,
   openFile,
   closeFile,
   setActiveFile,
   updateFileContent,
   saveFile,
   saveAllFiles,
   findFileById,
   setProjectId,
   apiAvailable,
 };

 return(
   <EditorContext.Provider value={value}>
     {children}
   </EditorContext.Provider>
 );
}

export function useEditor(){
  const context=useContext(EditorContext);
  if(!context){
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}

export default EditorContext;
