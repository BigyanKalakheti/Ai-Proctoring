const express = require('express');
const ExamResult = require('../models/ExamResult');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all results with pagination
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'all';

    const query = {};
    
    if (status !== 'all') {
      query.status = status;
    }

    const results = await ExamResult.find(query)
      .populate('userId', 'firstName lastName email photo department')
      .populate('examId', 'title description duration')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Filter by search after population
    let filteredResults = results;
    if (search) {
      filteredResults = results.filter(result => 
        result.userId.firstName.toLowerCase().includes(search.toLowerCase()) ||
        result.userId.lastName.toLowerCase().includes(search.toLowerCase()) ||
        result.userId.email.toLowerCase().includes(search.toLowerCase()) ||
        result.examId.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await ExamResult.countDocuments(query);

    res.json({
      results: filteredResults,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get result by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await ExamResult.findById(req.params.id)
      .populate('userId', 'firstName lastName email photo department')
      .populate('examId', 'title description duration questions');
      
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create result
router.post('/', auth, async (req, res) => {
  try {
    const { userId, examId, score, totalScore, violations, startTime, endTime, status } = req.body;
    
    const result = new ExamResult({
      userId,
      examId,
      score,
      totalScore,
      violations,
      startTime,
      endTime,
      status
    });

    await result.save();
    
    const populatedResult = await ExamResult.findById(result._id)
      .populate('userId', 'firstName lastName email photo department')
      .populate('examId', 'title description duration');

    res.status(201).json(populatedResult);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update result
router.put('/:id', auth, async (req, res) => {
  try {
    const { score, totalScore, violations, endTime, status } = req.body;
    
    const result = await ExamResult.findByIdAndUpdate(
      req.params.id,
      { score, totalScore, violations, endTime, status },
      { new: true }
    ).populate('userId', 'firstName lastName email photo department')
     .populate('examId', 'title description duration');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete result
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await ExamResult.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const totalResults = await ExamResult.countDocuments();
    const completedResults = await ExamResult.countDocuments({ status: 'completed' });
    const inProgressResults = await ExamResult.countDocuments({ status: 'in-progress' });
    const terminatedResults = await ExamResult.countDocuments({ status: 'terminated' });
    
    const violationsCount = await ExamResult.aggregate([
      { $unwind: '$violations' },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    res.json({
      totalResults,
      completedResults,
      inProgressResults,
      terminatedResults,
      totalViolations: violationsCount[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;