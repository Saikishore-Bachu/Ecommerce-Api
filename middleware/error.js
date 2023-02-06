const ErrorHandler = require('../utils/ErrorHandler')

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.message = err.message || 'internal Server Error'

  //wrong mongoDb id error
  if (err.name === 'CastError') {
    const message = `Resouce not found, Invalid: ${err.path}`
    err = new ErrorHandler(message, 400)
  }

  //mongodb duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`
    err = new ErrorHandler(message, 400)
  }

  //wrong JWT error
  if (err.name === 'jsonwebtokenError') {
    const message = 'Json web token is invalid , Try again'
    err = new ErrorHandler(message, 400)
  }

  if (err.name === 'TokenExpireError') {
    const message = 'Json web token is Expired, Try again'
    err = new ErrorHandler(message, 400)
  }

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  })
}
