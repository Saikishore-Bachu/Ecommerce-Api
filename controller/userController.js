const ErrorHandler = require('../utils/ErrorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const User = require('../models/userModel')
const sendToken = require('../utils/jwtToken')
const { Error } = require('mongoose')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
const { send } = require('process')

//user register

exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: 'This is a sample id',
      url: 'profileUrl',
    },
  })

  const token = user.getJWTToken()

  sendToken(user, 200, res)
})

//login user

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new ErrorHandler('Please enter email and Password', 400))
  }

  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new ErrorHandler('Invalid email or password', 401))
  }

  const isPasswordMatched = await user.comparePassword(password)

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Invalid email or password', 401))
  }
  sendToken(user, 200, res)
})

//Logout User

exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  })
  res.status(200).json({
    success: true,
    message: 'Logged out',
  })
})

//forgot password

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new ErrorHandler('user not found'), 404)
  }

  // get resetpasswordtoken

  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  const resetPasswordUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/password/reset/${resetToken}`

  const message = `your password reset token is :- \n\n ${resetPasswordUrl} \n\n if you have not requested this email then, please ignore it`

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce password recovery`,
      message,
    })

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    })
  } catch (err) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({ validateBeforeSave: false })

    return next(new ErrorHandler(err.message, 500))
  }
})

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  //creating token hash
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    return next(
      new ErrorHandler('Reset password token invalud or has been expired', 404),
    )
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match', 400))
  }

  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendToken(user, 200, res)
})

//get user Details

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    user,
  })
})

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword)
  if (!isPasswordMatched) {
    return next(new ErrorHandler('old password is incorrect', 400))
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match', 400))
  }

  user.password = req.body.newPassword
  await user.save()
  sendToken(user, 200, res)
})

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  }
  // we will add cloundary later

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })

  res.status(200).json({
    success: true,
  })
})

//Get All users -Admin
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find()

  res.status(200).json({
    success: true,
    users,
  })
})

//get single user (admin)

exports.getSignleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(
      new ErrorHandler(`user does not exist with id: ${req.params.id}`),
      404,
    )
  }

  res.status(200).json({
    success: true,
    user,
  })
})

//update user role -ADMIN
exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })

  res.status(200).json({
    success: true,
  })
})

//update user role- ADMIN
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  // we will add cloundary later

  const user = await User.findByIdAndUpdate(req.params.id)

  if (!user) {
    return next(
      new ErrorHandler(`user does not exist with id: ${req.params.id}`),
      404,
    )
  }

  await user.remove()

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  })
})
