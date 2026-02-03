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

  // Profile Details (New)
  profilePicture: { type: String, default: "" },
  headline: { type: String, default: "" },
  bio: { type: String, default: "" },
  
  socials: {
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    instagram: { type: String, default: "" }
  },

  education: [{
    degree: { type: String },
    institution: { type: String },
    year: { type: String }
  }],

  preferences: {
    emailUpdates: { type: Boolean, default: true },
    newCourseAlerts: { type: Boolean, default: false },
    assignmentNotifs: { type: Boolean, default: true }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', StudentSchema);
