const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { auth, isInstructor } = require('../middleware/auth');

// Get all exercises for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const exercises = await Exercise.find({ course: req.params.courseId });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get exercise by ID
router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create exercise (instructor only)
router.post('/', auth, isInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the user is the instructor of the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add exercises to this course' });
    }

    const exercise = new Exercise(req.body);
    await exercise.save();

    // Add exercise to course's topic if specified
    if (req.body.topicId) {
      const topic = course.topics.id(req.body.topicId);
      if (topic) {
        topic.exercises.push(exercise._id);
        await course.save();
      }
    }

    res.status(201).json(exercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update exercise (instructor only)
router.put('/:id', auth, isInstructor, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    const course = await Course.findById(exercise.course);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this exercise' });
    }

    Object.assign(exercise, req.body);
    await exercise.save();
    res.json(exercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete exercise (instructor only)
router.delete('/:id', auth, isInstructor, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    const course = await Course.findById(exercise.course);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this exercise' });
    }

    await exercise.remove();
    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit exercise answer
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Check if user is enrolled in the course
    const course = await Course.findById(exercise.course);
    if (!course.enrolledStudents.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Calculate score based on exercise type
    let score = 0;
    switch (exercise.type) {
      case 'multiple_choice':
        const selectedOption = exercise.options.find(opt => opt.text === req.body.answer);
        if (selectedOption && selectedOption.isCorrect) {
          score = exercise.points;
        }
        break;
      case 'true_false':
        if (req.body.answer === exercise.correctAnswer) {
          score = exercise.points;
        }
        break;
      case 'short_answer':
        if (req.body.answer.toLowerCase() === exercise.correctAnswer.toLowerCase()) {
          score = exercise.points;
        }
        break;
      case 'practical':
        // For practical exercises, instructors need to grade manually
        score = 0;
        break;
    }

    // Update progress
    let progress = await Progress.findOne({
      user: req.user._id,
      course: exercise.course
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        course: exercise.course
      });
    }

    // Add or update exercise attempt
    const existingAttempt = progress.exerciseAttempts.find(
      attempt => attempt.exercise.toString() === exercise._id.toString()
    );

    if (existingAttempt) {
      existingAttempt.score = score;
      existingAttempt.submittedAt = new Date();
      existingAttempt.answers = req.body.answers || [req.body.answer];
    } else {
      progress.exerciseAttempts.push({
        exercise: exercise._id,
        score,
        submittedAt: new Date(),
        answers: req.body.answers || [req.body.answer]
      });
    }

    // Update total score
    progress.totalScore = progress.exerciseAttempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );

    await progress.save();
    res.json({ score, totalScore: progress.totalScore });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 