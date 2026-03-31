const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  
  },
  email: {
    type: String,
    required: true,
  email: { type: String, required: true, index: false },
  },
  password: {
    type: String,
    required: true
  },
 role: {
    type: String,
    enum: ['superadmin'],
    default: 'superadmin'
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  lastLogin: {
  type: Date
},
lastLogin: {
  type: Date
},
previousLogin: {
  type: Date
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Admin', UserSchema);