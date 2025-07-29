const express = require('express');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const auth = require('../middleware/auth');
const userAuth = require('../middleware/userAuth')
const Violation = require('../models/Violation');

const router = express.Router();

// Get all exams with pagination
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'all';

    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      query.status = status;
    }

    const exams = await Exam.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Exam.countDocuments(query);

    res.json({
      exams,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// // Get exam by ID
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const exam = await Exam.findById(req.params.id);
//     if (!exam) {
//       return res.status(404).json({ message: 'Exam not found' });
//     }
//     res.json(exam);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// Get exam by ID (without correct answers)
router.get('/:id', userAuth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Convert to object and remove correctAnswer
    const sanitizedExam = exam.toObject();
    sanitizedExam.questions = sanitizedExam.questions.map(q => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });

    res.json(sanitizedExam);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Create exam
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, duration, questions, status } = req.body;
    
    const exam = new Exam({
      title,
      description,
      duration,
      questions,
      status: status || 'draft'
    });

    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update exam
// router.put('/:id', auth, async (req, res) => {
//   try {
//     const { title, description, duration, questions, status } = req.body;
    
//     const exam = await Exam.findByIdAndUpdate(
//       req.params.id,
//       { title, description, duration, questions, status },
//       { new: true }
//     );

//     if (!exam) {
//       return res.status(404).json({ message: 'Exam not found' });
//     }

//     res.json(exam);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, duration, questions, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (questions !== undefined) updateData.questions = questions;
    if (status !== undefined) updateData.status = status;

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Delete exam
router.delete('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// //submit exam
// router.post('/submit', userAuth, async (req, res) => {
//   try {
//     const userId = req.user._id; // From auth middleware
//     const { examId, answers, startTime, endTime } = req.body;

//     if (!examId || !answers || !startTime || !endTime) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     // Fetch exam to get questions and scoring info
//     const exam = await Exam.findById(examId);
//     if (!exam) {
//       return res.status(404).json({ message: 'Exam not found' });
//     }

//     // Calculate total possible score
//     const totalScore = exam.questions.reduce((acc, q) => acc + (q.points || 0), 0);

//     // Calculate user score
//     let score = 0;

//     // Build answers array with correctness info
//     const processedAnswers = answers.map(userAnswer => {
//       const question = exam.questions.id(userAnswer.questionId);
//       if (!question) {
//         // Invalid questionId in answers, skip or handle error
//         return null;
//       }

//       let isCorrect = false;

//       if (question.type === 'multiple-choice') {
//         isCorrect = question.correctAnswer === userAnswer.userAnswer;
//         if (isCorrect) score += question.points;
//       } else if (question.type === 'paragraph') {
//         // For paragraph, mark isCorrect false by default or do manual grading later
//         isCorrect = false;
//       }

//       return {
//         questionId: userAnswer.questionId,
//         userAnswer: userAnswer.userAnswer,
//         isCorrect
//       };
//     }).filter(a => a !== null); // Remove any invalid answers

//     // Create and save exam result
//     const examResult = new ExamResult({
//       userId,
//       examId,
//       score,
//       totalScore,
//       answers: processedAnswers,
//       violations: [], // No violations here, add separately if needed
//       startTime: new Date(startTime),
//       endTime: new Date(endTime),
//       status: 'completed' // Mark completed on submission
//     });

//     await examResult.save();

//     // Populate references for response
//     const populatedResult = await ExamResult.findById(examResult._id)
//       .populate('userId', 'firstName lastName email')
//       .populate('examId', 'title description duration');

//     res.status(201).json(populatedResult);

//   } catch (error) {
//     console.error('Error submitting exam:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


router.post('/submit', userAuth, async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const { examId, answers, startTime, endTime } = req.body;

    if (!examId || !answers || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Fetch exam to get questions and scoring info
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Calculate total possible score
    const totalScore = exam.questions.reduce((acc, q) => acc + (q.points || 0), 0);

    // Calculate user score and process answers
    let score = 0;
    const processedAnswers = answers.map(userAnswer => {
      const question = exam.questions.id(userAnswer.questionId);
      if (!question) {
        // Invalid questionId in answers, skip or handle error
        return null;
      }

      let isCorrect = false;
      if (question.type === 'multiple-choice') {
        isCorrect = question.correctAnswer === userAnswer.userAnswer;
        if (isCorrect) score += question.points;
      } else if (question.type === 'paragraph') {
        // Paragraph answers: set false by default, or implement manual grading later
        isCorrect = false;
      }

      return {
        questionId: userAnswer.questionId,
        userAnswer: userAnswer.userAnswer,
        isCorrect
      };
    }).filter(a => a !== null); // Remove invalid answers

    // Fetch all violations by this user for this exam
    const violations = await Violation.find({ user: userId, exam: examId });
    const violationIds = violations.map(v => v._id);

    // Create and save exam result
    const examResult = new ExamResult({
      userId,
      examId,
      score,
      totalScore,
      answers: processedAnswers,
      violations: violationIds,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'completed'
    });

    await examResult.save();

    // Populate references for response
    const populatedResult = await ExamResult.findById(examResult._id)
      .populate('userId', 'firstName lastName email')
      .populate('examId', 'title description duration')
      .populate('violations'); // Populate violations too if needed

    res.status(201).json(populatedResult);

  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;