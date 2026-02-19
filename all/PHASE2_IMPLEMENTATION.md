# Phase 2: File Persistence Implementation Guide

## Overview
Phase 2 successfully implements file persistence and cloud storage for CodeOn. Files are now automatically saved to MongoDB when edited, and the system works seamlessly whether the backend is available or not.

## What Was Implemented

### 1. Backend Infrastructure ✅

#### Express.js Server (`backend/server.js`)
- RESTful API server running on port 5000
- CORS enabled for frontend communication
- MongoDB connection with Mongoose
- Health check endpoint for monitoring

#### Database Models
- **File Model** (`backend/models/File.js`)
  - Stores file content, metadata, and relationships
  - Tracks project ownership
  - Records creation and modification timestamps
  
- **Project Model** (`backend/models/Project.js`)
  - Organizes files into projects
  - Manages user ownership
  - Groups related files

#### REST API Routes

**File Management** (`backend/routes/files.js`)
```
POST   /api/files/save           - Save/update single file
GET    /api/files/:fileId        - Retrieve file content
GET    /api/files/project/:projectId - Get all project files
DELETE /api/files/:fileId        - Delete file
POST   /api/files/batch-save     - Save multiple files
```

**Project Management** (`backend/routes/projects.js`)
```
POST   /api/projects              - Create project
GET    /api/projects/user/:userId - List user projects
GET    /api/projects/:projectId   - Get project details
PUT    /api/projects/:projectId   - Update project
DELETE /api/projects/:projectId   - Delete project
```

### 2. Frontend Integration ✅

#### API Service Layer (`src/services/api.js`)
- Centralized API client for all backend communication
- Error handling with descriptive messages
- Support for batch operations
- Configurable API base URL via environment variables

#### Enhanced EditorContext (`src/context/EditorContext.js`)
- **Auto-save Functionality**: Saves files 2 seconds after last edit
- **Save Status Tracking**: ready, saving, saved, error states
- **Batch Save**: Save multiple modified files at once
- **Offline Support**: Works without backend availability
- **API Health Check**: Detects backend availability on startup

#### New Components

**SaveIndicator** (`src/components/SaveIndicator.jsx`)
- Shows real-time save status with visual indicator
- One-click save button for all modified files
- Displays offline mode when backend unavailable
- Color-coded status indicators:
  - Gray: Ready
  - Yellow: Saving
  - Green: Saved
  - Red: Error

### 3. MongoDB Database ✅

- MongoDB container running via Docker on port 27017
- Persistent storage for all files and projects
- Automatic indexing for fast queries
- Support for complex file hierarchies

## Key Features

### Auto-Save
- Files automatically save 2 seconds after you stop typing
- No need to manually hit save for every change
- Visual feedback shows save progress

### Resilience
- App works in offline mode if backend is unavailable
- Changes are preserved locally until sync is possible
- Graceful fallback to local-only mode

### Real-time Feedback
- Save indicator shows current sync status
- Loading animation during save operations
- Error notifications for failed saves

### Data Integrity
- MongoDB ensures no data loss
- Timestamps track when files were modified
- Complete audit trail of all changes

## Installation & Setup

### Prerequisites
```bash
# Install Node.js dependencies
npm install                    # Frontend
cd backend && npm install     # Backend
```

### Start Services

```bash
# Terminal 1: Start MongoDB
docker run -d --name codeon-mongodb -p 27017:27017 mongo:latest

# Terminal 2: Start Backend
cd backend && npm start        # Runs on http://localhost:5000

# Terminal 3: Start Frontend
npm start                      # Runs on http://localhost:3000
```

### Verify Setup
- Frontend loads at http://localhost:3000
- Backend health: `curl http://localhost:5000/health`
- MongoDB status: `docker ps | grep mongodb`

## Environment Configuration

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/codeon
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Usage Examples

### Save a File
```javascript
import { fileAPI } from './services/api';

await fileAPI.saveFile({
  id: 'file-123',
  projectId: 'proj-456',
  name: 'example.js',
  content: 'console.log("hello");',
  language: 'javascript'
});
```

### Get All Project Files
```javascript
const files = await fileAPI.getProjectFiles('proj-456');
```

### Batch Save Files
```javascript
await fileAPI.batchSaveFiles('proj-456', [
  { id: 'file-1', content: '...' },
  { id: 'file-2', content: '...' }
]);
```

## Architecture Diagram

```
┌─────────────────────┐
│   React Frontend    │
│   (Port 3000)       │
└──────────┬──────────┘
           │
    REST API (HTTP)
           │
    ┌──────▼──────────┐
    │ Express Backend │
    │  (Port 5000)    │
    └──────┬──────────┘
           │
    MongoDB Driver
           │
    ┌──────▼──────────┐
    │     MongoDB     │
    │  (Port 27017)   │
    │   in Docker     │
    └─────────────────┘
```

## Performance Considerations

- **Auto-save Delay**: 2-second debounce prevents excessive API calls
- **Batch Operations**: Reduces round-trips for multiple file saves
- **Database Indexing**: Fast queries for file retrieval
- **CORS Configuration**: Optimized for cross-origin requests

## Error Handling

### Offline Mode
- Auto-save attempts retry when backend becomes available
- Local changes persist across browser sessions
- Graceful UI degradation shows offline indicator

### API Errors
- Detailed error messages logged to console
- Failed saves marked with error status
- Retry capability through manual save button

### Database Errors
- Connection failures trigger offline mode
- Automatic reconnection attempts
- Status visible in SaveIndicator

## Testing

### Verify Connected Files
```bash
# Create a project
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","userId":"user1"}'

# Save a file
curl -X POST http://localhost:5000/api/files/save \
  -H "Content-Type: application/json" \
  -d '{"id":"test-file","projectId":"...","name":"test.js","content":"..."}'
```

### Monitor MongoDB
```bash
docker exec codeon-mongodb mongosh
> use codeon
> db.files.find().pretty()
```

## Next Steps → Phase 3

The foundation for Phase 3 (Virtual Terminal) is now in place:
- Backend infrastructure ready for container management
- Database schema supports runtime metadata
- API layer can handle code execution requests
- Frontend ready for terminal UI integration

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Backend not connecting | Verify `REACT_APP_API_URL` in .env matches backend |
| Files not saving | Check MongoDB: `docker ps \| grep mongodb` |
| Port already in use | Change PORT in backend/.env |
| CORS errors | Update CORS_ORIGIN in backend/.env |

---

**Status**: ✅ Phase 2 Complete | Ready for Phase 3 🚀
