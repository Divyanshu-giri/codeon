# CodeOn - A Powerful Web-Based Code Editor

CodeOn is a web-based code editor built with React and Monaco Editor (the same engine that powers VS Code). It provides a seamless coding experience with real-time file management, syntax highlighting, and persistent file storage.

## 🚀 Features Implemented

### Phase 1: The Core Editor ✅ COMPLETE
- **Monaco Editor**: Full-featured code editor with syntax highlighting for 20+ languages
- **File Tree**: Expandable sidebar with folder structure and file navigation
- **Multi-tab Editing**: Open multiple files simultaneously with tab switching
- **Unsaved Changes Indicator**: Visual indicator for modified files
- **React Context API**: Efficient state management for editor state

### Phase 2: File Persistence & Cloud Storage ✅ COMPLETE
- **Backend API**: Express.js server with REST endpoints
- **MongoDB Database**: Persistent storage for file metadata and content
- **Auto-save**: Automatic file saving after 2 seconds of inactivity
- **Manual Save**: Save button for immediate persistence
- **Batch Operations**: Save multiple files at once
- **Project Management**: Organize files by project
- **Offline Support**: Works even when backend is unavailable

### Phase 3: Virtual Terminal & Code Execution ✅ COMPLETE
- **Browser-based Terminal**: Full terminal UI in the web editor
- **Multi-language Support**: Execute 9 programming languages (JavaScript, Python, C, C++, Java, Ruby, PHP, Bash, Go)
- **Docker Containers**: Isolated execution environment per user
- **Real-time Output**: WebSocket streaming for instant results
- **Resource Limits**: Memory limits (512MB), CPU constraints, process limits
- **Execution Timeout**: 30-second timeout per execution
- **Container Pooling**: Reuse containers for <100ms startup time

### Phase 4: Security & Authentication ✅ COMPLETE (Part 1)
- **User Registration**: Create accounts with email and username
- **User Login**: Secure password verification with bcrypt
- **JWT Tokens**: 15-minute access tokens + 7-day refresh tokens
- **Protected API Routes**: All endpoints require authentication
- **Role-Based Access**: User/Admin role foundation
- **Session Persistence**: Auto-login on page refresh
- **Logout Functionality**: Clear tokens and session cleanup

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React.js + Monaco Editor + Socket.io Client |
| Backend | Node.js + Express + Socket.io |
| Database | MongoDB |
| Real-time Communication | WebSockets (Socket.io) |
| Containerization | Docker + Dockerode |
| Code Execution | Docker containers with 9 languages |
| Authentication | JWT (jsonwebtoken) + Bcrypt |
| Password Hashing | Bcryptjs (10 salt rounds) |
| Container Management | Dockerode API |

## 📦 Prerequisites

- Node.js (v14+)
- npm or yarn
- Docker (for MongoDB)

## 🎯 Getting Started

### 1. Start MongoDB

```bash
docker run -d --name codeon-mongodb -p 27017:27017 mongo:latest
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Start Backend Server

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### 4. Install Frontend Dependencies

```bash
npm install
```

### 5. Start Frontend

```bash
npm start
# Application runs on http://localhost:3000
```

## 📁 Project Structure

```
codeon/
├── backend/                 # Express.js backend
│   ├── models/             # MongoDB schemas (File, Project)
│   ├── routes/             # REST API routes
│   ├── .env               # Backend environment variables
│   └── server.js          # Express server entry point
├── src/
│   ├── components/         # React components
│   │   ├── CodeEditor.jsx
│   │   ├── EditorTabs.jsx
│   │   ├── FileTree.jsx
│   │   └── SaveIndicator.jsx
│   ├── context/           # React Context for state management
│   │   └── EditorContext.js
│   ├── services/          # API service layer
│   │   └── api.js
│   └── styles/            # CSS styles
├── .env                   # Frontend environment variables
└── package.json
```

## 🔌 API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (client-side)
- `GET /api/auth/me` - Get current user profile (protected)

### File Operations (Protected)
- `POST /api/files/save` - Save or update a file
- `GET /api/files/:fileId` - Get a single file
- `GET /api/files/project/:projectId` - Get all files in a project
- `DELETE /api/files/:fileId` - Delete a file
- `POST /api/files/batch-save` - Save multiple files at once

### Project Operations (Protected)
- `POST /api/projects` - Create a new project
- `GET /api/projects/user/:userId` - Get all user projects
- `GET /api/projects/:projectId` - Get project details
- `PUT /api/projects/:projectId` - Update project
- `DELETE /api/projects/:projectId` - Delete project

### Terminal & Code Execution (Protected)
- WebSocket: `ws://localhost:5000` - Terminal connection
- `terminal:init` - Initialize terminal session
- `terminal:execute` - Execute code with language
- `terminal:stop` - Stop running execution
- `terminal:logs` - Get execution logs

## 📝 Usage

### Getting Started
1. Visit http://localhost:3000
2. Register a new account or login
3. After authentication, you'll access the editor

### Editing Files
1. Click on a file in the Explorer (left sidebar) to open it
2. Edit the code in the Monaco Editor
3. Files auto-save after 2 seconds of inactivity
4. Use the Save button to manually save all modified files

### Using the Terminal
1. Click the **Terminal** button in the top-right
2. Select a programming language from the dropdown
3. Write your code in the terminal input
4. Click **Run** to execute the code
5. View output in real-time
6. Use **Stop** to terminate execution

### Supported Terminal Languages
- JavaScript (Node.js)
- Python 3
- Bash/Shell
- C (gcc)
- C++ (g++)
- Java (OpenJDK)
- Ruby
- PHP
- Go

### Managing Projects
- All files are organized by project
- Files are automatically synced to MongoDB
- Unsaved changes show as yellow dots on tabs

### Keyboard Shortcuts
All standard Monaco Editor shortcuts are supported:
- `Ctrl+S` / `Cmd+S` - Save
- `Ctrl+/` / `Cmd+/` - Comment/Uncomment
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo

## � Project Progress & Roadmap

### Completed Phases ✅
- **Phase 1**: Core Editor (Monaco, file tree, tabs)
- **Phase 2**: File Persistence (MongoDB, REST API, auto-save)
- **Phase 3**: Virtual Terminal (Docker, code execution, WebSockets)
- **Phase 4 Part 1**: Authentication (JWT, user registration, login)

### In Development 🚧
- **Phase 4 Part 2**: Rate Limiting (prevent abuse)
- **Phase 4 Part 3**: Audit Logging (security event tracking)
- **Phase 4 Part 4**: Data Encryption (at-rest encryption)

### Planned Features 📋
- Two-factor authentication (2FA)
- OAuth social login (Google, GitHub)
- Email verification
- Password reset workflow
- Advanced permission management
- Team collaboration features
- Code sharing and snippets
- Real-time collaborative editing

**Overall Progress: 80% Complete** (4 of 5 major phases)

## 📄 Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/codeon
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 🐛 Troubleshooting

### Backend not connecting
- Ensure MongoDB is running: `docker ps | grep mongodb`
- Check CORS_ORIGIN matches frontend URL
- Verify port 5000 is not in use

### Files not saving
- Open browser console (F12) to check for errors
- Verify backend is running: `curl http://localhost:5000/health`
- Check API URL in `.env` matches backend

### MongoDB connection errors
- Restart MongoDB: `docker restart codeon-mongodb`
- Check MongoDB logs: `docker logs codeon-mongodb`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Monaco Editor - VS Code's powerful text editor
- React.js - UI library
- Express.js - Minimalist web framework
- MongoDB - NoSQL database
- Docker - Container platform

---

**Status**: Phase 4 Part 1 Complete ✅ | Phase 4 Parts 2-4 Ready 🚀

**Version**: 1.0.0  
**Last Updated**: February 19, 2026  
**Built with**: React + Express + MongoDB + Docker
