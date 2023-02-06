const Product = require('../models/productModel')
const ErrorHandler = require('../utils/ErrorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const ApiFeatures = require('../utils/apiFeatures')
//Create Products -- Admin routes

exports.createProduct = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id
  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    product,
  })
})

//getAll Products
exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  // return next(new ErrorHandler('Product not Found', 400))

  const resultPerPage = 8

  const productCount = await Product.countDocuments()
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)
  const products = await apiFeature.query
  res.status(200).json({
    success: true,
    products,
    productCount,
  })
})

//Get Product Details

exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findByIdAndRemove(req.params.id)
  if (!product) {
    return next(new ErrorHandler('Product not Found', 404))
  }
  res.status(200).json({
    success: true,
    product,
  })
})

// update Product -- admin

exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ErrorHandler('Product not Found', 404))
  }

  product = await Product.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })
  res.status(200).json({
    success: true,
    product,
  })
})

//deleteProduct

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findByIdAndRemove(req.params.id)
  if (!product) {
    return next(new ErrorHandler('Product not Found', 404))
  }
  res.status(200).json({
    success: true,
    message: 'Product deleted',
  })
})

// create new Review or update the review

exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body

  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  }

  const product = await Product.findById(productId)
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString(),
  )
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (req.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment)
    })
  } else {
    product.reviews.push(review)
    product.numOfReviews = product.reviews.length
  }

  let = avg = 0

  product.reviews.forEach((rev) => {
    avg += rev.rating
  })

  product.ratings = avg / product.reviews.length

  await product.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true,
  })
})

//get all reviews of a product

exports.getProductReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id)

  if (!product) {
    return next(new ErrorHandler('Product not Found', 404))
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  })
})

exports.deleteProductReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId)

  if (!product) {
    return next(new ErrorHandler('Product not Found', 404))
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString(),
  )

  let = avg = 0

  reviews.forEach((rev) => {
    avg += rev.rating
  })

  const ratings = avg / product.reviews.length

  const numOfReviews = reviews.length

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    },
  )

  res.status(200).json({
    success: true,
  })
})
