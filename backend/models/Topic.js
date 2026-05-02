const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  keywords: [String],
  domain: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  feedback: { type: String, default: '' },
  similarityScore: { type: Number, default: 0 },
  isDuplicate: { type: Boolean, default: false },
  progressReports: [{
    report: String,
    date: { type: Date, default: Date.now },
    percentage: { type: Number, default: 0 }
  }],
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TopicSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Topic', TopicSchema);
