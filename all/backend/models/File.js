const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['file', 'folder'],
      default: 'file',
    },
    language: {
      type: String,
      default: 'plaintext',
    },
    content: {
      type: String,
      default: '',
    },
    parentId: {
      type: String,
      default: null,
    },
    isModified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', FileSchema);
