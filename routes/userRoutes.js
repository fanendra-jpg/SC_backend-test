const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadMarksheetS3 = require("../middleware/marksheetUploadS3");
const User = require('../models/User');
const Admin = require('../models/admin');
const Admin1 = require('../models/admin1');
  
router.post('/signup', userController.signup);
router.put('/updateUser/:id', userController.updateUser);
router.post('/userlogin', userController.Userlogin);



router.post(
  "/complete-profile",
  auth,
  uploadMarksheetS3.fields([{ name: "marksheet", maxCount: 1 }]),
  userController.completeProfile
);



  // router.put(
  //   '/update-profile',
  //   auth,upload.fields([
  //     { name: 'aadharCard', maxCount: 1 },
  //     { name: 'marksheet', maxCount: 1 }
  //   ]),
  //   userController.updateProfile
  // );

  router.put(
  '/update-profile',
  auth,
  uploadMarksheetS3.fields([
    { name: 'marksheet', maxCount: 1 }
  ]),
  userController.updateProfile
);

  router.put('/updateProfileStatus',auth, userController.updateProfileStatus);
  router.get('/getUserProfile',auth, userController.getUserProfile);
   router.get("/marksheet",auth,userController.getUserMarksheetSecure);

   router.post('/send-reset-otp', userController.sendResetOTP);
   router.post('/login-with-otp',userController.loginWithOTP);
    router.post('/reset-password-after-otp',userController.resetPasswordAfterOTPLogin);


  router.get('/check', (req, res) => {
  return res.status(200).json({ response: true });
});


  router.post('/sendEmailverify', userController.SendEmailverifyOTP);
  router.post('/emailverifyotp', userController.EmailVerifyOtp);
  router.get('/UserSessionDetails',auth, userController.UserSessionDetails);
  router.get('/active-session-users', userController.getActiveSessionUsers);
  router.get('/getUserHistory', userController.getUserHistories );
  router.get('/userforAdmin',auth, userController.userforAdmin );
  router.get('/tempuserforAdmin',auth, userController.tempuserforAdmin );
  router.get("/user-states", userController.getStatesFromUsers);
  router.get("/user-cities", userController.getCitiesFromUsers);
router.get("/user-categories", userController.getCategoriesFromUsers);
router.get("/schoolershipstatus-filter",auth, userController.getAvailableSchoolershipStatus);
router.get("/user/:userId", userController.getUserById);
router.post("/user/save-fcm-token", auth,userController.saveFCMToken);
router.delete(
  "/user/examtypereset/:userId",userController.deleteUserExamData);

router.get(
  '/class-timeline',
  auth,
  userController.getClassTimeline
);

  router.get("/test-ses", userController.testSESEmail);




router.get('/verify-token', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: "no",
      message: "Token not provided properly."
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await Admin.findById(decoded.id);

    if (!user) {
      user = await Admin1.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        status: "no",
        message: "User not found. Token invalid."
      });
    }

    return res.status(200).json({
      status: "yes",
      message: "Token is valid.",
      userId: decoded.id,
      role: user.role
    });

  } catch (err) {
    console.error("Token verification failed:", err.message);

    return res.status(401).json({
      status: "no",
      message: "Token invalid or expired.",
      error: err.message
    });
  }
});


router.get('/Userverify-token', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: "no",
      message: "Token not provided properly."
    });
  }

  const token = authHeader.split(' ')[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        status: "no",
        message: "User not found."
      });
    }
    const isProfileComplete =
      user.firstName &&
      user.lastName &&
      user.mobileNumber &&
      user.email &&
      user.studentType &&
      user.className &&
      user.stateId &&
      user.cityId;

    if (!isProfileComplete) {
      return res.status(200).json({
        status: "no",
        message: "Token valid but profile incomplete.",
        userId: decoded.id
      });
    }

    return res.status(200).json({
      status: "yes",
      message: "Token is valid.",
      userId: decoded.id
    });

  } catch (err) {

    console.error("Token verification failed:", err.message);

    return res.status(401).json({
      status: "no",
      message: "Token invalid or expired.",
      error: err.message
    });

  }

});

router.post("/Razorpay/create-payment", auth, userController.createRazorpayOrder);

router.post("/Razorpay/verify-payment", auth, userController.verifyRazorpayPayment);
router.get(
  "/payment-details/:orderId",
  auth,userController.PaymentDetailsByOrderId);

  router.get("/user-version", auth,userController.getUserVersion);
module.exports = router;

