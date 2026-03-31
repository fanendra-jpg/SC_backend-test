const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name:{  
  type: String
},
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  },
  session: {
    type: String,
    default: ''
  },
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  },
  status: {
    type: Boolean,
    default: true
  },
  previousLogin: {
  type: Date
},
versionName: {
      type: String,
      enum: ["live", "beta"],   
      required: true,
    },
  endTime: {
  type: String,
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
   createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', 
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Admin1', AdminSchema);
