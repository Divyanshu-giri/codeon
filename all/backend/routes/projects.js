const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const File = require('../models/File');

// Create a new project
router.post('/', async (req, res) => {
  try {
    const { name, description, userId } = req.body;

    const project = new Project({
      name,
      description,
      userId: userId || 'default-user',
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all projects for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.params.userId })
      .populate('files');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single project with all files
router.get('/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('files');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.put('/:projectId', async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { name, description },
      { new: true }
    ).populate('files');

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a project
router.delete('/:projectId', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete all files in project
    await File.deleteMany({ projectId: req.params.projectId });

    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
