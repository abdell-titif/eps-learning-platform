const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const { auth, isInstructor } = require('../middleware/auth');

// Get user's progress for all courses
router.get('/my-progress', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id })
      .populate('course', 'title description')
      .populate('exerciseAttempts.exercise', 'title type points');
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's progress for a specific course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    })
    .populate('course', 'title description')
    .populate('exerciseAttempts.exercise', 'title type points');

    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this course' });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all students' progress for a course (instructor only)
router.get('/course/:courseId/all', auth, isInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the user is the instructor of the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view progress for this course' });
    }

    const progress = await Progress.find({ course: req.params.courseId })
      .populate('user', 'name email')
      .populate('exerciseAttempts.exercise', 'title type points');

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark topic as completed
router.post('/course/:courseId/topic/:topicId/complete', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled in the course
    if (!course.enrolledStudents.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        course: req.params.courseId
      });
    }

    // Check if topic is already completed
    const existingTopic = progress.completedTopics.find(
      topic => topic.topicId === req.params.topicId
    );

    if (!existingTopic) {
      progress.completedTopics.push({
        topicId: req.params.topicId,
        completedAt: new Date()
      });

      // Check if all topics are completed
      const allTopicsCompleted = course.topics.every(topic =>
        progress.completedTopics.some(completed => completed.topicId === topic._id.toString())
      );

      if (allTopicsCompleted) {
        progress.status = 'completed';
      }

      await progress.save();
      res.json(progress);
    } else {
      res.json({ message: 'Topic already completed' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Grade practical exercise (instructor only)
router.post('/exercise/:exerciseId/grade', auth, isInstructor, async (req, res) => {
  try {
    const { userId, score } = req.body;
    const exercise = await Exercise.findById(req.params.exerciseId);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    const course = await Course.findById(exercise.course);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to grade this exercise' });
    }

    const progress = await Progress.findOne({
      user: userId,
      course: exercise.course
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found for this user' });
    }

    const attempt = progress.exerciseAttempts.find(
      attempt => attempt.exercise.toString() === exercise._id.toString()
    );

    if (attempt) {
      attempt.score = score;
      attempt.submittedAt = new Date();
      progress.totalScore = progress.exerciseAttempts.reduce(
        (sum, attempt) => sum + attempt.score,
        0
      );
      await progress.save();
      res.json(progress);
    } else {
      res.status(404).json({ message: 'Exercise attempt not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 