const mongoose = require('mongoose')

const StudentSchema = new mongoose.Schema({
  // Personal Details
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  gender: { type: String },
  dob: { type: Date },

  address: { type: String },
  city: { type: String },

  // Course Details
  courseName: { type: String },
  courseCategory: { type: String },
  batchTiming: { type: String }, // e.g., "Morning", "Evening"
  startDate: { type: Date },

  // Feature Access Controls
  access: {
    dashboard: { type: Boolean, default: true },
    myCourses: { type: Boolean, default: true },
    myQR: { type: Boolean, default: true },
    attendance: { type: Boolean, default: true },
    playground: { type: Boolean, default: false },
    typingPractice: { type: Boolean, default: false },
    aiMockInterview: { type: Boolean, default: false },
    profile: { type: Boolean, default: true },
    settings: { type: Boolean, default: true }
  },

  // Account Status
  status: { 
    type: String, 
    default: "Active",
    enum: ["Active", "Inactive", "Graduated", "Suspended"] 
  },

  // Authentication
  passwordHash: { type: String }, // For direct portal login
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  supabaseId: { type: String }, // Keep for backward compatibility if needed

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', StudentSchema);
