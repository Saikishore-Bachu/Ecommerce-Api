const express = require('express')
const {
  newOder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controller/orderController')

const router = express.Router()

const { isAuthenticatedUser, authorizedRole } = require('../middleware/auth')

router.route('/order/new').post(isAuthenticatedUser, newOder)
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder)

router.route('/order/mime').post(isAuthenticatedUser, myOrders)

router
  .route('/admin/orders')
  .get(isAuthenticatedUser, authorizedRole('admin'), getAllOrders)

router
  .route('/admin/order/:id')
  .put(isAuthenticatedUser, authorizedRole('admin'), updateOrderStatus)
  .delete(isAuthenticatedUser, authorizedRole('admin'), deleteOrder)

module.exports = router
