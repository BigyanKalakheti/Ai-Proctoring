// routes/violations.js
const express = require('express');
const router = express.Router();
const Violation = require('../models/Violation');
const userAuth = require('../middleware/userAuth');
const auth = require('../middleware/auth')
router.post('/', userAuth, async (req, res) => {
  try {
    const { examId,userId, type,severity, evidenceUrl, description } = req.body;
    const violation = new Violation({
      user: req.user._id, // from decoded token
      exam: examId,
      type,
      evidenceUrl,
      severity,
      description
    });
    await violation.save();
    res.status(201).json({ message: 'Violation recorded' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// router.get('/', userAuth, async (req, res) => {
//   try {
//     // Extract optional query parameters
//     const { userId, examId } = req.query;

//     // Build filter object dynamically
//     const filter = {};
//     if (userId) filter.user = userId;
//     if (examId) filter.exam = examId;

//     // Find violations matching filter and populate user and exam references
//     const violations = await Violation.find(filter)
//       .populate('user', 'firstName lastName email') // select needed fields only
//       .populate('exam', 'title duration')
//       .sort({ timestamp: -1 });  // most recent first

//     res.json({ violations });
//   } catch (err) {
//     console.error('Error fetching violations:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

router.get('/', auth, async (req, res) => {
  try {
    const { userId, examId, ids } = req.query;

    const filter = {};

    if (userId) filter.user = userId;
    if (examId) filter.exam = examId;

    if (ids) {
      // ids expected as comma-separated string of violation IDs
      const idsArray = ids.split(',').map(id => id.trim());
      filter._id = { $in: idsArray };
    }

    const violations = await Violation.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('exam', 'title duration')
      .sort({ timestamp: -1 });

    res.json({ violations });
  } catch (err) {
    console.error('Error fetching violations:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
