const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');


router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/verify-otp', authController.verifyOtp);
router.post("/change-password", auth, authController.changePassword);

router.get(
  "/superadmin-profile",auth,authController.SuperadminProfile
);

router.post('/admincreate', auth,adminController.registerAdmin);
router.post('/adminlogin', adminController.loginAdmin);
router.get('/getAllAdmins', adminController.getAllAdmins);
router.get('/ActiveAdmins', adminController.ActiveAdmins);

router.delete('/deleteAdmins/:id', adminController.deleteAdmin);
router.post('/verifyotp', adminController.verifyOtp);
router.put('/updateAdmin/:id', auth, adminController.updateAdmin);
router.get('/adminlastLogin',auth, adminController.adminProfile);
router.post("/Admin-passwordChange", auth, adminController.AdminChangePassword);

module.exports = router;

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Y2JjOGNjN2IwMThmOGFlNzhjMGNhNSIsImlhdCI6MTc3NDk2MzExOSwiZXhwIjoxNzc1MDQ5NTE5fQ.ghhAg7-BDPBEo3gKsyXnRIUItbDk-JEENmrRjKPcSPU