// models/Violation.js
const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
    severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  type: {
    type: String,
    enum: [
      'no-face-detected',
      'multiple-faces',
      'unauthorized-face',
      'tab-switch',
      'window-blur',
      'fullscreen-exit',
      'speech-detected',
      'other'
    ],
  },
  evidenceUrl: {
    type: String, // Cloudinary URL or base64 string
  },
  description: {
    type: String,
    default: ''
  }
});



module.exports = mongoose.model('Violation', violationSchema);
