const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String
    // required: true // Made optional for now to allow creating topic first then uploading
  },
  videoPublicId: {
    type: String
  },
  description: {
    type: String
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  notes: [{
    url: String,
    publicId: String,
    name: String
  }],
  order: {
    type: Number,
    required: true
  },
  classDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Topic', TopicSchema);
