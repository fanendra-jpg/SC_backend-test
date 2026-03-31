const mongoose = require('mongoose');

const userHistorySchema = new mongoose.Schema({
  originalUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clonedAt: { type: Date, default: Date.now },

  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  mobileNumber: { type: String },
  email: { type: String },
  VerifyEmail: { type: String, default: 'no' },
  password: { type: String },

  countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },

  pincode: { type: String },
  studentType: { type: String, enum: ['school', 'college', 'institute'] },
  instituteName: { type: String },

  className: { type: mongoose.Schema.Types.ObjectId, ref: 'Adminschool' },

  price: { type: Number },

  classOrYear: { type: String },

  schoolershipstatus: {
    type: String,
    enum: ["Participant", "Eliminated", "Finalist", "NA"],
    default: "NA"
  },

  category: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Schoolercategory" },
    name: String
  },

  session: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  endTime: { type: String },

  platformDetails: { type: String },

  marksheet: { type: String },

  resetPasswordOTP: { type: String },

  bonuspoint: { type: Number, default: 0 },

  bonusDates: [String],
  deductedDates: [String],
  weeklyBonusDates: [String],
  monthlyBonusDates: [String],

  userLevelData: [
    {
      level: Number,
      levelBonusPoint: { type: Number, default: 0 },
      data: [
        {
          date: String,
          data: Array,
          dailyExperience: Number,
          weeklyBonus: Number,
          monthlyBonus: Number,
          deduction: Number
        }
      ]
    }
  ],

  learning: [
    {
      learningId: { type: mongoose.Schema.Types.ObjectId, ref: "Learnings" },
      session: String,
      totalScore: Number,
      updatedAt: Date
    }
  ],

  learningDailyHistory: [
    {
      learningId: { type: mongoose.Schema.Types.ObjectId, ref: "Learnings" },
      name: String,
      date: String,
      score: Number,
      session: String,
      createdAt: Date
    }
  ],

  practice: [
    {
      learningId: { type: mongoose.Schema.Types.ObjectId, ref: "Learnings" },
      session: String,
      totalScore: Number,
      updatedAt: Date
    }
  ],

  practiceDailyHistory: [
    {
      learningId: { type: mongoose.Schema.Types.ObjectId, ref: "Learnings" },
      name: String,
      date: String,
      score: Number,
      session: String,
      createdAt: Date
    }
  ],

  strikeHistory: [
    {
      session: String,
      date: String,
      data: [
        {
          type: { type: String, enum: ["practice", "topic"] },
          score: Number,
          learningId: {
            _id: mongoose.Schema.Types.ObjectId,
            name: String
          },
          strickStatus: Boolean
        }
      ],
      dailyExperience: Number
    }
  ],

  strikeSessionSummary: [
    {
      session: String,
      totalDailyExperience: { type: Number, default: 0 },
      updatedAt: Date
    }
  ],

  level: { type: Number, default: 1 },

  status: {
    type: String,
    enum: ['no', 'yes'],
    default: 'no'
  },

  userDetails: [
    {
      category: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Schoolercategory" },
        name: String,
        examType: Array
      },
      examTypes: [
        {
          _id: String,
          name: String,
          status: {
            type: String,
            enum: ["Eligible", "Not Eligible", "NA"],
            default: "NA"
          },
          result: { type: String, default: "NA" },
          AttemptStatus: { type: String, default: "NA" },
          exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schoolerexam",
            default: null
          }
        }
      ]
    }
  ],

  paymentStatus: {
  type: Boolean
},
sessionStatus: {
  type: Boolean
},
  fcmToken: { type: String },

  adminStatus: { type: Boolean },

  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin1' },

  allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizationSign' },

  userBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin1' },

  resetPasswordExpires: { type: Date },

  createdAt: { type: Date },

  updatedAt: { type: Date }

});

module.exports = mongoose.model('UserHistory', userHistorySchema);