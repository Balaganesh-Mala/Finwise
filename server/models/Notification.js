const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'recipientModel' },
  recipientModel: { type: String, required: true, enum: ['Student', 'Trainer'], default: 'Student' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['system', 'course', 'assignment', 'alert'], default: 'system' },
  isRead: { type: Boolean, default: false },
  link: { type: String }, // Optional link to redirect
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
