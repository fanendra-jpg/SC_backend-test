
const MarkingSetting = require('../models/markingSetting');
const Schoolerexam = require("../models/Schoolerexam");
const SessionCard = require('../models/sessioncard'); 
const moment = require("moment-timezone");

exports.createOrUpdateSettings = async (req, res) => {
  const {
    maxMarkPerQuestion,
    negativeMarking,
    totalquiz,
    totalnoofquestion,
    weeklyBonus,
    monthlyBonus,
    experiencePoint,
    maxdailyexperience,
    dailyExperience,
     deductions,
     bufferTime
  } = req.body;

  try {
    const userId = req.user._id;

    let setting = await MarkingSetting.findOne();

    if (!setting) {
      setting = new MarkingSetting({ createdBy: userId });
    } else {
      setting.createdBy = userId; 
    }

    // Update fields if provided
    if (maxMarkPerQuestion !== undefined) {
      setting.maxMarkPerQuestion = maxMarkPerQuestion;
    }

    if (negativeMarking !== undefined) {
      setting.negativeMarking = negativeMarking;
    }

    if (totalquiz !== undefined) {
      setting.totalquiz = totalquiz;
    }

    if (totalnoofquestion !== undefined) {
      setting.totalnoofquestion = totalnoofquestion;
    }

    if (weeklyBonus !== undefined) {
      setting.weeklyBonus = weeklyBonus;
    }

    if (monthlyBonus !== undefined) {
      setting.monthlyBonus = monthlyBonus;
    }
   
    if (experiencePoint !== undefined) {
      setting.experiencePoint = experiencePoint;
    }
    if (dailyExperience !== undefined) {
      setting.dailyExperience = dailyExperience;
    }
     if (deductions !== undefined) {
      setting.deductions = deductions;
    }
     if (maxdailyexperience !== undefined) {
      setting.maxdailyexperience = maxdailyexperience;
    }
     if (bufferTime !== undefined) {
      setting.bufferTime = bufferTime;
    }

    await setting.save();

    res.status(200).json({
      message: "Marking settings saved successfully.",
      setting,
    });

  } catch (err) {
    console.error("Error in createOrUpdateSettings:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const setting = await MarkingSetting.findOne().populate('createdBy', 'email');
    if (!setting) {
      return res.status(404).json({ message: "Marking settings not found." });
    }
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// exports.bufferTime = async (req, res) => {
//   try {
//     const { examId } = req.params;

//     if (!examId) {
//       return res.status(400).json({ message: "examId is required." });
//     }

//     // ✅ 1. Find the exam by ID
//     const exam = await Schoolerexam.findById(examId)
//       .select("ScheduleDate ScheduleTime");

//     if (!exam) {
//       return res.status(404).json({ message: "Exam not found." });
//     }

//     // ✅ 2. Get bufferTime from MarkingSetting
//     const setting = await MarkingSetting.findOne()
//       .select("bufferTime")

//     if (!setting) {
//       return res.status(404).json({ message: "Marking settings not found." });
//     }

//     // ✅ 3. Combine both results
//     res.status(200).json({
//       bufferTime: setting.bufferTime,
//       createdBy: setting.createdBy,
//       ScheduleDate: exam.ScheduleDate,
//       ScheduleTime: exam.ScheduleTime,
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



exports.bufferTime = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: "examId is required." });
    }

    const exam = await Schoolerexam.findById(examId)
      .select("ScheduleDate ScheduleTime ScheduleTitle ScheduleType createdAt updatedAt");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    const setting = await MarkingSetting.findOne()
      .select("bufferTime createdBy");

    if (!setting) {
      return res.status(404).json({ message: "Marking settings not found." });
    }

    const bufferDuration = setting.bufferTime * 60 * 1000;

    const dateString = `${exam.ScheduleDate} ${exam.ScheduleTime}`;
    const formatString = "DD-MM-YYYY HH:mm:ss";

    const givenTime = moment
      .tz(dateString, formatString, "Asia/Kolkata")
      .valueOf();

    res.status(200).json({
      bufferTime: setting.bufferTime,
      bufferDuration,
      serverNow: Date.now(),
      givenTime,              

      ScheduleDate: exam.ScheduleDate,
      ScheduleTime: exam.ScheduleTime,
      ScheduleTitle: exam.ScheduleTitle,
      ScheduleType: exam.ScheduleType,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      createdBy: setting.createdBy
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// exports.createSessionCard = async (req, res) => {
//   try {
//     const userId = req.user.id; 

//     const { session, startDate, endDate, endTime } = req.body;
//     if (!session || !startDate || !endDate) {
//       return res.status(400).json({
//         message: "session, startDate and endDate are required."
//       });
//     }
//     const newSession = await SessionCard.create({
//       userId,
//       session,
//       startDate,
//       endDate,
//       endTime
//     });

//     return res.status(201).json({
//       message: "Session created successfully",
//       data: newSession
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Something went wrong",
//       error: error.message
//     });
//   }
// };


exports.createSessionCard = async (req, res) => {
  try {
    const userId = req.user.id;

    const { session, startDate, endDate, endTime } = req.body;

    if (!session || !startDate || !endDate) {
      return res.status(400).json({
        message: "session, startDate and endDate are required."
      });
    }

    const existingSession = await SessionCard.findOne({ userId });

    let result;

    if (existingSession) {
      result = await SessionCard.findByIdAndUpdate(
        existingSession._id,
        {
          session,
          startDate,
          endDate,
          endTime,
          activeSession: true 
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Session updated successfully",
        data: result
      });

    } else {
      result = await SessionCard.create({
        userId,
        session,
        startDate,
        endDate,
        endTime,
        activeSession: true 
      });

      return res.status(201).json({
        message: "Session created successfully",
        data: result
      });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};


// exports.createSessionCard = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const { session, startDate, endDate, endTime } = req.body;

//     if (!session || !startDate || !endDate) {
//       return res.status(400).json({
//         message: "session, startDate and endDate are required."
//       });
//     }

//     const existingSession = await SessionCard.findOne({ userId });

//     let result;

//     if (existingSession) {
//       result = await SessionCard.findByIdAndUpdate(
//         existingSession._id,
//         {
//           session,
//           startDate,
//           endDate,
//           endTime
//         },
//         { new: true }
//       );

//       return res.status(200).json({
//         message: "Session updated successfully",
//         data: result
//       });

//     } else {
//       result = await SessionCard.create({
//         userId,
//         session,
//         startDate,
//         endDate,
//         endTime
//       });

//       return res.status(201).json({
//         message: "Session created successfully",
//         data: result
//       });
//     }

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Something went wrong",
//       error: error.message
//     });
//   }
// };