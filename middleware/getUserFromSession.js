const SessionCard = require('../models/sessioncard');
const UserHistory = require('../models/UserHistory');
const User = require('../models/User');

const getUserFromSession = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let effectiveEndDate = null;
    const sessionData = await SessionCard.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (sessionData?.endDate) {
      effectiveEndDate = sessionData.endDate;
    }

    let user;

    if (effectiveEndDate) {
      const historyUser = await UserHistory.findOne({
        originalUserId: userId,
        endDate: effectiveEndDate
      }).sort({ createdAt: -1 });

      if (historyUser) {
        user = historyUser;
      } else {
        user = await User.findById(userId).lean();
      }
    } else {
      user = await User.findById(userId).lean();
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    req.userData = user;
    req.effectiveEndDate = effectiveEndDate;

    next();
  } catch (error) {
    console.error('Middleware Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = getUserFromSession;