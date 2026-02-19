import { getBackendURL } from '../config/api.config';

const getAPIBaseURL = () => {
  const backendURL = getBackendURL();
  return `${backendURL}/api`;
};

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const fileAPI = {
  // Save a single file
  saveFile: async (fileData) => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/files/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(fileData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save file: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  },

  // Get a single file
  getFile: async (fileId) => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/files/${fileId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get file: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  },

  // Get all files in a project
  getProjectFiles: async (projectId) => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/files/project/${projectId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get project files: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project files:', error);
      throw error;
    }
  },

  // Delete a file
  deleteFile: async (fileId) => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/files/${fileId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Batch save files
  batchSaveFiles: async (projectId, files) => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/files/batch-save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ projectId, files }),
      });

      if (!response.ok) {
        throw new Error(`Failed to batch save files: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error batch saving files:', error);
      throw error;
    }
  },
};

export const projectAPI = {
  // Create a new project
  createProject: async (name, description = '', userId = 'default-user') => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, description, userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Get all projects for a user
  getUserProjects: async (userId = 'default-user') => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/projects/user/${userId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get projects: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Get a single project
  getProject: async (projectId) => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/projects/${projectId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get project: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (projectId, name, description) => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/projects/${projectId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (projectId) => {
    try {
      const response = await fetch(`${getAPIBaseURL()}/projects/${projectId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },
};
