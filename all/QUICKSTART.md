# 🚀 CodeOn Quick Start Guide

## What You Just Got

You now have a **fully functional web-based code editor** similar to VS Code with:
- ✅ Monaco Editor with syntax highlighting
- ✅ File tree explorer
- ✅ Multi-tab editing
- ✅ **MongoDB database** for file persistence
- ✅ **Auto-save** functionality
- ✅ Real-time sync indicator

## 📋 Running CodeOn

### Start All Services (Choose One Method)

#### Method 1: Using Separate Terminals (Recommended)

**Terminal 1 - MongoDB:**
```bash
docker run -d --name codeon-mongodb -p 27017:27017 mongo:latest
```

**Terminal 2 - Backend API:**
```bash
cd backend
npm install  # First time only
npm start    # Runs on http://localhost:5000
```

**Terminal 3 - Frontend:**
```bash
npm install  # First time only
npm start    # Runs on http://localhost:3000
```

#### Method 2: Quick Setup (All at once)
```bash
# One-liner to start everything
docker run -d --name codeon-mongodb -p 27017:27017 mongo:latest && \
cd backend && npm start &
npm start
```

### Verify Everything is Running

```bash
# Check Frontend
curl http://localhost:3000

# Check Backend
curl http://localhost:5000/health
# Should return: {"status":"Backend running"}

# Check MongoDB
docker ps | grep mongodb
```

## 🎯 Using CodeOn

1. **Open** http://localhost:3000 in your browser
2. **Click** any file in the left sidebar (Explorer) to open it
3. **Edit** code in the Monaco Editor
4. **Watch** as changes auto-save (2 seconds after you stop typing)
5. **See** save status in the bottom right corner

### Keyboard Shortcuts
- `Ctrl+S` - Save current file
- `Ctrl+/` - Comment/uncomment
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Ctrl+F` - Find
- `Ctrl+H` - Find and replace

## 📁 Project Structure

```
codeon/
├── frontend (React)
│   ├── src/
│   │   ├── components/      # UI Components
│   │   ├── context/         # State Management
│   │   └── services/        # API Calls
│   └── npm start            # Port 3000
│
├── backend (Node.js)
│   ├── models/              # Database Schemas
│   ├── routes/              # API Endpoints
│   └── npm start            # Port 5000
│
└── MongoDB (Docker)         # Port 27017
```

## 🔌 API Endpoints

### Save Files
```bash
curl -X POST http://localhost:5000/api/files/save \
  -H "Content-Type: application/json" \
  -d '{
    "id": "file-1",
    "projectId": "proj-1",
    "name": "example.js",
    "content": "console.log(\"hello\");",
    "language": "javascript"
  }'
```

### Get All Files
```bash
curl http://localhost:5000/api/files/project/proj-1
```

## 🐛 Troubleshooting

### "Cannot connect to backend"
```bash
# Check if backend is running
curl http://localhost:5000/health

# Restart backend
# Kill the process and run: cd backend && npm start
```

### "MongoDB connection error"
```bash
# Restart MongoDB
docker restart codeon-mongodb

# Or remove and recreate
docker rm -f codeon-mongodb
docker run -d --name codeon-mongodb -p 27017:27017 mongo:latest
```

### "Port 3000/5000 already in use"
```bash
# Find process using port
lsof -i :3000
lsof -i :5000

# Kill process
kill -9 <PID>
```

## 🔮 What's Next?

### Phase 3 (Coming Soon)
- Virtual terminal in the browser
- Run Python, JavaScript, C++ code directly
- Real-time output streaming
- Docker containers for isolation

### Phase 4 (Coming Later)
- User authentication
- Project sharing
- Real-time collaboration
- Complete security sandbox

## 📚 File Locations

- **Frontend source**: `src/` directory
- **Backend source**: `backend/` directory
- **Database config**: `backend/.env`
- **Frontend config**: `.env`
- **Documentation**: `README.md`, `PHASE2_IMPLEMENTATION.md`

## 💡 Pro Tips

1. **Auto-save**: Your files save automatically 2 seconds after you stop typing
2. **Offline mode**: Works without backend (but files won't sync to database)
3. **Multiple files**: Open as many files as you want in tabs
4. **Language support**: 20+ programming languages supported
5. **Monaco features**: All VS Code editor features are available

## 📞 Need Help?

Check these files for more info:
- `README.md` - Full project overview
- `PHASE2_IMPLEMENTATION.md` - Backend architecture
- `TODO.md` - Project roadmap

## ✨ Key Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Code Editing | ✅ | Monaco editor with 20+ languages |
| File Tree | ✅ | Expandable folder structure |
| Multi-tab | ✅ | Open multiple files |
| Auto-save | ✅ | Save after 2 seconds |
| Database | ✅ | MongoDB persistence |
| Terminal | 🚧 | Coming in Phase 3 |
| Auth | 📋 | Coming in Phase 4 |

---

**Happy Coding! 🎉**

Questions? Check the documentation or explore the code!
