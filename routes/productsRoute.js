const express = require('express')
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReview,
  deleteProductReview,
} = require('../controller/productController')
const { isAuthenticatedUser, authorizedRole } = require('../middleware/auth')

const router = express.Router()

router.route('/products').get(getAllProducts)
router
  .route('/products/new')
  .post(isAuthenticatedUser, authorizedRole('admin'), createProduct)
router
  .route('/products/:id')
  .put(isAuthenticatedUser, authorizedRole('admin'), updateProduct)
  .delete(isAuthenticatedUser, deleteProduct)

router.route('/products/:id').get(getProductDetails)

router.route('/review').put(isAuthenticatedUser, createProductReview)
router
  .route('/reviews')
  .get(getProductReview)
  .delete(isAuthenticatedUser, deleteProductReview)

module.exports = router
