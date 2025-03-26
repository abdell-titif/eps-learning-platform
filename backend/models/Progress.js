const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedTopics: [{
    topicId: String,
    completedAt: Date
  }],
  exerciseAttempts: [{
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise'
    },
    score: Number,
    submittedAt: Date,
    answers: [String]
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Progress', progressSchema); 