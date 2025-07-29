// const mongoose = require('mongoose');

// const examResultSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   examId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Exam',
//     required: true
//   },
//   score: {
//     type: Number,
//     required: true,
//     default: 0
//   },
//   totalScore: {
//     type: Number,
//     required: true
//   },
//   // 🔗 Reference to violations (not embedded)
//   violations: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Violation'
//   }],
//   startTime: {
//     type: Date,
//     required: true
//   },
//   endTime: {
//     type: Date,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['completed', 'in-progress', 'terminated'],
//     default: 'in-progress'
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('ExamResult', examResultSchema);

const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
}, { _id: false });

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
  answers: [answerSchema],
  violations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Violation'
  }],
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
