const express = require('express')
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSignleUser,
  updateUserRole,
  deleteUser,
} = require('../controller/userController')
const { isAuthenticatedUser, authorizedRole } = require('../middleware/auth')
const router = express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)
router.route('/me').get(isAuthenticatedUser, getUserDetails)
router.route('/password/update').put(isAuthenticatedUser, updatePassword)
router.route('/me/updateProfile').put(isAuthenticatedUser, updateProfile)

router.route('/logout').post(logout)

//admin

router
  .route('/admin/users')
  .get(isAuthenticatedUser, authorizedRole('admin'), getAllUsers)

router
  .route('/admin/user/:id')
  .get(isAuthenticatedUser, authorizedRole('admin'), getSignleUser)
  .put(isAuthenticatedUser, authorizedRole('admin'), updateUserRole)
  .delete(isAuthenticatedUser, authorizedRole('admin'), deleteUser)

module.exports = router
