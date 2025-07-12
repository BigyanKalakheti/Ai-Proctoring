const express = require('express');
const Exam = require('../models/Exam');
const auth = require('../middleware/auth');

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

// Get exam by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
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
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, duration, questions, status } = req.body;
    
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { title, description, duration, questions, status },
      { new: true }
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

module.exports = router;