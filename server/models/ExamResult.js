const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['tab-switch', 'window-focus', 'face-not-detected', 'multiple-faces', 'phone-detected'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  evidence: {
    type: String
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const examResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  totalScore: {
    type: Number,
    required: true
  },
  violations: [violationSchema],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'terminated'],
    default: 'in-progress'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExamResult', examResultSchema);