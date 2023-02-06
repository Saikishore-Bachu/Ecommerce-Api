const Order = require('../models/orderModel')
const ErrorHandler = require('../utils/ErrorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const ApiFeatures = require('../utils/apiFeatures')
const Product = require('../models/productModel')

//create Order

exports.newOder = catchAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  })

  res.status(201).json({
    success: true,
    order,
  })
})

//get Single Order

exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email',
  )

  if (!order) {
    return next(new ErrorHandler('no order found', 400))
  }

  res.status(200).json({
    success: true,
    order,
  })
})

//get loggedin user order

exports.myOrders = catchAsyncError(async (req, res, next) => {
  console.log('hello')
  const orders = await Order.find({ user: req.user._id })

  res.status(200).json({
    success: true,
    orders,
  })
})

//get all order --admin
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  console.log('hello')
  const orders = await Order.find()

  let totalAmount = 0

  orders.forEach((order) => {
    totalAmount += order.totalPrice
  })

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  })
})

// update order status --Admin

exports.updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
 
  if (!order) {
    return next(new ErrorHandler('no order found', 400))
  }
  
  if (order.orderStatus === 'Delivered') {
    return next(new ErrorHandler('already delivered', 400))
  }

  order.orderItems.forEach(async (o) => {
    await updateStock(o.product, o.quantity)
  })

  order.orderStatus = req.body.status

  if (req.body.status === 'delivered') {
    order.deliveredAt = Date.now()
  }

  await order.save({ validateBeforeSave: false })
  res.status(200).json({
    success: true,
  })
})

async function updateStock(id, quantity) {
  const product = await Product.findById(id)
  product.Stock -= quantity
  await product.save({ validateBeforeSave: false })
}

// delete order status --Admin

exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    return next(new ErrorHandler('no order found', 400))
  }

  await order.remove()

  res.status(200).json({
    success: true,
  })
})
