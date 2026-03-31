const mongoose = require('mongoose');
const sessioncardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  session: { type: String },
   startDate: {
    type: String, 
  },
  endDate: {
    type: String, 
  },
   endTime: {
  type: String,
},
activeSession: { type: Boolean }
},{ timestamps: true });

module.exports = mongoose.model('sessionCard', sessioncardSchema);
