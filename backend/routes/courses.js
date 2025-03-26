const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth, isInstructor } = require('../middleware/auth');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name email')
      .select('-enrolledStudents');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('topics.exercises');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create course (instructor only)
router.post('/', auth, isInstructor, async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      instructor: req.user._id
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update course (instructor only)
router.put('/:id', auth, isInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the user is the instructor of the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    Object.assign(course, req.body);
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete course (instructor only)
router.delete('/:id', auth, isInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the user is the instructor of the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await course.remove();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll in a course
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    course.enrolledStudents.push(req.user._id);
    await course.save();
    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add topic to course (instructor only)
router.post('/:id/topics', auth, isInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the user is the instructor of the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add topics to this course' });
    }

    course.topics.push(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 