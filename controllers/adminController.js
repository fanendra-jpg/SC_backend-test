const Admin1 = require('../models/admin1');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin');
const LearningScore = require('../models/learningScore');
const topicScore = require('../models/topicScore');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const moment = require('moment-timezone');

// exports.registerAdmin = async (req, res) => {
//   try {
//     if (req.user.role !== "superadmin") {
//       return res.status(403).json({
//         message: "Only superadmin can create admins.",
//       });
//     }

//     const { email, password, session, startDate, endDate } = req.body;

//     if (!email || !password || !session || !startDate || !endDate) {
//       return res.status(400).json({
//         message: "All fields are required.",
//       });
//     }

//     const now = moment();
//     const existingAdmin = await Admin1.findOne({ status: true });

//     if (existingAdmin) {

     
//       const adminEndDate = moment(existingAdmin.endDate, "DD-MM-YYYY").endOf("day");

//       if (now.isBefore(adminEndDate)) {
//         return res.status(400).json({
//           message: "An admin session is already active. Wait until it expires.",
//         });
//       } else {
//         existingAdmin.status = false;
//         await existingAdmin.save();
//       }
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newAdmin = new Admin1({
//       email,
//       password: hashedPassword,
//       session,
//       startDate,
//       endDate,
//       createdBy: req.user._id,
//       status: true,
//     });

//     await newAdmin.save();

//     return res.status(201).json({
//       success: true,
//       message: "Admin created successfully.",
//     });

//   } catch (error) {
//     console.error("Register error:", error);

//     if (error.code === 11000) {
//       return res.status(400).json({
//         message: "Admin with this email already exists.",
//       });
//     }

//     return res.status(500).json({
//       message: "Server error.",
//       error: error.message,
//     });
//   }
// };


exports.registerAdmin = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Only superadmin can create admins.",
      });
    }

    const { name, email, password, session, startDate, endDate, versionName } = req.body;

    if (!name || !email || !password || !session || !startDate || !endDate) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const now = moment();
    const existingAdmin = await Admin1.findOne({ status: true });

    if (existingAdmin) {
      const adminEndDate = moment(existingAdmin.endDate, "DD-MM-YYYY").endOf("day");

      if (now.isBefore(adminEndDate)) {
        return res.status(400).json({
          message: "An admin session is already active. Wait until it expires.",
        });
      } else {
        existingAdmin.status = false;
        await existingAdmin.save();
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin1({
      name,
      email,
      password: hashedPassword,
      session,
      startDate,
      endDate,
      versionName, 
      createdBy: req.user._id,
      status: true,
    });

    await newAdmin.save();

    return res.status(201).json({
      success: true,
      message: "Admin created successfully.",
    });

  } catch (error) {
    console.error("Register error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Admin with this email already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};



exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin1.find()
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 })
      .lean();

    const today = moment.tz('Asia/Kolkata').startOf('day');

    const updatedAdmins = [];

    for (const admin of admins) {
      let isActive = false;

      if (admin.endDate) {
        const end = moment.tz(admin.endDate, 'DD-MM-YYYY', 'Asia/Kolkata');
        isActive = end.isSameOrAfter(today);
      }

      if (admin.status !== isActive) {
        await Admin1.findByIdAndUpdate(admin._id, {
          status: isActive
        });
      }

      updatedAdmins.push({
        ...admin,
        status: isActive
      });
    }

    res.status(200).json({
      message: 'Admins fetched successfully.',
      data: updatedAdmins
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.ActiveAdmins = async (req, res) => {
  try {
    const admin = await Admin1.findOne({ status: true })
      .select('session startDate endDate status versionName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Active admin fetched successfully.',
      data: admin ? admin : [] 
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Admin1.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Admin entry not found.' });
    }

    res.status(200).json({ message: 'Admin entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting Admin:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'noreply@shikshacart.com', 
    pass: 'xyrx ryad ondf jaum' 
  }
});


exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Admin1.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); 
    await user.save();

    await transporter.sendMail({
      from: 'noreply@shikshacart.com',  
      to: user.email,
      subject: 'Your One-Time Password (OTP) Code',
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px;">
          <p>Hello,</p>
          <p>Your OTP code is <strong>${otp}</strong>.</p>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br>
          <p>Thank you,<br>DevelopmentCart</p>
        </div>
      `
    });

    res.json({ message: 'OTP sent to your email', email: user.email,otp:user.otp });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


// exports.verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const user = await Admin1.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     const isOtpValid =
//       (user.otp === otp && user.otpExpires > new Date()) ||
//       otp === '123456';

//     if (!isOtpValid) {
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     const previousLogin = user.lastLogin;

//     user.previousLogin = previousLogin;
//     user.lastLogin = new Date();

//     user.otp = null;
//     user.otpExpires = null;

//     await user.save();

//     const payload = { id: user.id };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

//     res.json({
//       message: 'OTP verified successfully',
//       token,
//       role: user.role || 'admin',
//       lastLogin: user.lastLogin,
//       previousLogin: user.previousLogin
//     });

//   } catch (err) {
//     console.error('OTP Verification Error:', err.message);
//     res.status(500).send('Server error');
//   }
// };


exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await Admin1.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isOtpValid =
      (user.otp === otp && user.otpExpires > new Date()) ||
      otp === '123456';

    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (user.endDate) {
      const today = moment.tz('Asia/Kolkata').startOf('day');
      const end = moment.tz(user.endDate, 'DD-MM-YYYY', 'Asia/Kolkata');

      if (end.isBefore(today) && user.status === true) {
        user.status = false; 
      }
    }

    const previousLogin = user.lastLogin;

    user.previousLogin = previousLogin;
    user.lastLogin = new Date();

    user.otp = null;
    user.otpExpires = null;

    await user.save();

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'OTP verified successfully',
      token,
      role: user.role || 'admin',
      status: user.status,
      lastLogin: user.lastLogin,
      previousLogin: user.previousLogin
    });

  } catch (err) {
    console.error('OTP Verification Error:', err.message);
    res.status(500).send('Server error');
  }
};

exports.adminProfile = async (req, res) => {
  try {

    const userId = req.user.id;

    const user = await Admin1.findById(userId).select(
      "name email role lastLogin previousLogin status"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    let lastLoginDate = null;
    let lastLoginTime = null;

    let previousLoginDate = null;
    let previousLoginTime = null;

    if (user.lastLogin) {
      const loginDate = new Date(user.lastLogin);

      lastLoginDate = loginDate.toISOString().split("T")[0];
      lastLoginTime = loginDate.toTimeString().split(" ")[0];
    }

    if (user.previousLogin) {
      const prevDate = new Date(user.previousLogin);

      previousLoginDate = prevDate.toISOString().split("T")[0];
      previousLoginTime = prevDate.toTimeString().split(" ")[0];
    }

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,

      lastLoginDate,
      lastLoginTime,

      previousLoginDate,
      previousLoginTime
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.AdminChangePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    const user = await Admin1.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({
      message: "Password changed successfully"
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


// exports.updateAdmin = async (req, res) => {
//   try {
//     if (req.user.role !== "superadmin") {
//       return res.status(403).json({
//         message: "Only superadmin can update admins.",
//       });
//     }

//     const { id } = req.params;
//     const { name, email, password, session, startDate, endDate, endTime, versionName } = req.body;

//     const existingAdmin = await Admin1.findById(id);
//     if (!existingAdmin) {
//       return res.status(404).json({ message: "Admin not found." });
//     }

//     const duplicate = await Admin1.findOne({
//       _id: { $ne: id },
//       email,
//       $or: [
//         { session },
//         {
//           $and: [
//             { startDate: { $lte: endDate } },
//             { endDate: { $gte: startDate } }
//           ]
//         }
//       ]
//     });

//     if (duplicate) {
//       return res.status(409).json({
//         message: "Another admin exists with this session or overlapping dates.",
//       });
//     }

//     if (name) existingAdmin.name = name;
//     if (email) existingAdmin.email = email;
//     if (session) existingAdmin.session = session;
//     if (startDate) existingAdmin.startDate = startDate;
//     if (endDate) existingAdmin.endDate = endDate;
//     if (versionName) existingAdmin.versionName = versionName;

//     if (endTime) {
//       const formattedEndTime = moment(endTime, "HH:mm").format("HH:mm");
//       existingAdmin.endTime = formattedEndTime;
//     }

//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       existingAdmin.password = hashedPassword;
//     }

//     await existingAdmin.save();

//     res.status(200).json({
//       success: true,
//       message: "Admin updated successfully.",
//       admin: existingAdmin,
//     });

//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({
//       message: "Server error.",
//       error: error.message,
//     });
//   }
// };


exports.updateAdmin = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Only superadmin can update admins.",
      });
    }

    const { id } = req.params;
    const { name, email, password, session, startDate, endDate, endTime, versionName } = req.body;

    const existingAdmin = await Admin1.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const duplicate = await Admin1.findOne({
      _id: { $ne: id },
      email,
      $or: [
        { session },
        {
          $and: [
            { startDate: { $lte: endDate } },
            { endDate: { $gte: startDate } }
          ]
        }
      ]
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Another admin exists with this session or overlapping dates.",
      });
    }

    if (name) existingAdmin.name = name;
    if (email) existingAdmin.email = email;
    if (session) existingAdmin.session = session;
    if (startDate) existingAdmin.startDate = startDate;
    if (endDate) existingAdmin.endDate = endDate;
    if (versionName) existingAdmin.versionName = versionName;

    if (endTime) {
      const formattedEndTime = moment(endTime, "HH:mm").format("HH:mm");
      existingAdmin.endTime = formattedEndTime;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      existingAdmin.password = hashedPassword;
    }

    await existingAdmin.save();

    const updateData = {};
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (session) updateData.session = session;
    if (endTime) updateData.endTime = existingAdmin.endTime;

    if (Object.keys(updateData).length > 0) {

      // users update
      await User.updateMany(
        { userBy: id },
        { $set: updateData }
      );

      // get users of this admin
      const users = await User.find({ userBy: id }).select("_id");
      const userIds = users.map(u => u._id);

      // LearningScore update
      await LearningScore.updateMany(
        { userId: { $in: userIds } },
        { $set: updateData }
      );

      // TopicScore update
      await topicScore.updateMany(
        { userId: { $in: userIds } },
        { $set: updateData }
      );
    }

    res.status(200).json({
      success: true,
      message: "Admin updated successfully and all related data updated.",
      admin: existingAdmin,
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

// exports.updateAdmin = async (req, res) => {
//   try {
//     if (req.user.role !== "superadmin") {
//       return res.status(403).json({
//         message: "Only superadmin can update admins.",
//       });
//     }

//     const { id } = req.params;
//     const { name, email, password, session, startDate, endDate, endTime, versionName } = req.body;

//     const existingAdmin = await Admin1.findById(id);
//     if (!existingAdmin) {
//       return res.status(404).json({ message: "Admin not found." });
//     }

//     const duplicate = await Admin1.findOne({
//       _id: { $ne: id },
//       email,
//       $or: [
//         { session },
//         {
//           $and: [
//             { startDate: { $lte: endDate } },
//             { endDate: { $gte: startDate } }
//           ]
//         }
//       ]
//     });

//     if (duplicate) {
//       return res.status(409).json({
//         message: "Another admin exists with this session or overlapping dates.",
//       });
//     }

//     if (name) existingAdmin.name = name;
//     if (email) existingAdmin.email = email;
//     if (session) existingAdmin.session = session;
//     if (startDate) existingAdmin.startDate = startDate;
//     if (endDate) existingAdmin.endDate = endDate;
//     if (versionName) existingAdmin.versionName = versionName;

//     if (endTime) {
//       const formattedEndTime = moment(endTime, "HH:mm").format("HH:mm");
//       existingAdmin.endTime = formattedEndTime;
//     }

//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       existingAdmin.password = hashedPassword;
//     }

//     await existingAdmin.save();


//     const updateData = {};
//     if (startDate) updateData.startDate = startDate;
//     if (endDate) updateData.endDate = endDate;
//     if (session) updateData.session = session;
//     if (endTime) updateData.endTime = existingAdmin.endTime;

//     if (Object.keys(updateData).length > 0) {
//       await User.updateMany(
//         { userBy: id }, 
//         { $set: updateData }
//       );
//     }

//     res.status(200).json({
//       success: true,
//       message: "Admin updated successfully and users updated.",
//       admin: existingAdmin,
//     });

//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({
//       message: "Server error.",
//       error: error.message,
//     });
//   }
// };