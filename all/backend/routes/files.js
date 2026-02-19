const express = require('express');
const router = express.Router();
const File = require('../models/File');
const Project = require('../models/Project');

// Save or update a file
router.post('/save', async (req, res) => {
  try {
    const { id, projectId, name, path, content, type, language, parentId } = req.body;

    let file = await File.findOne({ id });

    if (file) {
      // Update existing file
      file.content = content;
      file.isModified = false;
      await file.save();
    } else {
      // Create new file
      file = new File({
        id,
        projectId,
        name,
        path,
        content,
        type,
        language,
        parentId,
        isModified: false,
      });
      await file.save();

      // Add file to project
      await Project.findByIdAndUpdate(projectId, { $push: { files: file._id } });
    }

    res.json({ success: true, file });
  } catch (error) {
    console.error('Save file error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single file
router.get('/:fileId', async (req, res) => {
  try {
    const file = await File.findOne({ id: req.params.fileId });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all files in a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const files = await File.find({ projectId: req.params.projectId });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a file
router.delete('/:fileId', async (req, res) => {
  try {
    const file = await File.findOneAndDelete({ id: req.params.fileId });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch save files
router.post('/batch-save', async (req, res) => {
  try {
    const { projectId, files } = req.body;

    if (!Array.isArray(files)) {
      return res.status(400).json({ error: 'files must be an array' });
    }

    const savedFiles = [];

    for (const fileData of files) {
      let file = await File.findOne({ id: fileData.id });

      if (file) {
        file.content = fileData.content;
        file.isModified = false;
        await file.save();
      } else {
        file = new File({
          ...fileData,
          projectId,
          isModified: false,
        });
        await file.save();

        // Add to project
        await Project.findByIdAndUpdate(projectId, { $push: { files: file._id } });
      }

      savedFiles.push(file);
    }

    res.json({ success: true, files: savedFiles });
  } catch (error) {
    console.error('Batch save error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
