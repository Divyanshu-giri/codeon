# CodeOn Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Application (Port 3000)                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ App.js (Main Container)                            │  │   │
│  │  ├─ FileTree (File Explorer)                          │  │   │
│  │  ├─ EditorTabs (Tab Management)                       │  │   │
│  │  ├─ CodeEditor (Monaco Editor)                        │  │   │
│  │  └─ SaveIndicator (Status Display)                    │  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ EditorContext (State Management)                    │  │   │
│  │  │ ├─ openFiles: []                                    │  │   │
│  │  │ ├─ activeFileId: String                             │  │   │
│  │  │ ├─ modifiedFiles: {}                                │  │   │
│  │  │ ├─ saveStatus: ready|saving|saved|error             │  │   │
│  │  │ └─ Auto-save Timer (2s debounce)                    │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  HTTP/REST (CORS Enabled)    │                                  │
│  Fetch API                   │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         POST /save       GET /file         DELETE/
         POST /batch-save  GET /project     PUT
         POST /project                    POST /create
              │                │                │
              └────────────────┼────────────────┘
                               ▼
        ┌──────────────────────────────────────────────┐
        │  Express.js Backend Server (Port 5000)       │
        │  ┌────────────────────────────────────────┐  │
        │  │ Routes                                 │  │
        │  ├─ /api/files/* - File operations       │  │
        │  │  ├─ Save file                          │  │
        │  │  ├─ Get file                           │  │
        │  │  ├─ Delete file                        │  │
        │  │  └─ Batch save                         │  │
        │  ├─ /api/projects/* - Project operations │  │
        │  │  ├─ Create project                     │  │
        │  │  ├─ Get projects                       │  │
        │  │  ├─ Update project                     │  │
        │  │  └─ Delete project                     │  │
        │  └─ /health - Health check                │  │
        │  ┌────────────────────────────────────────┐  │
        │  │ Middleware                             │  │
        │  ├─ CORS (corsOptions)                   │  │
        │  ├─ JSON Parser                          │  │
        │  └─ Error Handler                        │  │
        │  ┌────────────────────────────────────────┐  │
        │  │ Database Driver                        │  │
        │  └─ Mongoose ODM                         │  │
        │      MongoDB Connection Pool              │  │
        │  └────────────────────────────────────────┘  │
        └──────────────────────┬───────────────────────┘
                               │
              TCP Connection   │
              mongodb://...    │
                               ▼
        ┌──────────────────────────────────────────────┐
        │  MongoDB Database (Port 27017)               │
        │  ┌────────────────────────────────────────┐  │
        │  │ Database: codeon                       │  │
        │  │ ┌──────────────────────────────────┐   │  │
        │  │ │ Collection: files                │   │  │
        │  │ │ ├─ _id: ObjectId                 │   │  │
        │  │ │ ├─ id: String (unique)           │   │  │
        │  │ │ ├─ projectId: ObjectId           │   │  │
        │  │ │ ├─ name: String                  │   │  │
        │  │ │ ├─ content: String (file code)   │   │  │
        │  │ │ ├─ language: String              │   │  │
        │  │ │ ├─ parentId: String              │   │  │
        │  │ │ ├─ createdAt: Date               │   │  │
        │  │ │ └─ updatedAt: Date               │   │  │
        │  │ ├─ Indexes: id, projectId          │   │  │
        │  │ └──────────────────────────────────┘   │  │
        │  │ ┌──────────────────────────────────┐   │  │
        │  │ │ Collection: projects             │   │  │
        │  │ │ ├─ _id: ObjectId                 │   │  │
        │  │ │ ├─ name: String                  │   │  │
        │  │ │ ├─ userId: String                │   │  │
        │  │ │ ├─ files: [ObjectId]             │   │  │
        │  │ │ ├─ createdAt: Date               │   │  │
        │  │ │ └─ updatedAt: Date               │   │  │
        │  │ └──────────────────────────────────┘   │  │
        │  └────────────────────────────────────────┘  │
        │  Container: docker-codeon-mongodb            │
        │  Port: 27017                                 │
        └──────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. User Edits File (Auto-Save Flow)

```
User Types in Editor
        │
        ▼
CodeEditor onChange Event
        │
        ▼
updateFileContent(fileId, content)
        │
        ▼
Clear Previous Timer
        │
        ▼
Set New Timer (2000ms)
        │
        ▼
2 Seconds of Inactivity
        │
        ▼
autoSaveFile() Triggers
        │
        ▼
SaveIndicator Updates
Status: "saving" (yellow)
        │
        ▼
fileAPI.saveFile(fileData)
        │
        ▼
POST /api/files/save
        │
        ▼
Backend Validation
        │
        ▼
Mongoose Operations
        │
        ▼
MongoDB Stores File
        │
        ▼
Response Sent to Frontend
        │
        ▼
SaveIndicator Updates
Status: "saved" (green)
        │
        ▼
Auto Clears After 1.5s
Status: "ready" (gray)
```

### 2. User Opens File (Load Flow)

```
User Clicks File
in FileTree
        │
        ▼
openFile(fileId)
        │
        ▼
Find File in Local State
        │
        ▼
Add to openFiles Array
        │
        ▼
Set activeFileId
        │
        ▼
EditorTabs Component
Renders New Tab
        │
        ▼
CodeEditor Component
Receives ActiveFile Object
        │
        ▼
Monaco Editor Loads
File Content
        │
        ▼
Language Detection
from Filename
        │
        ▼
Syntax Highlighting
Applied
        │
        ▼
User Can Edit
```

### 3. Backend Processing (API Endpoint)

```
POST /api/files/save
        │
        ▼
Express Middleware
├─ CORS Check
├─ JSON Parse
└─ Validate Headers
        │
        ▼
Route Handler
        │
        ▼
Check if File Exists
        │
        ▼
IF EXISTS:
Update Document
← MongoDB Find & Update
        │
        ▼
IF NEW:
Create Document
← MongoDB Insert
← Add to Project
        │
        ▼
Save Response
        │
        ▼
Send JSON Response
        │
        ▼
Frontend Receives
Confirms Save
```

---

## Component Hierarchy

```
App
├── EditorProvider (Context)
│   ├── FileTree
│   │   └── TreeNode (recursive)
│   │       ├── Folder Items
│   │       └── File Items
│   │
│   ├── Editor Area
│   │   ├── EditorTabs
│   │   │   ├── Tab Item (per open file)
│   │   │   ├── File Icon
│   │   │   ├── Tab Name
│   │   │   ├── Modified Indicator (dot)
│   │   │   └── Close Button (X)
│   │   │
│   │   ├── SaveIndicator
│   │   │   ├── Save Button
│   │   │   ├── Status Dot
│   │   │   ├── Status Text
│   │   │   └── Offline Indicator
│   │   │
│   │   └── CodeEditor
│   │       └── Monaco Editor Instance
│   │           ├── Custom Theme
│   │           ├── Syntax Highlighting
│   │           ├── Minimap
│   │           └── Line Numbers
```

---

## State Management Flow

```
EditorContext
├── Files (Immutable Tree)
│   └── From initialFileSystem
│
├── OpenFiles Array
│   └── [{ id, name, content, language }, ...]
│
├── ActiveFileId
│   └── Currently edited file ID
│
├── ModifiedFiles Object
│   └── { fileId: true/false }
│
├── ProjectId
│   └── Current project reference
│
├── SaveStatus
│   └── "ready" | "saving" | "saved" | "error"
│
└── Functions
    ├── openFile(fileId)
    ├── closeFile(fileId)
    ├── setActiveFile(fileId)
    ├── updateFileContent(fileId, content)
    ├── saveFile(fileId)
    ├── saveAllFiles()
    ├── autoSaveFile(fileId, content)
    └── setProjectId(projectId)
```

---

## Network Communication

### Request-Response Cycle

```
Browser                 Express Server               MongoDB
   │                          │                            │
   │  POST /api/files/save    │                            │
   ├─────────────────────────►│                            │
   │  {id, projectId, ...}    │                            │
   │                          │  Mongoose Query            │
   │                          ├───────────────────────────►│
   │                          │  db.files.updateOne()      │
   │                          │                            │
   │                          │◄───────────────────────────┤
   │                          │  { acknowledged: true }    │
   │                          │                            │
   │◄─────────────────────────┤                            │
   │  { success: true,        │                            │
   │    file: {...} }         │                            │
   │                          │                            │
```

---

## Error Handling Flow

```
Error Occurs
      │
      ├─ Network Error
      │  └─ Set apiAvailable = false
      │     └─ Show "Offline" indicator
      │
      ├─ API Response Error
      │  └─ Log to console
      │     └─ Set saveStatus = "error"
      │        └─ Display error indicator (red)
      │
      ├─ Database Error
      │  └─ Error response from MongoDB
      │     └─ Express error handler
      │        └─ Return 500 response
      │
      └─ Validation Error
         └─ Invalid request data
            └─ Return 400 response
```

---

## File Sync Strategy

```
Local Memory          MongoDB (Cloud)
(React State)         (Persistent)
      │                    │
      │  File Opened       │
      ├───────────────────►│ (Load if needed)
      │                    │
      │  User Edits        │
      │  (Changes marked)  │
      │                    │
      │  2s Timer Fires    │
      │  Auto-Save Called  │
      ├───────────────────►│ (Save changes)
      │                    │
      │  Status Updated    │
      │  (Save indicator)  │
      │                    │
      └─── Every 2 seconds (while editing) ───┘
```

---

## Scalability Considerations for Phase 3

### Current Architecture (Phase 2)
```
┌─────────────┐        ┌──────────────┐        ┌──────────────┐
│   Browser   │────────│   Express    │────────│   MongoDB    │
│  (Multiple) │        │  (Single)    │        │  (Single)    │
└─────────────┘        └──────────────┘        └──────────────┘
```

### Future Architecture (Phase 3+)
```
┌─────────────────────────────────────────────────────────────┐
│              Load Balancer / API Gateway                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
    │Express │    │Express │    │Express │    │Express │
    │Server1 │    │Server2 │    │Server3 │    │Server4 │
    └───┬────┘    └───┬────┘    └───┬────┘    └───┬────┘
        │             │             │             │
        ├─────────────┼─────────────┼─────────────┤
        │             │             │             │
        └─────────────┼─────────────┘             │
                      │                           │
        ┌─────────────┴─────────┬─────────────────┤
        │                       │                 │
        ▼                       ▼                 ▼
    ┌─────────┐             ┌────────────┐   ┌─────────────┐
    │  Redis  │             │  MongoDB   │   │Docker Engine│
    │ (Cache) │             │ (Primary)  │   │ (Container) │
    └─────────┘             └────────────┘   └─────────────┘
```

---

## Summary

This architecture provides:
- ✅ Separation of concerns (Frontend, Backend, Database)
- ✅ Scalable API endpoints
- ✅ Persistent data storage
- ✅ Real-time sync via auto-save
- ✅ Error recovery and offline support
- ✅ Ready for Phase 3 terminal integration

**Ready for next phase!** 🚀
